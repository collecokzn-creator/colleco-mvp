/**
 * Trust & Safety Engine
 * Handles partner verification, fraud detection, review moderation, and safety ratings
 */

/**
 * Partner Verification System
 */
export const partnerVerification = {
  // Verification levels
  LEVELS: {
    UNVERIFIED: 'unverified',
    BASIC: 'basic',
    STANDARD: 'standard',
    PREMIUM: 'premium'
  },

  // Create verification record
  createVerification: (partnerId, data) => {
    const verification = {
      partnerId,
      status: 'pending',
      level: 'unverified',
      documents: [],
      backgroundCheck: null,
      insuranceVerified: false,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      notes: []
    };

    localStorage.setItem(`colleco.trust.verification.${partnerId}`, JSON.stringify(verification));
    return { success: true, verification };
  },

  // Get verification status
  getVerification: (partnerId) => {
    const data = localStorage.getItem(`colleco.trust.verification.${partnerId}`);
    return data ? JSON.parse(data) : null;
  },

  // Submit document
  submitDocument: (partnerId, documentType, documentData) => {
    const verification = partnerVerification.getVerification(partnerId);
    if (!verification) return { success: false, error: 'No verification record' };

    const document = {
      type: documentType,
      status: 'pending_review',
      uploadedAt: new Date().toISOString(),
      expiresAt: calculateExpiry(documentType),
      data: documentData
    };

    verification.documents.push(document);
    localStorage.setItem(`colleco.trust.verification.${partnerId}`, JSON.stringify(verification));

    return { success: true, document };
  },

  // Update verification level
  updateVerificationLevel: (partnerId, level) => {
    const verification = partnerVerification.getVerification(partnerId);
    if (!verification) return { success: false };

    verification.level = level;
    verification.status = 'verified';
    localStorage.setItem(`colleco.trust.verification.${partnerId}`, JSON.stringify(verification));

    return { success: true, verification };
  }
};

/**
 * Fraud Detection System
 */
export const fraudDetection = {
  // Risk levels
  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  // Check transaction for fraud
  analyzeTransaction: (userId, userType, transactionData) => {
    const riskScore = calculateRiskScore(userId, userType, transactionData);
    const flags = identifyFraudFlags(userId, transactionData);

    const result = {
      userId,
      transactionId: transactionData.id,
      riskScore, // 0-100
      riskLevel: getRiskLevel(riskScore),
      flags,
      timestamp: new Date().toISOString(),
      recommended_action: getRecommendedAction(riskScore)
    };

    // Log for analysis
    const history = JSON.parse(localStorage.getItem(`colleco.trust.fraud_analysis.${userId}`) || '[]');
    history.push(result);
    localStorage.setItem(`colleco.trust.fraud_analysis.${userId}`, JSON.stringify(history.slice(-100)));

    return result;
  },

  // Get fraud history for user
  getFraudHistory: (userId) => {
    const history = localStorage.getItem(`colleco.trust.fraud_analysis.${userId}`);
    return history ? JSON.parse(history) : [];
  },

  // Report suspicious activity
  reportSuspiciousActivity: (userId, activityType, description) => {
    const report = {
      id: `REPORT-${Date.now()}`,
      userId,
      activityType,
      description,
      reportedAt: new Date().toISOString(),
      status: 'under_review',
      resolution: null
    };

    const reports = JSON.parse(localStorage.getItem('colleco.trust.fraud_reports') || '[]');
    reports.push(report);
    localStorage.setItem('colleco.trust.fraud_reports', JSON.stringify(reports));

    return { success: true, report };
  }
};

/**
 * Review Moderation System
 */
export const reviewModeration = {
  // Moderation statuses
  STATUSES: {
    APPROVED: 'approved',
    PENDING: 'pending',
    REJECTED: 'rejected',
    FLAGGED: 'flagged'
  },

  // Moderate review
  moderateReview: (reviewId, reviewData) => {
    const content = reviewData.comment || '';
    const issues = [];

    // Check for inappropriate content
    if (containsProhibitedContent(content)) {
      issues.push('inappropriate_content');
    }

    // Check for spam/fake reviews
    if (isLikelySpam(content)) {
      issues.push('potential_spam');
    }

    // Check for contact information
    if (containsContactInfo(content)) {
      issues.push('contains_contact_info');
    }

    // Check review velocity (too many reviews too quickly)
    if (isAnomalousVelocity(reviewData.authorId)) {
      issues.push('suspicious_velocity');
    }

    const status = issues.length > 0 ? 'flagged' : 'approved';

    const moderation = {
      reviewId,
      status,
      issues,
      confidence: calculateConfidence(issues),
      moderatedAt: new Date().toISOString(),
      recommendation: status === 'approved' ? 'publish' : 'review'
    };

    localStorage.setItem(`colleco.trust.review_moderation.${reviewId}`, JSON.stringify(moderation));

    return moderation;
  },

  // Get moderation result
  getModerationResult: (reviewId) => {
    const data = localStorage.getItem(`colleco.trust.review_moderation.${reviewId}`);
    return data ? JSON.parse(data) : null;
  },

  // Bulk moderate reviews
  bulkModerate: (reviews) => {
    return reviews.map(review => reviewModeration.moderateReview(review.id, review));
  }
};

/**
 * Safety Ratings System
 */
export const safetyRatings = {
  // Calculate safety score (0-100)
  calculateSafetyScore: (partnerId) => {
    const verification = partnerVerification.getVerification(partnerId);
    const reviews = getPartnerReviews(partnerId);
    const reportHistory = getFraudReports(partnerId);

    let score = 100;

    // Verification impact (up to 30 points)
    if (!verification || verification.status !== 'verified') score -= 30;
    else if (verification.level === 'premium') score += 5;

    // Review quality impact (up to 20 points)
    const flaggedReviews = reviews.filter(r => {
      const mod = reviewModeration.getModerationResult(r.id);
      return mod && mod.status === 'flagged';
    }).length;
    score -= Math.min(flaggedReviews * 2, 20);

    // Report history impact (up to 20 points)
    const recentReports = reportHistory.filter(r =>
      new Date(r.reportedAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length;
    score -= Math.min(recentReports * 5, 20);

    // Dispute history impact (up to 10 points)
    const disputes = getPartnerDisputes(partnerId);
    const unresolved = disputes.filter(d => d.status !== 'resolved').length;
    score -= Math.min(unresolved * 3, 10);

    return Math.max(Math.min(score, 100), 0);
  },

  // Get safety rating
  getSafetyRating: (partnerId) => {
    const score = safetyRatings.calculateSafetyScore(partnerId);

    let rating;
    if (score >= 90) rating = 'excellent';
    else if (score >= 75) rating = 'good';
    else if (score >= 60) rating = 'fair';
    else rating = 'at_risk';

    return {
      partnerId,
      score,
      rating,
      calculatedAt: new Date().toISOString()
    };
  },

  // Get rating trend
  getRatingTrend: (partnerId, days = 30) => {
    const key = `colleco.trust.safety_ratings.${partnerId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return history.filter(r => new Date(r.calculatedAt) > cutoff);
  }
};

/**
 * Dispute Resolution System
 */
export const disputeResolution = {
  // Dispute statuses
  STATUSES: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    ESCALATED: 'escalated'
  },

  // Create dispute
  createDispute: (complainantId, respondentId, disputeType, description) => {
    const dispute = {
      id: `DISPUTE-${Date.now()}`,
      complainantId,
      respondentId,
      type: disputeType,
      description,
      status: 'open',
      createdAt: new Date().toISOString(),
      timeline: [],
      resolution: null,
      escalated: false
    };

    const disputes = JSON.parse(localStorage.getItem('colleco.trust.disputes') || '[]');
    disputes.push(dispute);
    localStorage.setItem('colleco.trust.disputes', JSON.stringify(disputes));

    return { success: true, dispute };
  },

  // Get dispute
  getDispute: (disputeId) => {
    const disputes = JSON.parse(localStorage.getItem('colleco.trust.disputes') || '[]');
    return disputes.find(d => d.id === disputeId);
  },

  // Update dispute status
  updateDisputeStatus: (disputeId, status, note) => {
    const disputes = JSON.parse(localStorage.getItem('colleco.trust.disputes') || '[]');
    const dispute = disputes.find(d => d.id === disputeId);

    if (!dispute) return { success: false, error: 'Dispute not found' };

    dispute.status = status;
    dispute.timeline.push({
      timestamp: new Date().toISOString(),
      status,
      note
    });

    localStorage.setItem('colleco.trust.disputes', JSON.stringify(disputes));

    return { success: true, dispute };
  },

  // Resolve dispute
  resolveDispute: (disputeId, resolution, compensationIfApplicable) => {
    const dispute = disputeResolution.getDispute(disputeId);
    if (!dispute) return { success: false };

    dispute.status = 'resolved';
    dispute.resolution = {
      decision: resolution,
      compensation: compensationIfApplicable || null,
      resolvedAt: new Date().toISOString()
    };

    const disputes = JSON.parse(localStorage.getItem('colleco.trust.disputes') || '[]');
    const index = disputes.findIndex(d => d.id === disputeId);
    disputes[index] = dispute;
    localStorage.setItem('colleco.trust.disputes', JSON.stringify(disputes));

    return { success: true, dispute };
  },

  // Get disputes for user
  getUserDisputes: (userId) => {
    const disputes = JSON.parse(localStorage.getItem('colleco.trust.disputes') || '[]');
    return disputes.filter(d => d.complainantId === userId || d.respondentId === userId);
  }
};

/**
 * Helper Functions
 */

function calculateExpiry(documentType) {
  const expiryDays = {
    'identity_document': 365,
    'proof_of_address': 365,
    'business_registration': 730,
    'tax_certificate': 365
  };

  const days = expiryDays[documentType] || 365;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString();
}

function calculateRiskScore(userId, userType, transactionData) {
  let score = 0;

  // Amount anomaly (0-30 points)
  if (transactionData.amount > 100000) score += 30;
  else if (transactionData.amount > 50000) score += 15;

  // Frequency anomaly (0-25 points)
  const recentTransactions = getRecentTransactions(userId, 7);
  if (recentTransactions.length > 10) score += 25;
  else if (recentTransactions.length > 5) score += 15;

  // Time anomaly (0-20 points)
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) score += 15; // Unusual hours

  // Device/location change (0-25 points)
  if (transactionData.newDevice && transactionData.newLocation) score += 25;
  else if (transactionData.newDevice || transactionData.newLocation) score += 15;

  // Account age (0-10 points)
  const accountAge = getAccountAge(userId);
  if (accountAge < 7) score += 10;
  else if (accountAge < 30) score += 5;

  return Math.min(score, 100);
}

function identifyFraudFlags(userId, transactionData) {
  const flags = [];

  if (transactionData.amount > 100000) flags.push('high_amount');
  if (transactionData.newDevice) flags.push('new_device');
  if (transactionData.newLocation) flags.push('new_location');
  if (getRecentTransactions(userId, 1).length > 5) flags.push('high_frequency');
  if (getAccountAge(userId) < 7) flags.push('new_account');

  return flags;
}

function getRiskLevel(score) {
  if (score < 20) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

function getRecommendedAction(score) {
  if (score < 20) return 'approve';
  if (score < 50) return 'review';
  if (score < 75) return 'challenge';
  return 'block';
}

function containsProhibitedContent(text) {
  const prohibited = ['spam', 'scam', 'dangerous', 'hate'];
  return prohibited.some(word => text.toLowerCase().includes(word));
}

function isLikelySpam(text) {
  const commonSpamPatterns = ['click here', 'buy now', 'limited time', 'act now'];
  const hasSpamPattern = commonSpamPatterns.some(p => text.toLowerCase().includes(p));
  
  // If it has a spam pattern, it's spam
  if (hasSpamPattern) return true;
  
  // Very short text is only spam if it's really minimal (< 10 chars)
  // Allow short positive reviews like "Great!" "Excellent!" etc
  if (text.length < 10) return false;
  
  return false;
}

function containsContactInfo(text) {
  const contactPattern = /(\+?27|0)[0-9]{9}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return contactPattern.test(text);
}

function isAnomalousVelocity(userId) {
  const history = localStorage.getItem(`colleco.trust.review_velocity.${userId}`);
  if (!history) {
    localStorage.setItem(`colleco.trust.review_velocity.${userId}`, JSON.stringify([Date.now()]));
    return false;
  }

  const timestamps = JSON.parse(history);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentCount = timestamps.filter(t => t > oneHourAgo).length;

  timestamps.push(Date.now());
  localStorage.setItem(`colleco.trust.review_velocity.${userId}`, JSON.stringify(timestamps.slice(-100)));

  return recentCount > 3; // More than 3 reviews in 1 hour
}

function calculateConfidence(issues) {
  if (issues.length === 0) return 0.95;
  return Math.max(0.5, 1 - (issues.length * 0.15));
}

function getPartnerReviews(partnerId) {
  const reviews = JSON.parse(localStorage.getItem(`colleco.reviews.partner.${partnerId}`) || '[]');
  return reviews;
}

function getPartnerDisputes(partnerId) {
  const disputes = JSON.parse(localStorage.getItem('colleco.trust.disputes') || '[]');
  return disputes.filter(d => d.respondentId === partnerId);
}

function getFraudReports(partnerId) {
  const reports = JSON.parse(localStorage.getItem('colleco.trust.fraud_reports') || '[]');
  return reports.filter(r => r.userId === partnerId);
}

function getRecentTransactions(userId, days) {
  const key = `colleco.transactions.${userId}`;
  const transactions = JSON.parse(localStorage.getItem(key) || '[]');
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return transactions.filter(t => new Date(t.timestamp) > cutoff);
}

function getAccountAge(userId) {
  const key = `colleco.user.created.${userId}`;
  const created = localStorage.getItem(key);
  if (!created) return 0;
  const days = (Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(days);
}
