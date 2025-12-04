/**
 * Fraud Detection Engine
 * Monitors suspicious activity, payment fraud, double-booking, review fraud
 */

// Fraud detection rule types
export const FRAUD_TYPES = {
  DUPLICATE_BOOKING: 'duplicate_booking',
  SUSPICIOUS_PAYMENT: 'suspicious_payment',
  REVIEW_FRAUD: 'review_fraud',
  PRICE_MANIPULATION: 'price_manipulation',
  ACCOUNT_TAKEOVER: 'account_takeover',
  CHARGEBACK_PATTERN: 'chargeback_pattern',
  CANCELLATION_ABUSE: 'cancellation_abuse',
  MULTI_ACCOUNT: 'multi_account',
  BOT_ACTIVITY: 'bot_activity'
};

// Risk levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Initialize fraud detection for user/partner
export function initializeFraudDetection(userId, userType) {
  const detection = {
    userId,
    userType,
    risk_score: 0,
    risk_level: RISK_LEVELS.LOW,
    flags: [],
    activity_history: [],
    suspicious_transactions: [],
    blocked: false,
    blocked_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(
    `colleco.fraud_detection.${userId}`,
    JSON.stringify(detection)
  );

  return detection;
}

// Get fraud detection record
export function getFraudDetection(userId) {
  const data = localStorage.getItem(`colleco.fraud_detection.${userId}`);
  
  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

// Analyze booking for fraud
export function analyzeBookingForFraud(userId, bookingData) {
  let detection = getFraudDetection(userId);
  
  if (!detection) {
    detection = initializeFraudDetection(userId, 'traveler');
  }

  const fraud_indicators = [];
  let risk_increment = 0;

  // Check for duplicate bookings
  const recent_bookings = getRecentBookings(userId, 7); // Last 7 days
  const similar_bookings = recent_bookings.filter(b =>
    b.accommodation_id === bookingData.accommodation_id &&
    b.check_in_date === bookingData.check_in_date
  );

  if (similar_bookings.length > 0) {
    fraud_indicators.push({
      type: FRAUD_TYPES.DUPLICATE_BOOKING,
      severity: 'high',
      details: `Duplicate booking detected (${similar_bookings.length} similar bookings)`
    });
    risk_increment += 20;
  }

  // Check for rapid successive bookings (booking spam)
  if (recent_bookings.length > 5) {
    fraud_indicators.push({
      type: FRAUD_TYPES.BOT_ACTIVITY,
      severity: 'medium',
      details: `${recent_bookings.length} bookings in last 7 days`
    });
    risk_increment += 15;
  }

  // Check for price anomalies
  if (bookingData.total_price) {
    const price_analysis = analyzePrice(bookingData);
    if (price_analysis.anomaly_detected) {
      fraud_indicators.push({
        type: FRAUD_TYPES.PRICE_MANIPULATION,
        severity: 'medium',
        details: price_analysis.details
      });
      risk_increment += 10;
    }
  }

  // Check payment method changes
  const payment_methods = recent_bookings.map(b => b.payment_method).filter(Boolean);
  const unique_methods = new Set(payment_methods);
  
  if (unique_methods.size > 3 && recent_bookings.length > 1) {
    fraud_indicators.push({
      type: FRAUD_TYPES.SUSPICIOUS_PAYMENT,
      severity: 'medium',
      details: `${unique_methods.size} different payment methods used`
    });
    risk_increment += 12;
  }

  // Add booking to activity history
  detection.activity_history.push({
    timestamp: new Date().toISOString(),
    type: 'booking',
    booking_id: bookingData.booking_id,
    amount: bookingData.total_price,
    risk_level: risk_increment > 30 ? RISK_LEVELS.HIGH : risk_increment > 15 ? RISK_LEVELS.MEDIUM : RISK_LEVELS.LOW
  });

  // Update detection record
  if (fraud_indicators.length > 0) {
    detection.flags.push(...fraud_indicators);
    detection.risk_score += risk_increment;
  }

  updateRiskLevel(detection);
  updateFraudDetection(userId, detection);

  return {
    fraud_indicators,
    risk_increment,
    total_risk_score: detection.risk_score,
    risk_level: detection.risk_level,
    action_required: detection.risk_level === RISK_LEVELS.HIGH || detection.risk_level === RISK_LEVELS.CRITICAL
  };
}

// Analyze payment for fraud
export function analyzePaymentForFraud(userId, paymentData) {
  let detection = getFraudDetection(userId);
  
  if (!detection) {
    detection = initializeFraudDetection(userId, 'traveler');
  }

  const fraud_indicators = [];
  let risk_increment = 0;

  // Check for rapid successive transactions
  const recent_transactions = detection.activity_history
    .filter(h => h.type === 'payment')
    .filter(h => {
      const tx_time = new Date(h.timestamp).getTime();
      const now = new Date().getTime();
      return (now - tx_time) < 3600000; // Last hour
    });

  if (recent_transactions.length > 5) {
    fraud_indicators.push({
      type: FRAUD_TYPES.BOT_ACTIVITY,
      severity: 'high',
      details: `${recent_transactions.length} transactions in last hour`
    });
    risk_increment += 25;
  }

  // Check for card decline followed by retry (chargeback indicator)
  if (paymentData.previous_decline_count > 2) {
    fraud_indicators.push({
      type: FRAUD_TYPES.CHARGEBACK_PATTERN,
      severity: 'high',
      details: `${paymentData.previous_decline_count} declined attempts before success`
    });
    risk_increment += 30;
  }

  // Check for geographical inconsistencies
  if (paymentData.card_country !== paymentData.booking_country) {
    // Allow for travelers, but flag for excessive variations
    const recent_countries = detection.activity_history
      .filter(h => h.booking_country)
      .map(h => h.booking_country)
      .filter((v, i, a) => a.indexOf(v) === i);

    if (recent_countries.length > 5) {
      fraud_indicators.push({
        type: FRAUD_TYPES.ACCOUNT_TAKEOVER,
        severity: 'medium',
        details: 'Multiple country booking pattern detected'
      });
      risk_increment += 15;
    }
  }

  // Add to activity history
  detection.suspicious_transactions.push({
    timestamp: new Date().toISOString(),
    amount: paymentData.amount,
    payment_method: paymentData.payment_method,
    status: paymentData.status,
    card_country: paymentData.card_country
  });

  if (fraud_indicators.length > 0) {
    detection.flags.push(...fraud_indicators);
    detection.risk_score += risk_increment;
  }

  detection.activity_history.push({
    timestamp: new Date().toISOString(),
    type: 'payment',
    amount: paymentData.amount,
    status: paymentData.status,
    risk_level: risk_increment > 30 ? RISK_LEVELS.HIGH : risk_increment > 15 ? RISK_LEVELS.MEDIUM : RISK_LEVELS.LOW
  });

  updateRiskLevel(detection);
  updateFraudDetection(userId, detection);

  return {
    fraud_indicators,
    risk_increment,
    total_risk_score: detection.risk_score,
    risk_level: detection.risk_level,
    block_transaction: detection.risk_level === RISK_LEVELS.CRITICAL
  };
}

// Analyze review for fraud
export function analyzeReviewForFraud(partnerId, reviewData) {
  let detection = getFraudDetection(partnerId);
  
  if (!detection) {
    detection = initializeFraudDetection(partnerId, 'partner');
  }

  const fraud_indicators = [];
  let risk_increment = 0;

  // Check for fake reviews
  const all_reviews = getPartnerReviews(partnerId);
  
  // Check for rating clusters (all 5-star or all 1-star)
  const ratings = all_reviews.map(r => r.rating);
  const unique_ratings = new Set(ratings);
  
  if (unique_ratings.size === 1 && all_reviews.length > 5) {
    fraud_indicators.push({
      type: FRAUD_TYPES.REVIEW_FRAUD,
      severity: 'high',
      details: 'All reviews have identical rating'
    });
    risk_increment += 25;
  }

  // Check for reviewer patterns (same reviewer, different review)
  const reviewer_counts = {};
  all_reviews.forEach(r => {
    reviewer_counts[r.reviewer_id] = (reviewer_counts[r.reviewer_id] || 0) + 1;
  });

  const repeat_reviewers = Object.values(reviewer_counts).filter(count => count > 2).length;
  if (repeat_reviewers > 2) {
    fraud_indicators.push({
      type: FRAUD_TYPES.REVIEW_FRAUD,
      severity: 'medium',
      details: `${repeat_reviewers} reviewers with multiple reviews`
    });
    risk_increment += 15;
  }

  // Check for review velocity (too many reviews in short time)
  const recent_reviews = all_reviews.filter(r => {
    const review_time = new Date(r.created_at).getTime();
    const now = new Date().getTime();
    return (now - review_time) < 86400000; // Last 24 hours
  });

  if (recent_reviews.length > 10) {
    fraud_indicators.push({
      type: FRAUD_TYPES.BOT_ACTIVITY,
      severity: 'high',
      details: `${recent_reviews.length} reviews in last 24 hours`
    });
    risk_increment += 30;
  }

  // Content analysis
  if (reviewData.comment) {
    const content_analysis = analyzeReviewContent(reviewData.comment);
    if (content_analysis.issues.length > 0) {
      fraud_indicators.push({
        type: FRAUD_TYPES.REVIEW_FRAUD,
        severity: 'medium',
        details: content_analysis.issues.join('; ')
      });
      risk_increment += content_analysis.risk_points;
    }
  }

  if (fraud_indicators.length > 0) {
    detection.flags.push(...fraud_indicators);
    detection.risk_score += risk_increment;
  }

  detection.activity_history.push({
    timestamp: new Date().toISOString(),
    type: 'review',
    rating: reviewData.rating,
    reviewer_id: reviewData.reviewer_id,
    risk_level: risk_increment > 30 ? RISK_LEVELS.HIGH : risk_increment > 15 ? RISK_LEVELS.MEDIUM : RISK_LEVELS.LOW
  });

  updateRiskLevel(detection);
  updateFraudDetection(partnerId, detection);

  return {
    fraud_indicators,
    risk_increment,
    total_risk_score: detection.risk_score,
    risk_level: detection.risk_level,
    recommend_review_removal: detection.risk_level === RISK_LEVELS.CRITICAL
  };
}

// Analyze review content
function analyzeReviewContent(comment) {
  const issues = [];
  let risk_points = 0;

  if (!comment || comment.length === 0) {
    issues.push('No comment provided');
    risk_points += 5;
  }

  // Check for spam keywords
  const spam_keywords = ['bitcoin', 'crypto', 'pharmacy', 'casino', 'loan', 'xxx'];
  const has_spam = spam_keywords.some(keyword => comment.toLowerCase().includes(keyword));
  
  if (has_spam) {
    issues.push('Spam keywords detected');
    risk_points += 15;
  }

  // Check for suspicious patterns
  if (comment.length < 10) {
    issues.push('Comment too short');
    risk_points += 3;
  }

  // Check for all caps (usually spam)
  const caps_ratio = (comment.match(/[A-Z]/g) || []).length / comment.length;
  if (caps_ratio > 0.7) {
    issues.push('Excessive capitalization');
    risk_points += 5;
  }

  return { issues, risk_points };
}

// Check for multi-account fraud
export function checkMultiAccountFraud(userId, email, phone) {
  const accounts_with_email = findAccountsByEmail(email);
  const accounts_with_phone = findAccountsByPhone(phone);

  const fraud_indicators = [];
  let risk_score = 0;

  if (accounts_with_email.length > 1) {
    fraud_indicators.push({
      type: FRAUD_TYPES.MULTI_ACCOUNT,
      severity: 'high',
      details: `Email associated with ${accounts_with_email.length} accounts`
    });
    risk_score += 30;
  }

  if (accounts_with_phone.length > 1) {
    fraud_indicators.push({
      type: FRAUD_TYPES.MULTI_ACCOUNT,
      severity: 'high',
      details: `Phone associated with ${accounts_with_phone.length} accounts`
    });
    risk_score += 30;
  }

  return {
    multi_account_detected: fraud_indicators.length > 0,
    fraud_indicators,
    risk_score
  };
}

// Block user for fraud
export function blockUserForFraud(userId, reason) {
  let detection = getFraudDetection(userId);
  
  if (!detection) {
    detection = initializeFraudDetection(userId, 'traveler');
  }

  detection.blocked = true;
  detection.blocked_reason = reason;
  detection.flags.push({
    type: 'fraud_block',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    reason
  });

  detection.risk_level = RISK_LEVELS.CRITICAL;
  updateFraudDetection(userId, detection);

  return { success: true, user_blocked: true };
}

// Unblock user
export function unblockUserFromFraud(userId) {
  let detection = getFraudDetection(userId);
  
  if (!detection) {
    return { success: false, error: 'Fraud detection record not found' };
  }

  detection.blocked = false;
  detection.blocked_reason = null;
  detection.risk_score = Math.max(0, detection.risk_score - 50);
  updateRiskLevel(detection);
  updateFraudDetection(userId, detection);

  return { success: true, user_unblocked: true };
}

// Update risk level based on score
function updateRiskLevel(detection) {
  if (detection.risk_score >= 70) {
    detection.risk_level = RISK_LEVELS.CRITICAL;
  } else if (detection.risk_score >= 50) {
    detection.risk_level = RISK_LEVELS.HIGH;
  } else if (detection.risk_score >= 30) {
    detection.risk_level = RISK_LEVELS.MEDIUM;
  } else {
    detection.risk_level = RISK_LEVELS.LOW;
  }
}

// Analyze price for anomalies
function analyzePrice(bookingData) {
  const price = bookingData.total_price;
  const nights = bookingData.nights || 1;
  const price_per_night = price / nights;

  // Get average price for similar properties
  const similar_bookings = getSimilarBookings(bookingData.accommodation_id);
  
  if (similar_bookings.length === 0) {
    return { anomaly_detected: false };
  }

  const avg_price_per_night = similar_bookings
    .reduce((sum, b) => sum + (b.total_price / (b.nights || 1)), 0) / similar_bookings.length;

  const variance = Math.abs(price_per_night - avg_price_per_night) / avg_price_per_night;

  if (variance > 0.5) { // More than 50% variance
    return {
      anomaly_detected: true,
      details: `Price per night ${(variance * 100).toFixed(0)}% different from average`
    };
  }

  return { anomaly_detected: false };
}

// Helper functions
function updateFraudDetection(userId, detection) {
  detection.updated_at = new Date().toISOString();
  localStorage.setItem(
    `colleco.fraud_detection.${userId}`,
    JSON.stringify(detection)
  );
}

function getRecentBookings(userId, days = 7) {
  // Mock implementation - would fetch from database
  const all_bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return all_bookings.filter(b =>
    b.user_id === userId &&
    new Date(b.created_at) > cutoff
  );
}

function getPartnerReviews(partnerId) {
  // Mock implementation
  const all_reviews = JSON.parse(localStorage.getItem('colleco.reviews') || '[]');
  return all_reviews.filter(r => r.partner_id === partnerId);
}

function getSimilarBookings(accommodationId) {
  // Mock implementation
  const all_bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
  return all_bookings.filter(b => b.accommodation_id === accommodationId).slice(0, 10);
}

function findAccountsByEmail(email) {
  // Mock implementation
  const users = JSON.parse(localStorage.getItem('colleco.users') || '[]');
  return users.filter(u => u.email === email);
}

function findAccountsByPhone(phone) {
  // Mock implementation
  const users = JSON.parse(localStorage.getItem('colleco.users') || '[]');
  return users.filter(u => u.phone === phone);
}
