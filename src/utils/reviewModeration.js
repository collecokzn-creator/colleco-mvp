/**
 * Review Moderation System
 * Handles content filtering, automated flagging, manual review workflows, spam detection
 */

// Review status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
  UNDER_REVIEW: 'under_review'
};

// Flag reasons
export const FLAG_REASONS = {
  SPAM: 'spam',
  HATE_SPEECH: 'hate_speech',
  HARASSMENT: 'harassment',
  FALSE_CLAIM: 'false_claim',
  IRRELEVANT: 'irrelevant',
  EXPLICIT_CONTENT: 'explicit_content',
  COMMERCIAL_SPAM: 'commercial_spam',
  POTENTIAL_FRAUD: 'potential_fraud',
  FAKE_REVIEW: 'fake_review'
};

// Moderation confidence levels
export const CONFIDENCE_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
};

// Create moderation record for review
export function createModerationRecord(reviewId, reviewData) {
  const moderation = {
    reviewId,
    status: REVIEW_STATUS.PENDING,
    content: reviewData.comment || '',
    rating: reviewData.rating,
    reviewer_id: reviewData.reviewer_id,
    partner_id: reviewData.partner_id,
    submitted_at: new Date().toISOString(),
    automated_flags: [],
    manual_flags: [],
    confidence_score: 0,
    approved_at: null,
    rejected_at: null,
    moderator_id: null,
    moderator_notes: '',
    approved: false
  };

  // Run automated content filtering
  const auto_flags = runContentFiltering(moderation.content, moderation.rating);
  if (auto_flags.length > 0) {
    moderation.automated_flags = auto_flags;
    moderation.status = REVIEW_STATUS.FLAGGED;
  }

  localStorage.setItem(
    `colleco.moderation.${reviewId}`,
    JSON.stringify(moderation)
  );

  return moderation;
}

// Get moderation record
export function getModerationRecord(reviewId) {
  const data = localStorage.getItem(`colleco.moderation.${reviewId}`);
  return data ? JSON.parse(data) : null;
}

// Run automated content filtering
function runContentFiltering(content, rating) {
  const flags = [];
  let confidence_sum = 0;
  let check_count = 0;

  // Check for spam keywords
  const spam_check = checkSpamKeywords(content);
  if (spam_check.detected) {
    flags.push({
      reason: FLAG_REASONS.SPAM,
      confidence: spam_check.confidence,
      details: spam_check.details
    });
    confidence_sum += spam_check.confidence;
    check_count++;
  }

  // Check for hate speech / harassment
  const hate_check = checkHateSpeech(content);
  if (hate_check.detected) {
    flags.push({
      reason: FLAG_REASONS.HATE_SPEECH,
      confidence: hate_check.confidence,
      details: hate_check.details
    });
    confidence_sum += hate_check.confidence;
    check_count++;
  }

  // Check for explicit content
  const explicit_check = checkExplicitContent(content);
  if (explicit_check.detected) {
    flags.push({
      reason: FLAG_REASONS.EXPLICIT_CONTENT,
      confidence: explicit_check.confidence,
      details: explicit_check.details
    });
    confidence_sum += explicit_check.confidence;
    check_count++;
  }

  // Check for commercial spam
  const commercial_check = checkCommercialSpam(content);
  if (commercial_check.detected) {
    flags.push({
      reason: FLAG_REASONS.COMMERCIAL_SPAM,
      confidence: commercial_check.confidence,
      details: commercial_check.details
    });
    confidence_sum += commercial_check.confidence;
    check_count++;
  }

  // Check for low-quality content
  const quality_check = checkContentQuality(content, rating);
  if (quality_check.detected) {
    flags.push({
      reason: FLAG_REASONS.IRRELEVANT,
      confidence: quality_check.confidence,
      details: quality_check.details
    });
    confidence_sum += quality_check.confidence;
    check_count++;
  }

  // Calculate overall confidence
  if (check_count > 0) {
    const _avg_confidence = confidence_sum / check_count;
    
    // Filter out low-confidence flags
    return flags.filter(f => f.confidence >= 0.5);
  }

  return flags;
}

// Check for spam keywords
function checkSpamKeywords(content) {
  const spam_keywords = [
    'bitcoin', 'cryptocurrency', 'forex', 'trading',
    'pharmacy', 'viagra', 'cialis',
    'casino', 'gambling', 'poker',
    'loan', 'mortgage', 'credit',
    'click here', 'buy now', 'visit my site',
    'http://', 'https://', '.com', '.xyz'
  ];

  const detected_keywords = spam_keywords.filter(keyword =>
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  if (detected_keywords.length > 0) {
    return {
      detected: true,
      confidence: Math.min(detected_keywords.length * 0.3, 0.95),
      details: `Spam keywords found: ${detected_keywords.join(', ')}`
    };
  }

  return { detected: false };
}

// Check for hate speech
function checkHateSpeech(content) {
  const hate_speech_patterns = [
    /\b(n-word|f-word|hate|kill|death threat)\b/gi,
    /(stupid|idiot|moron)\s+(person|people|reviewer)/gi,
    /racist|discrimination|ethnic|xenophobic/gi
  ];

  for (const pattern of hate_speech_patterns) {
    if (pattern.test(content)) {
      return {
        detected: true,
        confidence: 0.8,
        details: 'Potential hate speech detected'
      };
    }
  }

  return { detected: false };
}

// Check for explicit content
function checkExplicitContent(content) {
  const explicit_words = [
    'xxx', 'porn', 'sex', 'explicit',
    'adult content', 'NSFW'
  ];

  const detected = explicit_words.some(word =>
    content.toLowerCase().includes(word.toLowerCase())
  );

  if (detected) {
    return {
      detected: true,
      confidence: 0.9,
      details: 'Explicit content detected'
    };
  }

  return { detected: false };
}

// Check for commercial spam
function checkCommercialSpam(content) {
  const commercial_patterns = [
    /\b(discount|offer|buy|sale|price)\b.*\b(http|www|.com)\b/gi,
    /\b(follow|like|subscribe)\b.*\b(instagram|facebook|tiktok|twitter)\b/gi,
    /\$\d+(\.\d{2})?/g
  ];

  let matches = 0;
  for (const pattern of commercial_patterns) {
    if (pattern.test(content)) {
      matches++;
    }
  }

  if (matches > 0) {
    return {
      detected: true,
      confidence: Math.min(matches * 0.4, 0.85),
      details: 'Commercial spam patterns detected'
    };
  }

  return { detected: false };
}

// Check content quality
function checkContentQuality(content, rating) {
  const issues = [];
  let risk_score = 0;

  // Too short comment
  if (content.length < 10) {
    issues.push('Comment too short');
    risk_score += 10;
  }

  // Excessive capitalization
  const caps_ratio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (caps_ratio > 0.7) {
    issues.push('Excessive capitalization');
    risk_score += 15;
  }

  // Mismatch between rating and content (e.g., 5 stars but negative comment)
  const sentiment = analyzeSentiment(content);
  const rating_sentiment_mismatch = (rating > 4 && sentiment < -0.5) || (rating < 2 && sentiment > 0.5);
  
  if (rating_sentiment_mismatch) {
    issues.push('Rating/comment mismatch');
    risk_score += 20;
  }

  if (issues.length > 0) {
    return {
      detected: true,
      confidence: Math.min(risk_score / 100, 0.7),
      details: issues.join('; ')
    };
  }

  return { detected: false };
}

// Simple sentiment analysis (0 = negative, 0.5 = neutral, 1 = positive)
function analyzeSentiment(content) {
  const positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love'];
  const negative_words = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disgusting'];

  const positive_count = positive_words.filter(word =>
    content.toLowerCase().includes(word)
  ).length;

  const negative_count = negative_words.filter(word =>
    content.toLowerCase().includes(word)
  ).length;

  const total = positive_count + negative_count;
  if (total === 0) return 0.5;

  return positive_count / total;
}

// Approve review
export function approveReview(reviewId, moderatorId = null) {
  const moderation = getModerationRecord(reviewId);
  
  if (!moderation) {
    return { success: false, error: 'Moderation record not found' };
  }

  moderation.status = REVIEW_STATUS.APPROVED;
  moderation.approved = true;
  moderation.approved_at = new Date().toISOString();
  moderation.moderator_id = moderatorId;

  updateModerationRecord(reviewId, moderation);

  return {
    success: true,
    status: REVIEW_STATUS.APPROVED,
    review_id: reviewId
  };
}

// Reject review
export function rejectReview(reviewId, reason, moderatorId = null, notes = '') {
  const moderation = getModerationRecord(reviewId);
  
  if (!moderation) {
    return { success: false, error: 'Moderation record not found' };
  }

  moderation.status = REVIEW_STATUS.REJECTED;
  moderation.approved = false;
  moderation.rejected_at = new Date().toISOString();
  moderation.moderator_id = moderatorId;
  moderation.moderator_notes = notes;

  moderation.manual_flags.push({
    reason,
    flagged_at: new Date().toISOString(),
    moderator_id: moderatorId
  });

  updateModerationRecord(reviewId, moderation);

  return {
    success: true,
    status: REVIEW_STATUS.REJECTED,
    review_id: reviewId
  };
}

// Flag review for manual review
export function flagReviewForManualReview(reviewId, reason, details = '') {
  const moderation = getModerationRecord(reviewId);
  
  if (!moderation) {
    return { success: false, error: 'Moderation record not found' };
  }

  moderation.status = REVIEW_STATUS.UNDER_REVIEW;

  moderation.manual_flags.push({
    reason,
    details,
    flagged_at: new Date().toISOString(),
    flagged_by: 'system'
  });

  updateModerationRecord(reviewId, moderation);

  return {
    success: true,
    status: REVIEW_STATUS.UNDER_REVIEW,
    review_id: reviewId
  };
}

// Get reviews pending moderation
export function getPendingReviews(limit = 50) {
  const pending = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.moderation.')) {
      const moderation = JSON.parse(localStorage.getItem(key));
      
      if (moderation.status === REVIEW_STATUS.PENDING || 
          moderation.status === REVIEW_STATUS.FLAGGED ||
          moderation.status === REVIEW_STATUS.UNDER_REVIEW) {
        pending.push(moderation);
      }
    }
    
    if (pending.length >= limit) break;
  }

  return pending.sort((a, b) => 
    new Date(a.submitted_at) - new Date(b.submitted_at)
  );
}

// Get moderation stats
export function getModerationStats() {
  const stats = {
    total_reviews: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
    under_review: 0,
    flag_breakdown: {}
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.moderation.')) {
      const moderation = JSON.parse(localStorage.getItem(key));
      stats.total_reviews++;

      switch (moderation.status) {
        case REVIEW_STATUS.PENDING:
          stats.pending++;
          break;
        case REVIEW_STATUS.APPROVED:
          stats.approved++;
          break;
        case REVIEW_STATUS.REJECTED:
          stats.rejected++;
          break;
        case REVIEW_STATUS.FLAGGED:
          stats.flagged++;
          break;
        case REVIEW_STATUS.UNDER_REVIEW:
          stats.under_review++;
          break;
      }

      // Track flag reasons
      moderation.automated_flags.forEach(flag => {
        stats.flag_breakdown[flag.reason] = (stats.flag_breakdown[flag.reason] || 0) + 1;
      });
    }
  }

  return stats;
}

// Update moderation record
function updateModerationRecord(reviewId, moderation) {
  localStorage.setItem(
    `colleco.moderation.${reviewId}`,
    JSON.stringify(moderation)
  );
}
