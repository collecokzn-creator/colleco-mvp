/**
 * Booking Integration for Loyalty System
 * 
 * Integrates CollEco Passport loyalty system with booking flows.
 * Handles automatic point awards, badge checks, tier upgrades, and referral conversions.
 */

import {
  calculatePointsFromBooking,
  awardPoints,
  checkBadgeEligibility,
  convertReferral,
  getLoyaltyData,
} from './loyaltySystem';
import { notify } from './notify';

/**
 * Process booking completion and award loyalty points
 * @param {Object} booking - The completed booking object
 * @param {string} booking.id - Booking ID
 * @param {number} booking.amount - Booking amount in ZAR
 * @param {string} booking.type - Booking type (accommodation, flight, car, etc.)
 * @param {string} booking.userId - User ID
 * @param {Date} booking.checkInDate - Check-in date
 * @returns {Object} - Result with points awarded and tier info
 */
export function processBookingRewards(booking) {
  const { id, amount, type, userId, checkInDate } = booking;
  
  if (!userId || !amount) {
    console.error('[Booking Integration] Missing required fields:', { userId, amount });
    return { success: false, error: 'Missing required fields' };
  }

  try {
    // Calculate points for this booking
    const pointsCalc = calculatePointsFromBooking(amount, userId);
    
    // Award points with booking metadata
    const awardResult = awardPoints(
      pointsCalc.totalPoints,
      `Booking completed: ${type}`,
      {
        bookingId: id,
        bookingType: type,
        bookingAmount: amount,
        basePoints: pointsCalc.basePoints,
        bonusPoints: pointsCalc.bonusPoints,
        cashbackRate: pointsCalc.cashbackRate,
      },
      userId
    );

    // Check if user just got first booking (Wanderer badge)
    const loyaltyData = getLoyaltyData(userId);
    const totalBookings = loyaltyData.history.filter(
      (t) => t.type === 'earn' && t.metadata?.bookingType
    ).length;

    // Check badge eligibility
    checkBadgeEligibility('booking_completed', {
      totalBookings,
      bookingType: type,
      bookingAmount: amount,
      checkInDate,
      userId,
    });

    // Notify user of points earned
    notify({
      title: '🎉 Points Earned!',
      body: `You earned ${pointsCalc.totalPoints.toLocaleString()} points from your ${type} booking.${awardResult.tierUpgrade ? ` Congratulations! You've been upgraded to ${awardResult.tierUpgrade.to}!` : ''}`,
      icon: '/assets/icons/icon-192x192.png',
      tag: 'loyalty-points',
      requireInteraction: false,
      data: {
        type: 'loyalty_points_earned',
        bookingId: id,
        points: pointsCalc.totalPoints,
        tierUpgrade: awardResult.tierUpgrade,
      },
    });

    // Show tier upgrade notification separately if it happened
    if (awardResult.tierUpgrade) {
      notify({
        title: '🎊 Tier Upgrade!',
        body: `You've been promoted to ${awardResult.tierUpgrade.to}! Enjoy ${getTierBenefitsText(awardResult.tierUpgrade.to)}`,
        icon: '/assets/icons/icon-192x192.png',
        tag: 'tier-upgrade',
        requireInteraction: true,
        data: {
          type: 'tier_upgrade',
          from: awardResult.tierUpgrade.from,
          to: awardResult.tierUpgrade.to,
        },
      });
    }

    return {
      success: true,
      pointsEarned: pointsCalc.totalPoints,
      tierUpgrade: awardResult.tierUpgrade,
      newBalance: awardResult.newBalance,
    };
  } catch (error) {
    console.error('[Booking Integration] Error processing rewards:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user signed up with a referral code and convert if this is their first booking
 * @param {string} userId - User ID
 * @returns {Object} - Referral conversion result
 */
export function processReferralConversion(userId) {
  try {
    const loyaltyData = getLoyaltyData(userId);
    
    // Check if user has any completed bookings (points earned from bookings)
    const hasBookings = loyaltyData.history.some(
      (t) => t.type === 'earn' && t.metadata?.bookingType
    );

    // If this is the first booking, check for referral
    if (hasBookings && loyaltyData.referrals?.referred_by) {
      // User was referred and this is first booking - convert referral
      const conversionResult = convertReferral(userId);
      
      if (conversionResult.success) {
        // Notify both users
        notify({
          title: '🎁 Referral Bonus!',
          body: `You earned R500 points for completing your first booking!`,
          icon: '/assets/icons/icon-192x192.png',
          tag: 'referral-bonus',
          requireInteraction: false,
          data: {
            type: 'referral_conversion',
            points: 500,
          },
        });

        return conversionResult;
      }
    }

    return { success: false, reason: 'No pending referral to convert' };
  } catch (error) {
    console.error('[Booking Integration] Error processing referral:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Apply loyalty discount (points redemption) to booking
 * @param {number} pointsToRedeem - Number of points to redeem
 * @param {string} userId - User ID
 * @returns {Object} - Discount amount and updated balance
 */
export function applyLoyaltyDiscount(pointsToRedeem, userId) {
  try {
    const loyaltyData = getLoyaltyData(userId);
    
    if (pointsToRedeem > loyaltyData.availablePoints) {
      return {
        success: false,
        error: `Insufficient points. Available: ${loyaltyData.availablePoints}, Requested: ${pointsToRedeem}`,
      };
    }

    if (pointsToRedeem < 100) {
      return {
        success: false,
        error: 'Minimum redemption is 100 points (R1)',
      };
    }

    // Points to currency: 100 points = R1
    const discountAmount = pointsToRedeem / 100;

    return {
      success: true,
      discountAmount,
      pointsRedeemed: pointsToRedeem,
      message: `${pointsToRedeem} points = R${discountAmount.toFixed(2)} discount`,
    };
  } catch (error) {
    console.error('[Booking Integration] Error applying discount:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get tier benefits text for notifications
 * @param {string} tierId - Tier ID (bronze, silver, gold, platinum)
 * @returns {string} - Human-readable benefits
 */
function getTierBenefitsText(tierId) {
  const benefits = {
    bronze: '5% cashback on bookings',
    silver: '7% cashback + priority support',
    gold: '10% cashback + exclusive deals + early access',
    platinum: '12% cashback + VIP concierge + special privileges',
  };
  
  return benefits[tierId.toLowerCase()] || 'enhanced benefits';
}

/**
 * Check early bird booking eligibility (book 60+ days ahead)
 * @param {Date} checkInDate - Check-in date
 * @param {string} userId - User ID
 * @returns {boolean} - Whether user gets early bird bonus
 */
export function checkEarlyBirdBonus(checkInDate, userId) {
  const daysAhead = Math.floor(
    (new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysAhead >= 60) {
    // Award Early Bird badge
    checkBadgeEligibility('early_booking', { daysAhead, userId });
    
    return true;
  }

  return false;
}

/**
 * Check spontaneous booking (book within 7 days)
 * @param {Date} checkInDate - Check-in date
 * @param {string} userId - User ID
 * @returns {boolean} - Whether user gets spontaneous badge
 */
export function checkSpontaneousBonus(checkInDate, userId) {
  const daysAhead = Math.floor(
    (new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysAhead <= 7) {
    // Award Spontaneous badge
    checkBadgeEligibility('spontaneous_booking', { daysAhead, userId });
    
    return true;
  }

  return false;
}

/**
 * Track review submission and award badge if eligible
 * @param {string} userId - User ID
 * @returns {void}
 */
export function processReviewSubmission(userId) {
  try {
    const loyaltyData = getLoyaltyData(userId);
    
    // Count reviews in transaction history
    const reviewCount = loyaltyData.history.filter(
      (t) => t.reason?.includes('review') || t.metadata?.type === 'review'
    ).length;

    // Check if eligible for Reviewer badge
    checkBadgeEligibility('review_submitted', { reviewCount, userId });

    // Award points for review
    awardPoints(100, 'Review submitted', { type: 'review' }, userId);

    notify({
      title: '⭐ Review Points Earned!',
      body: 'Thanks for your review! You earned 100 points.',
      icon: '/assets/icons/icon-192x192.png',
      tag: 'review-points',
    });
  } catch (error) {
    console.error('[Booking Integration] Error processing review:', error);
  }
}

/**
 * Process social sharing and award points
 * @param {string} platform - Social platform (facebook, twitter, whatsapp)
 * @param {string} userId - User ID
 * @returns {void}
 */
export function processSocialShare(platform, userId) {
  try {
    // Award Social Butterfly badge if eligible
    checkBadgeEligibility('social_share', { platform, userId });

    // Award 50 points for sharing
    awardPoints(50, `Shared on ${platform}`, { type: 'social_share', platform }, userId);
  } catch (error) {
    console.error('[Booking Integration] Error processing social share:', error);
  }
}

/**
 * Get loyalty summary for user (for display in booking confirmation)
 * @param {string} userId - User ID
 * @returns {Object} - Loyalty summary with tier, points, next tier info
 */
export function getLoyaltySummary(userId) {
  try {
    const loyaltyData = getLoyaltyData(userId);
    
    return {
      tier: loyaltyData.tier,
      availablePoints: loyaltyData.availablePoints,
      totalPoints: loyaltyData.totalPoints,
      tierProgress: loyaltyData.tierProgress,
      badges: loyaltyData.earnedBadges.length,
      referralCode: loyaltyData.referralCode,
    };
  } catch (error) {
    console.error('[Booking Integration] Error getting loyalty summary:', error);
    return null;
  }
}

/**
 * Hook: Call after booking payment completes
 * @param {Object} booking - Booking object
 * @returns {void}
 */
export function onBookingComplete(booking) {
  // Process loyalty rewards
  const rewardsResult = processBookingRewards(booking);
  
  // Check for referral conversion
  if (rewardsResult.success) {
    processReferralConversion(booking.userId);
  }
  
  // Check early bird / spontaneous bonuses
  if (booking.checkInDate) {
    checkEarlyBirdBonus(booking.checkInDate, booking.userId);
    checkSpontaneousBonus(booking.checkInDate, booking.userId);
  }
}

/**
 * Hook: Call after user submits a review
 * @param {string} userId - User ID
 * @returns {void}
 */
export function onReviewSubmit(userId) {
  processReviewSubmission(userId);
}

/**
 * Hook: Call when user shares content
 * @param {string} platform - Social platform
 * @param {string} userId - User ID
 * @returns {void}
 */
export function onSocialShare(platform, userId) {
  processSocialShare(platform, userId);
}
