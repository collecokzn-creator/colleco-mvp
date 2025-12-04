/**
 * Personalization Engine for CollEco Travel
 * 
 * Implements ML-powered recommendations, user profiling, behavioral learning,
 * and personalized content delivery to increase conversion and AOV.
 */

/**
 * User behavior tracking constants
 */
export const USER_BEHAVIORS = {
  VIEW: 'view',
  SAVE: 'save',
  WISHLIST: 'wishlist',
  SHARE: 'share',
  BOOK: 'book',
  REVIEW: 'review',
};

/**
 * Get or create user profile
 * @param {string} userId - User ID
 * @returns {Object} - User profile
 */
export function getUserProfile(userId) {
  const key = `userProfile:v1:${userId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing user profile:', e);
    }
  }

  // Create new profile
  const profile = {
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelStyle: [],        // Beach, city, adventure, luxury, etc.
    preferredDestinations: [],
    budgetRange: { min: 0, max: 50000 },
    groupSize: 1,
    seasonalPreferences: {},
    accommodationType: [],  // Hotel, resort, airbnb, boutique
    propertyAmenities: [],  // Pool, gym, spa, wifi, etc.
    behaviorMetrics: {
      totalViews: 0,
      totalBookings: 0,
      avgBookingValue: 0,
      favoriteDestinations: [],
      frequentPartners: [],
      reviewCount: 0,
    },
  };

  saveUserProfile(profile);
  return profile;
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile, userId = null) {
  const id = userId || profile.userId;
  const key = `userProfile:v1:${id}`;

  profile.updatedAt = new Date().toISOString();

  try {
    localStorage.setItem(key, JSON.stringify(profile));
    return { success: true };
  } catch (e) {
    console.error('Error saving user profile:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Track user behavior (view, click, save, book, review)
 * @param {Object} params - Behavior parameters
 * @param {string} params.userId - User ID
 * @param {string} params.action - Action type (view, save, book, etc.)
 * @param {Object} params.metadata - Additional metadata
 */
export function trackUserBehavior(params) {
  const { userId, action, metadata = {} } = params;

  if (!userId || !action) {
    console.warn('Missing userId or action for behavior tracking');
    return { success: false };
  }

  try {
    const key = `userBehavior:v1:${userId}`;
    let behaviors = [];

    try {
      const stored = localStorage.getItem(key);
      behaviors = stored ? JSON.parse(stored) : [];
    } catch (e) {
      behaviors = [];
    }

    // Add new behavior
    behaviors.push({
      action,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 behaviors (prevent localStorage overflow)
    behaviors = behaviors.slice(-1000);

    localStorage.setItem(key, JSON.stringify(behaviors));

    // Update user profile based on behavior
    updateProfileFromBehavior(userId, action, metadata);

    return { success: true };
  } catch (e) {
    console.error('Error tracking behavior:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Update user profile based on behavior
 */
function updateProfileFromBehavior(userId, action, metadata) {
  const profile = getUserProfile(userId);

  switch (action) {
    case USER_BEHAVIORS.VIEW:
      if (metadata.travelStyle) {
        profile.travelStyle = Array.from(
          new Set([...profile.travelStyle, metadata.travelStyle])
        ).slice(-10);
      }
      if (metadata.destination) {
        const destinations = [...profile.preferredDestinations];
        const existing = destinations.find((d) => d.name === metadata.destination);
        if (existing) {
          existing.views = (existing.views || 0) + 1;
        } else {
          destinations.push({ name: metadata.destination, views: 1 });
        }
        profile.preferredDestinations = destinations.slice(-20);
      }
      profile.behaviorMetrics.totalViews++;
      break;

    case USER_BEHAVIORS.SAVE:
      if (metadata.destination) {
        const saved = profile.behaviorMetrics.favoriteDestinations || [];
        if (!saved.includes(metadata.destination)) {
          saved.push(metadata.destination);
        }
        profile.behaviorMetrics.favoriteDestinations = saved.slice(-10);
      }
      break;

    case USER_BEHAVIORS.BOOK:
      profile.behaviorMetrics.totalBookings++;
      if (metadata.bookingValue) {
        profile.behaviorMetrics.avgBookingValue =
          (profile.behaviorMetrics.avgBookingValue * (profile.behaviorMetrics.totalBookings - 1) +
            metadata.bookingValue) /
          profile.behaviorMetrics.totalBookings;
      }
      if (metadata.partnerId) {
        const partners = profile.behaviorMetrics.frequentPartners || [];
        const existing = partners.find((p) => p.id === metadata.partnerId);
        if (existing) {
          existing.bookings = (existing.bookings || 0) + 1;
        } else {
          partners.push({ id: metadata.partnerId, bookings: 1 });
        }
        profile.behaviorMetrics.frequentPartners = partners
          .sort((a, b) => b.bookings - a.bookings)
          .slice(-10);
      }
      break;

    case USER_BEHAVIORS.REVIEW:
      profile.behaviorMetrics.reviewCount++;
      break;
  }

  saveUserProfile(profile);
}

/**
 * Get personalized recommendations using collaborative filtering
 * @param {string} userId - User ID
 * @param {Object} availableItems - Items to recommend from
 * @param {number} limit - Number of recommendations
 * @returns {Array} - Recommended items
 */
export function getPersonalizedRecommendations(userId, availableItems = [], limit = 10) {
  const profile = getUserProfile(userId);
  const userBehaviors = getUserBehaviors(userId);
  const bookedItems = getBookedItems(userId);

  const recommendations = availableItems
    .filter((item) => !bookedItems.includes(item.id)) // Exclude already booked
    .map((item) => {
      let score = 0;

      // Style matching
      if (profile.travelStyle.includes(item.style)) {
        score += 30;
      }

      // Destination matching
      if (profile.preferredDestinations.some((d) => d.name === item.destination)) {
        score += 25;
      }

      // Price range matching
      if (item.price >= profile.budgetRange.min && item.price <= profile.budgetRange.max) {
        score += 20;
      }

      // Accommodation type matching
      if (profile.accommodationType.includes(item.type)) {
        score += 15;
      }

      // Amenities matching
      if (item.amenities) {
        const matchingAmenities = item.amenities.filter((a) =>
          profile.propertyAmenities.includes(a)
        );
        score += matchingAmenities.length * 2;
      }

      // Popular among similar users
      score += (item.rating || 0) * 2;

      // Trending/new items
      if (item.isNew) score += 10;
      if (item.isTrending) score += 8;

      // View recency boost
      if (userBehaviors.some((b) => b.metadata?.itemId === item.id)) {
        score += 5;
      }

      return { ...item, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

  return recommendations;
}

/**
 * Get user's behavior history
 */
function getUserBehaviors(userId) {
  const key = `userBehavior:v1:${userId}`;

  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get items user has already booked
 */
function getBookedItems(userId) {
  const behaviors = getUserBehaviors(userId);

  return behaviors
    .filter((b) => b.action === USER_BEHAVIORS.BOOK)
    .map((b) => b.metadata?.itemId)
    .filter(Boolean);
}

/**
 * Check for price drops on user's wishlist
 * @param {string} userId - User ID
 * @param {Array} currentPrices - Current prices for items
 * @returns {Array} - Items with price drops
 */
export function checkPriceDrops(userId, currentPrices = []) {
  const key = `priceHistory:v1:${userId}`;

  let priceHistory = [];

  try {
    const stored = localStorage.getItem(key);
    priceHistory = stored ? JSON.parse(stored) : [];
  } catch (e) {
    priceHistory = [];
  }

  const drops = [];

  for (const current of currentPrices) {
    const previous = priceHistory.find((p) => p.id === current.id);

    if (previous && current.price < previous.price) {
      drops.push({
        id: current.id,
        name: current.name,
        previousPrice: previous.price,
        currentPrice: current.price,
        savings: previous.price - current.price,
        percentSavings: (((previous.price - current.price) / previous.price) * 100).toFixed(1),
      });
    }
  }

  // Update price history
  priceHistory = currentPrices.map((p) => ({
    id: p.id,
    price: p.price,
    timestamp: new Date().toISOString(),
  }));

  localStorage.setItem(key, JSON.stringify(priceHistory));

  return drops;
}

/**
 * Get personalized homepage content
 * @param {string} userId - User ID
 * @param {Array} allItems - All available items
 * @returns {Object} - Personalized content sections
 */
export function getPersonalizedHomepage(userId, allItems = []) {
  const profile = getUserProfile(userId);
  const behaviors = getUserBehaviors(userId);

  const sections = {};

  // Section 1: Based on travel style
  if (profile.travelStyle.length > 0) {
    sections.byStyle = {
      title: `Popular ${profile.travelStyle[0]} destinations`,
      items: getPersonalizedRecommendations(userId, allItems, 8),
    };
  }

  // Section 2: Based on budget
  sections.byBudget = {
    title: `Within your budget (R${profile.budgetRange.min}-${profile.budgetRange.max})`,
    items: allItems
      .filter((i) => i.price >= profile.budgetRange.min && i.price <= profile.budgetRange.max)
      .sort(() => Math.random() - 0.5)
      .slice(0, 8),
  };

  // Section 3: Recently viewed
  const recentlyViewed = behaviors
    .filter((b) => b.action === USER_BEHAVIORS.VIEW)
    .slice(-50)
    .reverse()
    .map((b) => b.metadata?.itemId)
    .filter(Boolean);

  sections.recentlyViewed = {
    title: 'You recently viewed',
    items: allItems
      .filter((i) => recentlyViewed.includes(i.id))
      .slice(0, 8),
  };

  // Section 4: Trending
  sections.trending = {
    title: '🔥 Trending Now',
    items: allItems
      .filter((i) => i.isTrending)
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
  };

  // Section 5: Similar to your previous bookings
  sections.similarToBookings = {
    title: 'Similar to your recent bookings',
    items: getPersonalizedRecommendations(userId, allItems, 8),
  };

  return sections;
}

/**
 * Get personalized deals for user
 * @param {string} userId - User ID
 * @param {Array} allDeals - All available deals
 * @returns {Array} - Personalized deals
 */
export function getPersonalizedDeals(userId, allDeals = []) {
  const profile = getUserProfile(userId);

  return allDeals
    .map((deal) => {
      let relevance = 50; // Base score

      // Style matching
      if (profile.travelStyle.includes(deal.style)) relevance += 25;

      // Destination matching
      if (profile.preferredDestinations.some((d) => d.name === deal.destination)) relevance += 20;

      // Budget matching
      if (deal.price <= profile.budgetRange.max) relevance += 15;

      // Early bird (user's preference)
      if (deal.isEarlyBird && profile.travelStyle.includes('early_planner')) relevance += 10;

      return { ...deal, relevance };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);
}

/**
 * Update user budget preferences based on behavior
 */
export function updateUserBudget(userId, newBookingValue) {
  const profile = getUserProfile(userId);

  const { min, max } = profile.budgetRange;
  const newMin = Math.min(min, newBookingValue);
  const newMax = Math.max(max, newBookingValue);

  profile.budgetRange = {
    min: Math.max(0, newMin - 1000),
    max: newMax + 5000,
  };

  saveUserProfile(profile);
  return profile.budgetRange;
}

/**
 * Get content recommendations by category
 */
export const CONTENT_CATEGORIES = {
  BLOG: 'blog',
  VIDEO: 'video',
  GUIDE: 'guide',
  DESTINATION: 'destination',
};

/**
 * Get personalized content feed
 * @param {string} userId - User ID
 * @param {Array} allContent - All available content
 * @param {string} category - Content category
 * @returns {Array} - Personalized content
 */
export function getPersonalizedContent(userId, allContent = [], category = null) {
  const profile = getUserProfile(userId);

  let filtered = allContent;

  // Filter by category if specified
  if (category) {
    filtered = filtered.filter((c) => c.category === category);
  }

  // Score and rank
  return filtered
    .map((content) => {
      let score = content.popularity || 0;

      // Style matching
      if (profile.travelStyle.some((s) => content.tags?.includes(s))) {
        score += 30;
      }

      // Destination matching
      if (profile.preferredDestinations.some((d) => content.destination === d.name)) {
        score += 25;
      }

      // Recency boost
      const days = (new Date() - new Date(content.publishedAt)) / (1000 * 60 * 60 * 24);
      if (days < 7) score += 20;
      if (days < 30) score += 10;

      return { ...content, personalizedScore: score };
    })
    .sort((a, b) => b.personalizedScore - a.personalizedScore)
    .slice(0, 20);
}

/**
 * Analyze user segments for targeted marketing
 */
export function analyzeUserSegment(profile) {
  const segment = {
    name: '',
    characteristics: [],
    targetedOffers: [],
  };

  // Segment 1: Budget Conscious
  if (profile.budgetRange.max < 5000) {
    segment.name = 'Budget Traveler';
    segment.characteristics = ['Price sensitive', 'Values deals', 'Long booking window'];
    segment.targetedOffers = [
      'Early bird discounts (20% off)',
      'Bundle deals',
      'Group discounts',
    ];
  }

  // Segment 2: Luxury Seekers
  else if (profile.budgetRange.min > 10000) {
    segment.name = 'Luxury Traveler';
    segment.characteristics = ['Premium experiences', 'Value quality', 'Spontaneous booker'];
    segment.targetedOffers = [
      'VIP concierge',
      'Premium suites',
      'Exclusive experiences',
      'Travel insurance',
    ];
  }

  // Segment 3: Adventure Seekers
  else if (profile.travelStyle.includes('adventure')) {
    segment.name = 'Adventure Seeker';
    segment.characteristics = ['Action-oriented', 'Off-the-beaten-path', 'Group traveler'];
    segment.targetedOffers = [
      'Adventure packages',
      'Group bookings',
      'Sports & activities',
    ];
  }

  // Segment 4: City Explorer
  else if (profile.travelStyle.includes('city')) {
    segment.name = 'City Explorer';
    segment.characteristics = ['Urban culture', 'Short stays', 'Last-minute planner'];
    segment.targetedOffers = [
      'City guides',
      'Package tours',
      'Nightlife experiences',
    ];
  }

  // Segment 5: Beach Lover
  else if (profile.travelStyle.includes('beach')) {
    segment.name = 'Beach Lover';
    segment.characteristics = ['Relaxation', 'Coastal destinations', 'Long stays'];
    segment.targetedOffers = [
      'Beach resorts',
      'Water sports',
      'Spa packages',
    ];
  }

  // Segment 6: Family Traveler
  else if (profile.groupSize > 2) {
    segment.name = 'Family Traveler';
    segment.characteristics = ['Family-friendly', 'Long stays', 'Multiple accommodations'];
    segment.targetedOffers = [
      'Family packages',
      'Group accommodations',
      'Childcare services',
    ];
  }

  return segment;
}

/**
 * Calculate customer lifetime value (CLV) prediction
 */
export function predictCLV(profile, behaviors) {
  const bookings = behaviors.filter((b) => b.action === USER_BEHAVIORS.BOOK);
  const avgBookingValue = profile.behaviorMetrics.avgBookingValue || 0;
  const bookingFrequency = bookings.length / 12; // Bookings per month

  // Predict 24-month CLV
  const predictedBookings24mo = bookingFrequency * 24;
  const predictedCLV = predictedBookings24mo * avgBookingValue;

  // Calculate loyalty potential
  const loyaltyScore = Math.min(
    100,
    profile.behaviorMetrics.totalBookings * 10 +
      profile.behaviorMetrics.reviewCount * 5 +
      (profile.behaviorMetrics.totalViews > 50 ? 20 : 0)
  );

  return {
    predictedCLV: Math.round(predictedCLV),
    bookingFrequency: bookingFrequency.toFixed(1),
    avgBookingValue: Math.round(avgBookingValue),
    loyaltyScore: Math.round(loyaltyScore),
    tier: loyaltyScore > 70 ? 'VIP' : loyaltyScore > 40 ? 'Loyal' : 'Potential',
    upsellOpportunities: [
      avgBookingValue < 8000 ? 'Upgrade to premium properties' : null,
      bookingFrequency < 2 ? 'Encourage repeat bookings' : null,
      profile.behaviorMetrics.reviewCount === 0 ? 'Incentivize reviews' : null,
      profile.travelStyle.length === 0 ? 'Profile preferences' : null,
    ].filter(Boolean),
  };
}
