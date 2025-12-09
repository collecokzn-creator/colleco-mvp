/**
 * Gamification Integration Module
 * 
 * Automatically awards points, updates challenges, and tracks achievements
 * when users complete bookings and other platform activities.
 */

import {
  awardPoints,
  updateChallengeProgress,
  updateStreak,
  updateLeaderboard,
  POINT_VALUES,
} from './gamificationEngine';

// ==================== BOOKING INTEGRATION ====================

/**
 * Award points and update challenges when a booking is made
 */
export function onBookingCreated(userId, userType, bookingData) {
  // Validate inputs
  if (!userId) {
    return { success: false, error: 'userId is required' };
  }
  
  if (!bookingData) {
    return { success: false, error: 'bookingData is required' };
  }
  
  const { bookingId, totalAmount, bookingType, partnerId } = bookingData;
  
  const challengesUpdated = [];
  
  // Award base points for booking
  const pointsResult = awardPoints(userId, 'booking_made', 1);
  
  // Update traveler challenges
  if (userType === 'traveler') {
    // Update trip count challenges
    updateChallengeProgress(userId, 'first_trip', 1, 'increment');
    challengesUpdated.push('first_trip');
    updateChallengeProgress(userId, 'trip_milestone_10', 1, 'increment');
    challengesUpdated.push('trip_milestone_10');
    
    // Update spending challenges
    updateChallengeProgress(userId, 'big_spender', totalAmount, 'increment');
    challengesUpdated.push('big_spender');
  }
  
  // Update partner challenges (if booking is for a partner's property)
  if (partnerId) {
    updateChallengeProgress(partnerId, 'booking_milestone_10', 1, 'increment');
    updateChallengeProgress(partnerId, 'booking_milestone_100', 1, 'increment');
  }
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    totalPoints: pointsResult.totalPoints,
    challengesUpdated,
    message: `+${pointsResult.pointsAwarded} points for booking!`,
  };
}

/**
 * Award points when a booking is confirmed
 */
export function onBookingConfirmed(userId, userType, bookingData) {
  const { partnerId, totalAmount } = bookingData;
  
  const challengesUpdated = [];
  
  // Award confirmation bonus points
  const pointsResult = awardPoints(userId, 'booking_confirmed', 1);
  
  // Update partner revenue challenges
  if (partnerId && userType === 'partner') {
    updateChallengeProgress(partnerId, 'revenue_starter', totalAmount, 'increment');
    challengesUpdated.push('revenue_starter');
    updateChallengeProgress(partnerId, 'revenue_pro', totalAmount, 'increment');
    challengesUpdated.push('revenue_pro');
    updateChallengeProgress(partnerId, 'monthly_target', totalAmount, 'increment');
    challengesUpdated.push('monthly_target');
    
    // Update partner leaderboard
    updateLeaderboard(partnerId, 'partner', 'revenue', totalAmount);
    updateLeaderboard(partnerId, 'partner', 'bookings', 1);
  }
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    challengesUpdated,
    message: `Booking confirmed! +${pointsResult.pointsAwarded} points`,
  };
}

/**
 * Award points when a trip is completed
 */
export function onTripCompleted(userId, tripData) {
  const { destination, country, province } = tripData;
  
  const challengesUpdated = [];
  
  // Award trip completion points
  const pointsResult = awardPoints(userId, 'trip_completed', 1);
  
  // Update geography challenges
  if (country) {
    updateChallengeProgress(userId, 'country_collector', 1, 'increment');
    challengesUpdated.push('country_collector');
  }
  
  if (province) {
    updateChallengeProgress(userId, 'province_explorer', 1, 'increment');
    challengesUpdated.push('province_explorer');
  }
  
  // Update trip count on leaderboard
  updateLeaderboard(userId, 'traveler', 'trips', 1);
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    challengesUpdated,
    message: `Trip completed! +${pointsResult.pointsAwarded} points`,
  };
}

// ==================== REVIEW INTEGRATION ====================

/**
 * Award points when a review is written
 */
export function onReviewSubmitted(userId, userType, reviewData) {
  const { rating, hasPhotos, hasText, partnerId } = reviewData;
  
  // Base review points
  let pointsResult = awardPoints(userId, 'review_written', 1);
  
  // Bonus for detailed reviews
  if (hasPhotos) {
    const photoBonus = awardPoints(userId, 'profile_photo_added', 1);
    pointsResult.pointsAwarded += photoBonus.pointsAwarded;
  }
  
  // Update traveler review challenges
  if (userType === 'traveler') {
    updateChallengeProgress(userId, 'reviewer', 1, 'increment');
  }
  
  // Update partner rating challenges (5-star streak)
  if (partnerId && rating === 5) {
    updateChallengeProgress(partnerId, 'five_star_streak', 1, 'increment');
  }
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    message: `Review submitted! +${pointsResult.pointsAwarded} points`,
  };
}

// ==================== LOYALTY INTEGRATION ====================

/**
 * Award points when loyalty tier is reached
 */
export function onLoyaltyTierReached(userId, tierData) {
  const { tier } = tierData;
  
  // Award tier-specific points
  const tierPoints = {
    bronze: 100,
    silver: 500,
    gold: 1500,
    platinum: 3000,
  };
  
  const points = tierPoints[tier.toLowerCase()] || 0;
  const pointsResult = awardPoints(userId, 'profile_complete', points / 100); // Use multiplier
  
  // Update loyalty tier challenges
  updateChallengeProgress(userId, `loyalty_tier_${tier.toLowerCase()}`, tier, 'set');
  
  return {
    success: true,
    pointsAwarded: points,
    message: `${tier} tier reached! +${points} points`,
  };
}

// ==================== REFERRAL INTEGRATION ====================

/**
 * Award points when a referral signs up
 */
export function onReferralSignup(userId, referralData) {
  const { referredUserId } = referralData;
  
  // Award referral signup points
  const pointsResult = awardPoints(userId, 'referral_signup', 1);
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    message: `Friend signed up! +${pointsResult.pointsAwarded} points`,
  };
}

/**
 * Award points when a referral makes their first booking
 */
export function onReferralBooking(userId, referralData) {
  const { referredUserId, bookingAmount } = referralData;
  
  const challengesUpdated = [];
  
  // Award referral booking points
  const pointsResult = awardPoints(userId, 'referral_booking', 1);
  
  // Update referral challenge
  updateChallengeProgress(userId, 'referral_champion', 1, 'increment');
  challengesUpdated.push('referral_champion');
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    challengesUpdated,
    message: `Referral made a booking! +${pointsResult.pointsAwarded} points`,
  };
}

// ==================== PARTNER INTEGRATION ====================

/**
 * Award points for partner quick responses
 */
export function onPartnerQuickResponse(partnerId, responseData) {
  const { responseTimeMinutes } = responseData;
  
  // Award points if response within 1 hour
  if (responseTimeMinutes <= 60) {
    const pointsResult = awardPoints(partnerId, 'quick_response', 1);
    
    // Update quick responder challenge
    updateChallengeProgress(partnerId, 'quick_responder', 1, 'increment');
    
    return {
      success: true,
      pointsAwarded: pointsResult.pointsAwarded,
      message: `Quick response! +${pointsResult.pointsAwarded} points`,
    };
  }
  
  return { 
    success: true, 
    pointsAwarded: 0,
    message: 'Response time > 1 hour, no points awarded'
  };
}

/**
 * Update partner occupancy challenge
 */
export function onOccupancyUpdate(partnerId, occupancyData) {
  const { occupancyRate, daysAtHighOccupancy } = occupancyData;
  
  // Update high occupancy challenge (90%+ for 30 days)
  if (occupancyRate >= 90) {
    updateChallengeProgress(partnerId, 'high_occupancy', daysAtHighOccupancy, 'set');
  }
  
  return {
    success: true,
    message: 'Occupancy data updated',
  };
}

/**
 * Update partner rating on leaderboard
 */
export function onPartnerRatingUpdate(partnerId, ratingData) {
  const { averageRating, reviewCount } = ratingData;
  
  // Update rating leaderboard
  updateLeaderboard(partnerId, 'partner', 'rating', averageRating);
  
  return {
    success: true,
    message: 'Rating leaderboard updated',
  };
}

// ==================== PROFILE INTEGRATION ====================

/**
 * Award points for profile completion
 */
export function onProfileCompleted(userId) {
  const pointsResult = awardPoints(userId, 'profile_complete', 1);
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    message: `Profile completed! +${pointsResult.pointsAwarded} points`,
  };
}

/**
 * Award points for adding profile photo
 */
export function onProfilePhotoAdded(userId) {
  const pointsResult = awardPoints(userId, 'profile_photo_added', 1);
  
  return {
    success: true,
    pointsAwarded: pointsResult.pointsAwarded,
    message: `Photo added! +${pointsResult.pointsAwarded} points`,
  };
}

// ==================== STREAK INTEGRATION ====================

/**
 * Update login streak
 */
export function onUserLogin(userId) {
  const streak = updateStreak(userId, 'login');
  
  let bonusPoints = 0;
  let message = `Welcome back! ${streak.current}-day streak`;
  
  // Award bonus points for milestone streaks
  if (streak.current === 7) {
    const pointsResult = awardPoints(userId, 'profile_complete', 0.5); // 50 bonus points
    bonusPoints = pointsResult.pointsAwarded;
    message = `🔥 7-day streak! +${bonusPoints} bonus points`;
  } else if (streak.current === 30) {
    const pointsResult = awardPoints(userId, 'profile_complete', 2); // 200 bonus points
    bonusPoints = pointsResult.pointsAwarded;
    message = `🏆 30-day streak! +${bonusPoints} bonus points`;
  }
  
  return {
    success: true,
    streak: streak.current,
    best: streak.best,
    bonusPoints,
    message,
  };
}

// ==================== BATCH OPERATIONS ====================

/**
 * Process multiple gamification events at once
 */
export function batchProcessEvents(events) {
  const results = [];
  
  for (const event of events) {
    const { type, userId, userType, data } = event;
    
    let result;
    switch (type) {
      case 'booking_created':
        result = onBookingCreated(userId, userType, data);
        break;
      case 'booking_confirmed':
        result = onBookingConfirmed(userId, userType, data);
        break;
      case 'trip_completed':
        result = onTripCompleted(userId, data);
        break;
      case 'review_submitted':
        result = onReviewSubmitted(userId, userType, data);
        break;
      case 'referral_signup':
        result = onReferralSignup(userId, data);
        break;
      case 'referral_booking':
        result = onReferralBooking(userId, data);
        break;
      case 'profile_completed':
        result = onProfileCompleted(userId);
        break;
      case 'user_login':
        result = onUserLogin(userId);
        break;
      default:
        result = { success: false, message: `Unknown event type: ${type}` };
    }
    
    results.push({ event: type, userId, ...result });
  }
  
  return results;
}

// ==================== EXPORTS ====================

export default {
  onBookingCreated,
  onBookingConfirmed,
  onTripCompleted,
  onReviewSubmitted,
  onLoyaltyTierReached,
  onReferralSignup,
  onReferralBooking,
  onPartnerQuickResponse,
  onOccupancyUpdate,
  onPartnerRatingUpdate,
  onProfileCompleted,
  onProfilePhotoAdded,
  onUserLogin,
  batchProcessEvents,
};
