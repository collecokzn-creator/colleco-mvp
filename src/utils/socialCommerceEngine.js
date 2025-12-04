/**
 * Social Commerce - User Generated Content (UGC) System
 * 
 * Enables travelers and influencers to share travel content with shoppable tags,
 * earn commissions, and monetize their travel experiences.
 */

import { awardPoints } from './loyaltySystem';

/**
 * Create a new UGC post
 * @param {Object} params - Post parameters
 * @returns {Object} - Created post
 */
export function createUGCPost(params) {
  const {
    userId,
    title,
    description,
    mediaUrl,
    mediaType = 'photo', // photo, video, story
    destination,
    tags = [],
    shoppableItems = [],
    visibility = 'public', // public, private, friends
  } = params;

  if (!userId || !title || !mediaUrl) {
    return { success: false, error: 'Missing required fields' };
  }

  const post = {
    id: `ugc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    description,
    mediaUrl,
    mediaType,
    destination,
    tags,
    shoppableItems, // Array of { itemId, itemName, itemUrl, commissionRate }
    visibility,
    createdAt: new Date().toISOString(),
    engagement: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      conversions: 0,
    },
    monetization: {
      commissionRate: 0.05, // 5% default
      totalEarnings: 0,
      totalClicks: 0,
      totalConversions: 0,
    },
  };

  // Save to localStorage
  const key = `ugcPost:${post.id}`;
  localStorage.setItem(key, JSON.stringify(post));

  // Add to user's posts list
  addPostToUserProfile(userId, post.id);

  // Award points for content creation
  awardPoints(50, 'Created UGC post', { postId: post.id, destination }, userId);

  return { success: true, post };
}

/**
 * Add post to user's profile
 */
function addPostToUserProfile(userId, postId) {
  const key = `userUGCPosts:v1:${userId}`;
  let posts = [];

  try {
    const stored = localStorage.getItem(key);
    posts = stored ? JSON.parse(stored) : [];
  } catch (e) {
    posts = [];
  }

  posts.push({ postId, createdAt: new Date().toISOString() });

  // Keep last 100 posts
  posts = posts.slice(-100);

  localStorage.setItem(key, JSON.stringify(posts));
}

/**
 * Get user's UGC posts
 */
export function getUserUGCPosts(userId, limit = 50) {
  const key = `userUGCPosts:v1:${userId}`;

  try {
    const stored = localStorage.getItem(key);
    const posts = stored ? JSON.parse(stored) : [];

    return posts
      .map((p) => {
        const postKey = `ugcPost:${p.postId}`;
        const postData = localStorage.getItem(postKey);
        return postData ? JSON.parse(postData) : null;
      })
      .filter(Boolean)
      .reverse()
      .slice(0, limit);
  } catch (e) {
    return [];
  }
}

/**
 * Get social feed (all posts for discovery)
 */
export function getSocialFeed(userId, limit = 50) {
  const posts = [];

  // Get all posts from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('ugcPost:')) {
      try {
        const post = JSON.parse(localStorage.getItem(key));
        if (post && post.visibility === 'public') {
          posts.push(post);
        }
      } catch (e) {
        // Skip invalid posts
      }
    }
  }

  // Rank by engagement
  const ranked = posts
    .map((post) => {
      let score = 0;
      score += post.engagement.likes * 10;
      score += post.engagement.comments * 15;
      score += post.engagement.shares * 20;
      score += post.engagement.conversions * 50;

      // Recency boost
      const daysSinceCreated =
        (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 1) score *= 1.5;
      if (daysSinceCreated < 7) score *= 1.2;

      return { ...post, engagementScore: score };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);

  return ranked;
}

/**
 * Like a post
 */
export function likePost(postId, userId) {
  const key = `ugcPost:${postId}`;
  const post = getPost(postId);

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  // Check if already liked
  const likeKey = `ugcLike:${postId}:${userId}`;
  if (localStorage.getItem(likeKey)) {
    return { success: false, error: 'Already liked' };
  }

  post.engagement.likes++;
  localStorage.setItem(key, JSON.stringify(post));
  localStorage.setItem(likeKey, JSON.stringify({ timestamp: new Date().toISOString() }));

  // Award points to author
  awardPoints(5, 'Post liked', { postId }, post.userId);

  // Award points to liker
  awardPoints(1, 'Liked travel post', { postId }, userId);

  return { success: true, post };
}

/**
 * Comment on a post
 */
export function commentOnPost(postId, userId, comment) {
  const key = `ugcPost:${postId}`;
  const post = getPost(postId);

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  if (!comment || comment.trim().length === 0) {
    return { success: false, error: 'Empty comment' };
  }

  post.engagement.comments++;

  // Save comment
  const commentKey = `ugcComment:${postId}:${Date.now()}`;
  localStorage.setItem(
    commentKey,
    JSON.stringify({
      userId,
      text: comment,
      timestamp: new Date().toISOString(),
    })
  );

  localStorage.setItem(key, JSON.stringify(post));

  // Award points
  awardPoints(10, 'Commented on post', { postId }, userId);
  awardPoints(3, 'Received comment', { postId }, post.userId);

  return { success: true, post };
}

/**
 * Share a post
 */
export function sharePost(postId, userId, platform) {
  const post = getPost(postId);

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  post.engagement.shares++;

  const key = `ugcPost:${postId}`;
  localStorage.setItem(key, JSON.stringify(post));

  // Award points
  awardPoints(20, `Shared on ${platform}`, { postId, platform }, userId);
  awardPoints(5, `Post shared on ${platform}`, { postId, platform }, post.userId);

  return {
    success: true,
    shareUrl: `${window.location.origin}?post=${postId}&shared_by=${userId}`,
  };
}

/**
 * Click on shoppable item in post
 */
export function clickShoppableItem(postId, itemId, userId) {
  const post = getPost(postId);

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  post.engagement.clicks++;
  post.monetization.totalClicks++;

  const key = `ugcPost:${postId}`;
  localStorage.setItem(key, JSON.stringify(post));

  // Track click for analytics
  trackShoppableClick(postId, itemId, userId);

  return { success: true };
}

/**
 * Track a conversion from shoppable item
 */
export function trackShoppableConversion(postId, itemId, userId, bookingAmount) {
  const post = getPost(postId);

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  post.engagement.conversions++;
  post.monetization.totalConversions++;

  const item = post.shoppableItems.find((i) => i.itemId === itemId);
  if (item) {
    const commission = bookingAmount * item.commissionRate;
    post.monetization.totalEarnings += commission;

    const key = `ugcPost:${postId}`;
    localStorage.setItem(key, JSON.stringify(post));

    // Award points to creator (based on commission)
    const points = Math.round(commission / 10); // R10 = 1 point
    awardPoints(points, 'Earned from booking', { postId, itemId, commission }, post.userId);

    return { success: true, commission, points };
  }

  return { success: false, error: 'Item not found in post' };
}

/**
 * Track shoppable click (internal)
 */
function trackShoppableClick(postId, itemId, userId) {
  const key = `ugcClick:${postId}:${itemId}`;
  let clicks = [];

  try {
    const stored = localStorage.getItem(key);
    clicks = stored ? JSON.parse(stored) : [];
  } catch (e) {
    clicks = [];
  }

  clicks.push({ userId, timestamp: new Date().toISOString() });

  // Keep last 1000 clicks
  clicks = clicks.slice(-1000);

  localStorage.setItem(key, JSON.stringify(clicks));
}

/**
 * Get post by ID
 */
function getPost(postId) {
  const key = `ugcPost:${postId}`;

  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Get influencer earnings
 */
export function getInfluencerEarnings(userId) {
  const posts = getUserUGCPosts(userId, 1000);

  const totalEarnings = posts.reduce((sum, post) => sum + post.monetization.totalEarnings, 0);
  const totalClicks = posts.reduce((sum, post) => sum + post.monetization.totalClicks, 0);
  const totalConversions = posts.reduce(
    (sum, post) => sum + post.monetization.totalConversions,
    0
  );

  const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  // Calculate tier based on earnings
  let tier = 'Creator';
  if (totalEarnings > 50000) tier = 'Star Influencer';
  else if (totalEarnings > 20000) tier = 'Popular Creator';
  else if (totalEarnings > 5000) tier = 'Emerging Creator';

  return {
    totalEarnings: Math.round(totalEarnings),
    totalClicks,
    totalConversions,
    avgConversionRate: avgConversionRate.toFixed(1),
    avgEarningsPerPost: posts.length > 0 ? Math.round(totalEarnings / posts.length) : 0,
    tier,
    nextTierThreshold: {
      current: totalEarnings,
      next: tier === 'Creator' ? 5000 : tier === 'Emerging Creator' ? 20000 : 50000,
      remaining:
        tier === 'Creator'
          ? Math.max(0, 5000 - totalEarnings)
          : tier === 'Emerging Creator'
          ? Math.max(0, 20000 - totalEarnings)
          : tier === 'Popular Creator'
          ? Math.max(0, 50000 - totalEarnings)
          : 0,
    },
  };
}

/**
 * Get trip templates (pre-built itineraries created by influencers)
 */
export function createTripTemplate(params) {
  const {
    userId,
    title,
    description,
    destination,
    duration,
    attractions,
    accommodations,
    activities,
    estimatedCost,
    mediaUrl,
    tags = [],
    price = 0, // Cost to purchase template
  } = params;

  const template = {
    id: `template-${Date.now()}`,
    userId,
    title,
    description,
    destination,
    duration,
    attractions,
    accommodations,
    activities,
    estimatedCost,
    mediaUrl,
    tags,
    price,
    createdAt: new Date().toISOString(),
    bookings: 0,
    earnings: 0,
    rating: 0,
    reviews: 0,
  };

  // Save template
  const key = `tripTemplate:${template.id}`;
  localStorage.setItem(key, JSON.stringify(template));

  // Add to creator's templates
  addTemplateToCreator(userId, template.id);

  return { success: true, template };
}

/**
 * Add template to creator's profile
 */
function addTemplateToCreator(userId, templateId) {
  const key = `creatorTemplates:v1:${userId}`;
  let templates = [];

  try {
    const stored = localStorage.getItem(key);
    templates = stored ? JSON.parse(stored) : [];
  } catch (e) {
    templates = [];
  }

  templates.push(templateId);
  localStorage.setItem(key, JSON.stringify(templates));
}

/**
 * Browse trip templates
 */
export function browseTripTemplates(filters = {}) {
  const { destination = null, budgetMax = null, duration = null, search = null } = filters;

  const templates = [];

  // Get all templates
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tripTemplate:')) {
      try {
        const template = JSON.parse(localStorage.getItem(key));
        templates.push(template);
      } catch (e) {
        // Skip invalid templates
      }
    }
  }

  // Apply filters
  let filtered = templates;

  if (destination) {
    filtered = filtered.filter((t) => t.destination.toLowerCase().includes(destination.toLowerCase()));
  }

  if (budgetMax) {
    filtered = filtered.filter((t) => t.estimatedCost <= budgetMax);
  }

  if (duration) {
    filtered = filtered.filter((t) => t.duration === duration);
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.destination.toLowerCase().includes(term)
    );
  }

  // Sort by popularity
  return filtered.sort((a, b) => b.bookings - a.bookings);
}

/**
 * Purchase trip template
 */
export function purchaseTripTemplate(templateId, userId) {
  const key = `tripTemplate:${templateId}`;
  const template = localStorage.getItem(key);

  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  const parsed = JSON.parse(template);

  // Deduct points from user (if free) or charge (if paid)
  if (parsed.price > 0) {
    // TODO: Process payment
  }

  // Award creator
  if (parsed.price === 0) {
    // Free template - award 100 points for download
    awardPoints(100, 'Template downloaded', { templateId }, parsed.userId);
  } else {
    // Paid template - award commission (70/30 split)
    const commission = parsed.price * 0.7;
    awardPoints(Math.round(commission / 10), 'Sold trip template', { templateId, price: parsed.price }, parsed.userId);
  }

  // Track booking for creator
  parsed.bookings++;
  parsed.earnings += parsed.price * 0.7;
  localStorage.setItem(key, JSON.stringify(parsed));

  // Add to user's purchased templates
  addPurchasedTemplate(userId, templateId);

  return { success: true, template: parsed };
}

/**
 * Add purchased template to user
 */
function addPurchasedTemplate(userId, templateId) {
  const key = `userPurchasedTemplates:v1:${userId}`;
  let templates = [];

  try {
    const stored = localStorage.getItem(key);
    templates = stored ? JSON.parse(stored) : [];
  } catch (e) {
    templates = [];
  }

  templates.push({ templateId, purchasedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(templates));
}

/**
 * Get user's purchased templates
 */
export function getUserPurchasedTemplates(userId) {
  const key = `userPurchasedTemplates:v1:${userId}`;

  try {
    const stored = localStorage.getItem(key);
    const purchased = stored ? JSON.parse(stored) : [];

    return purchased
      .map((p) => {
        const templateKey = `tripTemplate:${p.templateId}`;
        const templateData = localStorage.getItem(templateKey);
        return templateData ? { ...JSON.parse(templateData), purchasedAt: p.purchasedAt } : null;
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}
