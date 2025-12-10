/**
 * CollEco Passport Loyalty System
 * Tier-based rewards, points, badges, and streaks
 */

// Tier definitions with benefits
export const LOYALTY_TIERS = {
  BRONZE: {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    cashbackRate: 0.05, // 5% back in points
    color: '#CD7F32',
    icon: '🥉',
    benefits: [
      '5% back in points on every booking',
      'Member-only deals',
      'Standard support',
    ],
  },
  SILVER: {
    id: 'silver',
    name: 'Silver',
    minPoints: 5000,
    cashbackRate: 0.07, // 7% back
    color: '#C0C0C0',
    icon: '🥈',
    benefits: [
      '7% back in points on every booking',
      'Priority customer support',
      'Early access to flash sales',
      'Free standard cancellation',
    ],
  },
  GOLD: {
    id: 'gold',
    name: 'Gold',
    minPoints: 15000,
    cashbackRate: 0.10, // 10% back
    color: '#FFD700',
    icon: '🥇',
    benefits: [
      '10% back in points on every booking',
      'Free cancellation on all bookings',
      'Dedicated support line',
      'Exclusive partner perks',
      'Room upgrades when available',
    ],
  },
  PLATINUM: {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 35000,
    cashbackRate: 0.12, // 12% back
    color: '#E5E4E2',
    icon: '💎',
    benefits: [
      '12% back in points on every booking',
      'Free cancellation on all bookings',
      'Dedicated concierge service',
      'Airport lounge access',
      'Guaranteed room upgrades',
      'Late checkout (when available)',
      'Welcome amenities at hotels',
    ],
  },
};

// Badge definitions
export const BADGES = {
  // Travel frequency badges
  WANDERER: { id: 'wanderer', name: 'Wanderer', icon: '🌍', description: 'Completed your first booking', points: 100 },
  EXPLORER: { id: 'explorer', name: 'Explorer', icon: '🧭', description: '5 bookings completed', points: 300 },
  ADVENTURER: { id: 'adventurer', name: 'Adventurer', icon: '⛰️', description: '10 bookings completed', points: 500 },
  GLOBETROTTER: { id: 'globetrotter', name: 'Globetrotter', icon: '✈️', description: '25 bookings completed', points: 1000 },
  
  // Category badges
  BEACH_LOVER: { id: 'beach_lover', name: 'Beach Lover', icon: '🏖️', description: 'Booked 5 beach destinations', points: 250 },
  ADVENTURE_SEEKER: { id: 'adventure_seeker', name: 'Adventure Seeker', icon: '🏔️', description: 'Booked 10 adventure activities', points: 400 },
  CITY_EXPLORER: { id: 'city_explorer', name: 'City Explorer', icon: '🏙️', description: 'Visited 5 different cities', points: 300 },
  LUXURY_TRAVELER: { id: 'luxury_traveler', name: 'Luxury Traveler', icon: '👑', description: 'Booked 3 luxury stays', points: 500 },
  
  // Behavior badges
  EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', icon: '🐦', description: 'Book 60+ days in advance (3 times)', points: 200 },
  SPONTANEOUS: { id: 'spontaneous', name: 'Spontaneous', icon: '⚡', description: 'Booked 5 last-minute trips', points: 200 },
  SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: 'Referred 5 friends who booked', points: 500 },
  REVIEWER: { id: 'reviewer', name: 'Certified Reviewer', icon: '⭐', description: 'Written 10 verified reviews', points: 300 },
  
  // Milestone badges
  FIRST_CLASS: { id: 'first_class', name: 'First Class', icon: '🎖️', description: 'Spent R50,000+ on bookings', points: 800 },
  WEEKEND_WARRIOR: { id: 'weekend_warrior', name: 'Weekend Warrior', icon: '🏃', description: '10 weekend getaways', points: 400 },
  LONG_HAULER: { id: 'long_hauler', name: 'Long Hauler', icon: '🌏', description: 'Booked trips over 7 days (5 times)', points: 350 },
};

// Challenge definitions
export const CHALLENGES = {
  TRIPLE_THREAT: {
    id: 'triple_threat',
    name: 'Triple Threat',
    description: 'Book 3 trips in 6 months',
    points: 500,
    expiryMonths: 6,
    requirement: { type: 'bookings_count', value: 3, timeframe: 6 },
  },
  BRING_A_FRIEND: {
    id: 'bring_a_friend',
    name: 'Bring a Friend',
    description: 'Refer a friend who completes a booking',
    points: 1000,
    requirement: { type: 'referral_conversion', value: 1 },
  },
  COMPLETE_YOUR_PROFILE: {
    id: 'complete_profile',
    name: 'Profile Complete',
    description: 'Add photo, preferences, and payment method',
    points: 200,
    requirement: { type: 'profile_completion', value: 100 },
  },
  REVIEW_MASTER: {
    id: 'review_master',
    name: 'Review Master',
    description: 'Write verified review within 7 days of trip',
    points: 100,
    requirement: { type: 'review_written', value: 1 },
  },
};

// Streak definitions
export const STREAKS = {
  BOOKING_STREAK: {
    name: 'Booking Streak',
    description: 'Book at least once per quarter',
    bonusPoints: {
      2: 100,  // 2 quarters in a row
      3: 300,  // 3 quarters
      4: 750,  // Full year
      8: 2000, // 2 years
    },
  },
};

/**
 * Calculate user's current tier based on total points
 */
export function getUserTier(totalPoints) {
  const tiers = Object.values(LOYALTY_TIERS).sort((a, b) => b.minPoints - a.minPoints);
  return tiers.find(tier => totalPoints >= tier.minPoints) || LOYALTY_TIERS.BRONZE;
}

/**
 * Calculate points earned from a booking
 */
export function calculatePointsFromBooking(bookingAmount, userId = null) {
  const tier = userId ? getUserTier(getLoyaltyData(userId).totalPoints) : LOYALTY_TIERS.BRONZE;
  // 1 point = R1 spent, multiplied by tier cashback rate
  const basePoints = Math.floor(bookingAmount);
  const bonusPoints = Math.floor(basePoints * tier.cashbackRate);
  
  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
    cashbackRate: tier.cashbackRate,
    tier: tier.name,
  };
}

/**
 * Get loyalty data from localStorage
 */
export function getLoyaltyData(userId = 'current') {
  const key = `loyalty:v1:${userId}`;
  const defaultData = {
    userId,
    totalPoints: 0,
    availablePoints: 0, // Points not yet redeemed
    tier: 'bronze',
    tierProgress: 0, // % to next tier
    earnedBadges: [],
    completedChallenges: [],
    streaks: {
      bookingStreak: 0,
      lastBookingDate: null,
    },
    history: [], // Point transactions
    referralCode: generateReferralCode(userId),
    referrals: {
      pending: [], // Referred but not booked
      converted: [], // Referred and booked
      totalEarned: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const stored = localStorage.getItem(key);
    return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
  } catch (e) {
    console.error('Failed to load loyalty data', e);
    return defaultData;
  }
}

/**
 * Save loyalty data to localStorage
 */
export function saveLoyaltyData(data, userId = 'current') {
  const key = `loyalty:v1:${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
    }));
    return true;
  } catch (e) {
    console.error('Failed to save loyalty data', e);
    return false;
  }
}

/**
 * Award points to user
 */
export function awardPoints(amount, reason, metadata = {}, userId = 'current') {
  const data = getLoyaltyData(userId);
  
  const transaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'earn',
    amount,
    reason,
    metadata,
    timestamp: new Date().toISOString(),
  };
  
  data.totalPoints += amount;
  data.availablePoints += amount;
  data.history.unshift(transaction);
  
  // Update tier
  const newTier = getUserTier(data.totalPoints);
  const oldTierId = data.tier;
  data.tier = newTier.id;
  
  // Calculate progress to next tier
  const tiers = Object.values(LOYALTY_TIERS).sort((a, b) => a.minPoints - b.minPoints);
  const currentTierIndex = tiers.findIndex(t => t.id === newTier.id);
  const nextTier = tiers[currentTierIndex + 1];
  
  if (nextTier) {
    const pointsInCurrentTier = data.totalPoints - newTier.minPoints;
    const pointsNeededForNext = nextTier.minPoints - newTier.minPoints;
    data.tierProgress = Math.min(100, (pointsInCurrentTier / pointsNeededForNext) * 100);
  } else {
    data.tierProgress = 100; // Max tier reached
  }
  
  saveLoyaltyData(data, userId);
  
  // Return tier upgrade info if applicable
  return {
    success: true,
    newBalance: data.availablePoints,
    totalPoints: data.totalPoints,
    tierUpgrade: oldTierId !== newTier.id ? { from: oldTierId, to: newTier.id } : null,
    transaction,
  };
}

/**
 * Redeem points (convert to discount/credit)
 */
export function redeemPoints(amount, purpose, metadata = {}, userId = 'current') {
  const data = getLoyaltyData(userId);
  
  if (data.availablePoints < amount) {
    return { success: false, error: 'Insufficient points' };
  }
  
  const transaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'redeem',
    amount: -amount,
    reason: purpose,
    metadata,
    timestamp: new Date().toISOString(),
  };
  
  data.availablePoints -= amount;
  data.history.unshift(transaction);
  
  saveLoyaltyData(data, userId);
  
  return {
    success: true,
    newBalance: data.availablePoints,
    redemptionValue: amount * 0.01, // 100 points = R1
    transaction,
  };
}

/**
 * Award a badge
 */
export function awardBadge(badgeId, userId = 'current') {
  const data = getLoyaltyData(userId);
  const badge = BADGES[badgeId];
  
  if (!badge) return { success: false, error: 'Badge not found' };
  if (data.earnedBadges.includes(badgeId)) return { success: false, error: 'Badge already earned' };
  
  data.earnedBadges.push(badgeId);
  
  // Award badge points
  const pointsResult = awardPoints(badge.points, `Badge: ${badge.name}`, { badgeId }, userId);
  
  saveLoyaltyData(data, userId);
  
  return {
    success: true,
    badge,
    pointsAwarded: badge.points,
    newBalance: pointsResult.newBalance,
  };
}

/**
 * Check and award badges based on user activity
 */
export function checkBadgeEligibility(activityType, activityData, userId = 'current') {
  const awarded = [];
  
  // Example: Check for booking count badges
  if (activityType === 'booking_completed') {
    const bookingCount = activityData.totalBookings || 0;
    
    if (bookingCount === 1 && !hasEarnedBadge('wanderer', userId)) {
      awarded.push(awardBadge('WANDERER', userId));
    } else if (bookingCount === 5 && !hasEarnedBadge('explorer', userId)) {
      awarded.push(awardBadge('EXPLORER', userId));
    } else if (bookingCount === 10 && !hasEarnedBadge('adventurer', userId)) {
      awarded.push(awardBadge('ADVENTURER', userId));
    } else if (bookingCount === 25 && !hasEarnedBadge('globetrotter', userId)) {
      awarded.push(awardBadge('GLOBETROTTER', userId));
    }
  }
  
  return awarded.filter(r => r.success);
}

/**
 * Check if user has earned a badge
 */
export function hasEarnedBadge(badgeId, userId = 'current') {
  const data = getLoyaltyData(userId);
  return data.earnedBadges.includes(badgeId.toUpperCase());
}

/**
 * Generate unique referral code
 */
function generateReferralCode(userId) {
  const prefix = 'CE';
  const uniquePart = userId.toString().slice(0, 4).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${uniquePart}`;
}

/**
 * Process referral (when someone signs up with a code)
 */
export function processReferral(referralCode, newUserId) {
  // Find referrer by code
  // In production, this would query a database
  // For now, we'll store referral mappings in localStorage
  
  const mappingKey = 'loyalty:referralMappings:v1';
  let mappings = {};
  
  try {
    const stored = localStorage.getItem(mappingKey);
    if (stored) mappings = JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load referral mappings', e);
  }
  
  const referrerId = mappings[referralCode];
  
  if (!referrerId) {
    return { success: false, error: 'Invalid referral code' };
  }
  
  // Add to referrer's pending referrals
  const referrerData = getLoyaltyData(referrerId);
  referrerData.referrals.pending.push({
    userId: newUserId,
    signupDate: new Date().toISOString(),
    status: 'pending',
  });
  
  saveLoyaltyData(referrerData, referrerId);
  
  return {
    success: true,
    referrerId,
    message: 'You\'ll both get R500 credit when your first booking is complete!',
  };
}

/**
 * Convert referral (when referred user makes first booking)
 */
export function convertReferral(newUserId) {
  // Find who referred this user
  const mappingKey = 'loyalty:referralMappings:v1';
  let mappings = {};
  
  try {
    const stored = localStorage.getItem(mappingKey);
    if (stored) mappings = JSON.parse(stored);
  } catch (e) {
    return { success: false, error: 'Mapping error' };
  }
  
  // Search for referrer
  let referrerId = null;
  for (const [_code, id] of Object.entries(mappings)) {
    const data = getLoyaltyData(id);
    const pending = data.referrals.pending.find(r => r.userId === newUserId);
    if (pending) {
      referrerId = id;
      break;
    }
  }
  
  if (!referrerId) {
    return { success: false, error: 'Referrer not found' };
  }
  
  const referrerData = getLoyaltyData(referrerId);
  
  // Move from pending to converted
  const refIndex = referrerData.referrals.pending.findIndex(r => r.userId === newUserId);
  if (refIndex !== -1) {
    const ref = referrerData.referrals.pending.splice(refIndex, 1)[0];
    ref.status = 'converted';
    ref.conversionDate = new Date().toISOString();
    referrerData.referrals.converted.push(ref);
  }
  
  // Award points to both (500 points = R500 equivalent)
  const referrerPoints = 500;
  const newUserPoints = 500;
  
  awardPoints(referrerPoints, 'Referral bonus', { referredUserId: newUserId }, referrerId);
  awardPoints(newUserPoints, 'Welcome bonus (referred)', { referrerId }, newUserId);
  
  referrerData.referrals.totalEarned += referrerPoints;
  saveLoyaltyData(referrerData, referrerId);
  
  return {
    success: true,
    referrerPoints,
    newUserPoints,
  };
}

/**
 * Register a referral code mapping
 */
export function registerReferralCode(userId, code) {
  const mappingKey = 'loyalty:referralMappings:v1';
  let mappings = {};
  
  try {
    const stored = localStorage.getItem(mappingKey);
    if (stored) mappings = JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load referral mappings', e);
  }
  
  mappings[code] = userId;
  
  try {
    localStorage.setItem(mappingKey, JSON.stringify(mappings));
    return true;
  } catch (e) {
    console.error('Failed to save referral mapping', e);
    return false;
  }
}

/**
 * Calculate points value in currency
 */
export function pointsToCurrency(points, currency = 'ZAR') {
  // 100 points = R1
  const value = points / 100;
  return {
    value,
    currency,
    formatted: formatCurrency(value, currency),
  };
}

/**
 * Calculate currency value in points
 */
export function currencyToPoints(amount, _currency = 'ZAR') {
  // R1 = 100 points
  return Math.floor(amount * 100);
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'ZAR') {
  const symbols = { ZAR: 'R', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency}${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get tier benefits
 */
export function getTierBenefits(tierId) {
  const tier = Object.values(LOYALTY_TIERS).find(t => t.id === tierId);
  return tier ? tier.benefits : [];
}

/**
 * Get next tier info
 */
export function getNextTierInfo(currentPoints) {
  const currentTier = getUserTier(currentPoints);
  const tiers = Object.values(LOYALTY_TIERS).sort((a, b) => a.minPoints - b.minPoints);
  const currentIndex = tiers.findIndex(t => t.id === currentTier.id);
  const nextTier = tiers[currentIndex + 1];
  
  if (!nextTier) {
    return {
      isMaxTier: true,
      message: 'You\'re at the highest tier!',
    };
  }
  
  const pointsNeeded = nextTier.minPoints - currentPoints;
  const progress = ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100;
  
  return {
    isMaxTier: false,
    nextTier,
    pointsNeeded,
    progress: Math.min(100, Math.max(0, progress)),
    currentTier,
  };
}

export default {
  LOYALTY_TIERS,
  BADGES,
  CHALLENGES,
  STREAKS,
  getUserTier,
  calculatePointsFromBooking,
  getLoyaltyData,
  saveLoyaltyData,
  awardPoints,
  redeemPoints,
  awardBadge,
  checkBadgeEligibility,
  hasEarnedBadge,
  processReferral,
  convertReferral,
  registerReferralCode,
  pointsToCurrency,
  currencyToPoints,
  getTierBenefits,
  getNextTierInfo,
};
