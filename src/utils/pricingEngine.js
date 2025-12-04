/**
 * Dynamic Pricing Engine for CollEco Travel
 * 
 * Implements demand-based pricing, surge fees, discounts, and revenue optimization
 * strategies to maximize revenue while maintaining competitive rates.
 */

/**
 * Pricing configuration constants
 */
export const PRICING_CONFIG = {
  // Demand-based surge multipliers
  DEMAND_LEVELS: {
    LOW: { threshold: 0.4, multiplier: 0.85, label: 'Low Demand' },      // -15%
    MODERATE: { threshold: 0.6, multiplier: 1.0, label: 'Normal' },      // 0%
    HIGH: { threshold: 0.8, multiplier: 1.15, label: 'High Demand' },    // +15%
    VERY_HIGH: { threshold: 1.0, multiplier: 1.3, label: 'Peak Demand' }, // +30%
  },

  // Booking window discounts
  BOOKING_WINDOWS: {
    EARLY_BIRD: { daysAhead: 60, discount: 0.15, label: 'Early Bird (-15%)' },
    ADVANCE: { daysAhead: 30, discount: 0.10, label: 'Advance (-10%)' },
    STANDARD: { daysAhead: 7, discount: 0.0, label: 'Standard' },
    LAST_MINUTE: { daysAhead: 0, discount: -0.20, label: 'Last Minute (+20% surge)' },
  },

  // Group booking discounts
  GROUP_DISCOUNTS: {
    2: 0.02,      // 2 rooms/units: 2% discount
    3: 0.05,      // 3 rooms/units: 5% discount
    5: 0.10,      // 5 rooms/units: 10% discount
    10: 0.15,     // 10+ rooms/units: 15% discount
  },

  // Length of stay discounts
  LENGTH_OF_STAY_DISCOUNTS: {
    7: 0.05,      // 7+ nights: 5% discount
    14: 0.10,     // 14+ nights: 10% discount
    30: 0.15,     // 30+ nights: 15% discount
  },

  // Fixed fees
  BOOKING_FEE: 25,                   // Fixed booking fee in ZAR
  PAYMENT_PROCESSING_FEE: 0.025,    // 2.5% payment processing fee
  SURGE_PRICING_FEE_CAP: 50,        // Max surge fee in ZAR

  // Time-based pricing (peak seasons)
  PEAK_SEASONS: [
    { name: 'Summer', start: [12, 15], end: [1, 15], multiplier: 1.25 },  // Dec 15 - Jan 15
    { name: 'Easter', start: [3, 1], end: [4, 30], multiplier: 1.20 },    // Mar - Apr
    { name: 'School Holidays', start: [6, 1], end: [7, 31], multiplier: 1.30 }, // Jun - Jul
    { name: 'Christmas', start: [12, 1], end: [1, 5], multiplier: 1.35 },  // Dec 1 - Jan 5
  ],

  // Occupancy thresholds for pricing
  OCCUPANCY_THRESHOLDS: {
    0.5: 1.0,    // 0-50% occupied: base price
    0.7: 1.1,    // 50-70% occupied: +10%
    0.85: 1.25,  // 70-85% occupied: +25%
    0.95: 1.4,   // 85-95% occupied: +40%
    1.0: 1.5,    // 95%+ occupied: +50%
  },
};

/**
 * Calculate dynamic price based on multiple factors
 * 
 * @param {Object} params - Pricing parameters
 * @param {number} params.basePrice - Base room/property price
 * @param {Date} params.checkInDate - Check-in date
 * @param {Date} params.checkOutDate - Check-out date
 * @param {number} params.occupancyRate - Current occupancy (0-1)
 * @param {number} params.availableInventory - Number of units available
 * @param {number} params.totalInventory - Total units
 * @param {string} params.property Type - Type: 'accommodation', 'flight', 'car', etc.
 * @param {number} params.groupSize - Number of rooms/units being booked
 * @param {string} params.userTier - Loyalty tier: bronze, silver, gold, platinum
 * @returns {Object} - Pricing breakdown
 */
export function calculateDynamicPrice(params) {
  const {
    basePrice,
    checkInDate,
    checkOutDate,
    occupancyRate = 0.6,
    availableInventory = 10,
    totalInventory = 20,
    propertyType = 'accommodation',
    groupSize = 1,
    userTier = 'bronze',
  } = params;

  if (!basePrice || basePrice <= 0) {
    return { success: false, error: 'Invalid base price' };
  }

  try {
    let price = basePrice;
    const breakdown = {
      basePrice,
      adjustments: [],
    };

    // 1. Demand-based pricing (occupancy rate)
    const demandMultiplier = getDemandMultiplier(occupancyRate);
    price *= demandMultiplier;
    breakdown.adjustments.push({
      type: 'demand',
      label: `Occupancy: ${(occupancyRate * 100).toFixed(0)}%`,
      multiplier: demandMultiplier,
      impact: price - basePrice,
    });

    // 2. Booking window discount
    const bookingWindowDiscount = getBookingWindowDiscount(checkInDate);
    price *= (1 + bookingWindowDiscount);
    breakdown.adjustments.push({
      type: 'booking_window',
      label: getBookingWindowLabel(checkInDate),
      multiplier: 1 + bookingWindowDiscount,
      impact: price - basePrice,
    });

    // 3. Length of stay discount
    const los = calculateLengthOfStay(checkInDate, checkOutDate);
    const losDiscount = getLengthOfStayDiscount(los);
    price *= (1 - losDiscount);
    breakdown.adjustments.push({
      type: 'length_of_stay',
      label: `${los} nights: -${(losDiscount * 100).toFixed(0)}%`,
      multiplier: 1 - losDiscount,
      impact: -(price * losDiscount),
    });

    // 4. Group booking discount
    const groupDiscount = getGroupDiscount(groupSize);
    price *= (1 - groupDiscount);
    breakdown.adjustments.push({
      type: 'group',
      label: `Group of ${groupSize}: -${(groupDiscount * 100).toFixed(0)}%`,
      multiplier: 1 - groupDiscount,
      impact: -(price * groupDiscount),
    });

    // 5. Loyalty tier discount
    const tierDiscount = getLoyaltyTierDiscount(userTier);
    price *= (1 - tierDiscount);
    breakdown.adjustments.push({
      type: 'loyalty',
      label: `${userTier} tier: -${(tierDiscount * 100).toFixed(0)}%`,
      multiplier: 1 - tierDiscount,
      impact: -(price * tierDiscount),
    });

    // 6. Peak season multiplier
    const seasonMultiplier = getSeasonMultiplier(checkInDate);
    if (seasonMultiplier > 1) {
      price *= seasonMultiplier;
      breakdown.adjustments.push({
        type: 'season',
        label: `Peak season: +${((seasonMultiplier - 1) * 100).toFixed(0)}%`,
        multiplier: seasonMultiplier,
        impact: price - basePrice,
      });
    }

    // 7. Inventory scarcity premium (low availability)
    const inventoryMultiplier = getInventoryMultiplier(availableInventory, totalInventory);
    if (inventoryMultiplier > 1) {
      price *= inventoryMultiplier;
      breakdown.adjustments.push({
        type: 'scarcity',
        label: `Low availability: +${((inventoryMultiplier - 1) * 100).toFixed(0)}%`,
        multiplier: inventoryMultiplier,
        impact: price - basePrice,
      });
    }

    // Round to nearest 50 (customer psychology)
    const roundedPrice = Math.round(price / 50) * 50;

    // Calculate fees
    const bookingFee = PRICING_CONFIG.BOOKING_FEE;
    const paymentFee = roundedPrice * PRICING_CONFIG.PAYMENT_PROCESSING_FEE;

    const subtotal = roundedPrice;
    const totalFees = bookingFee + paymentFee;
    const totalPrice = subtotal + totalFees;

    breakdown.finalPrice = roundedPrice;
    breakdown.bookingFee = bookingFee;
    breakdown.paymentFee = Math.round(paymentFee);
    breakdown.totalFees = totalFees;
    breakdown.totalPrice = totalPrice;

    // Calculate savings vs base price
    breakdown.savings = Math.max(0, basePrice - roundedPrice);
    breakdown.increase = Math.max(0, roundedPrice - basePrice);

    // Pricing alerts for partner
    breakdown.alerts = generatePricingAlerts({
      basePrice,
      finalPrice: roundedPrice,
      occupancyRate,
      userTier,
      los,
    });

    return {
      success: true,
      ...breakdown,
    };
  } catch (error) {
    console.error('[Pricing Engine] Error calculating price:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get multiplier based on demand level
 */
function getDemandMultiplier(occupancyRate) {
  const config = PRICING_CONFIG.DEMAND_LEVELS;
  
  if (occupancyRate >= config.VERY_HIGH.threshold) {
    return config.VERY_HIGH.multiplier;
  } else if (occupancyRate >= config.HIGH.threshold) {
    return config.HIGH.multiplier;
  } else if (occupancyRate >= config.MODERATE.threshold) {
    return config.MODERATE.multiplier;
  } else {
    return config.LOW.multiplier;
  }
}

/**
 * Get booking window discount/premium
 */
function getBookingWindowDiscount(checkInDate) {
  const daysAhead = Math.ceil(
    (new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const windows = PRICING_CONFIG.BOOKING_WINDOWS;

  if (daysAhead >= windows.EARLY_BIRD.daysAhead) {
    return -windows.EARLY_BIRD.discount;
  } else if (daysAhead >= windows.ADVANCE.daysAhead) {
    return -windows.ADVANCE.discount;
  } else if (daysAhead >= windows.STANDARD.daysAhead) {
    return windows.STANDARD.discount;
  } else {
    return windows.LAST_MINUTE.discount;
  }
}

/**
 * Get booking window label
 */
function getBookingWindowLabel(checkInDate) {
  const daysAhead = Math.ceil(
    (new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysAhead >= 60) {
    return 'Early Bird (-15%)';
  } else if (daysAhead >= 30) {
    return 'Advance (-10%)';
  } else if (daysAhead >= 7) {
    return 'Standard';
  } else {
    return 'Last Minute (+20%)';
  }
}

/**
 * Calculate length of stay in nights
 */
function calculateLengthOfStay(checkInDate, checkOutDate) {
  const nights = Math.ceil(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, nights);
}

/**
 * Get length of stay discount
 */
function getLengthOfStayDiscount(nights) {
  const discounts = PRICING_CONFIG.LENGTH_OF_STAY_DISCOUNTS;

  if (nights >= 30) return discounts[30];
  if (nights >= 14) return discounts[14];
  if (nights >= 7) return discounts[7];
  return 0;
}

/**
 * Get group booking discount
 */
function getGroupDiscount(groupSize) {
  const discounts = PRICING_CONFIG.GROUP_DISCOUNTS;

  if (groupSize >= 10) return discounts[10];
  if (groupSize >= 5) return discounts[5];
  if (groupSize >= 3) return discounts[3];
  if (groupSize >= 2) return discounts[2];
  return 0;
}

/**
 * Get loyalty tier discount
 */
function getLoyaltyTierDiscount(tier) {
  const tierDiscounts = {
    bronze: 0.02,      // 2%
    silver: 0.05,      // 5%
    gold: 0.08,        // 8%
    platinum: 0.12,    // 12%
  };

  return tierDiscounts[tier?.toLowerCase()] || 0;
}

/**
 * Get season multiplier
 */
function getSeasonMultiplier(checkInDate) {
  const date = new Date(checkInDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const season of PRICING_CONFIG.PEAK_SEASONS) {
    const [startMonth, startDay] = season.start;
    const [endMonth, endDay] = season.end;

    let isInSeason = false;

    if (startMonth <= endMonth) {
      // Season doesn't wrap year (e.g., Mar-Apr)
      isInSeason =
        (month > startMonth || (month === startMonth && day >= startDay)) &&
        (month < endMonth || (month === endMonth && day <= endDay));
    } else {
      // Season wraps year (e.g., Dec-Jan)
      isInSeason =
        (month > startMonth || (month === startMonth && day >= startDay)) ||
        (month < endMonth || (month === endMonth && day <= endDay));
    }

    if (isInSeason) {
      return season.multiplier;
    }
  }

  return 1.0; // No peak season
}

/**
 * Get inventory multiplier based on scarcity
 */
function getInventoryMultiplier(availableInventory, totalInventory) {
  if (!totalInventory || totalInventory === 0) return 1.0;

  const availabilityRate = availableInventory / totalInventory;

  // Lower availability = higher premium
  if (availabilityRate <= 0.1) return 1.5;  // 90% sold: +50%
  if (availabilityRate <= 0.2) return 1.35; // 80% sold: +35%
  if (availabilityRate <= 0.3) return 1.2;  // 70% sold: +20%
  if (availabilityRate <= 0.5) return 1.1;  // 50% sold: +10%
  return 1.0;
}

/**
 * Generate pricing alerts for partners
 */
function generatePricingAlerts(params) {
  const { basePrice, finalPrice, occupancyRate, userTier, los } = params;
  const alerts = [];

  // Alert 1: High occupancy
  if (occupancyRate > 0.9) {
    alerts.push({
      type: 'high_occupancy',
      message: '⚠️ High occupancy - Consider increasing price further',
      action: 'Increase base price by 10-20%',
    });
  }

  // Alert 2: Significant price increase
  if (finalPrice > basePrice * 1.25) {
    alerts.push({
      type: 'price_surge',
      message: '📈 Price surge active - 25%+ increase from base',
      action: 'Monitor bookings carefully',
    });
  }

  // Alert 3: Significant discount
  if (finalPrice < basePrice * 0.75) {
    alerts.push({
      type: 'heavy_discount',
      message: '💰 Heavy discount active - Consider lower base price',
      action: 'Analyze demand trends',
    });
  }

  // Alert 4: Loyalty tier usage
  if (userTier && userTier !== 'bronze') {
    alerts.push({
      type: 'loyalty_applied',
      message: `🎟️ Loyalty discount applied (${userTier} tier)`,
      action: 'Upsell premium services',
    });
  }

  return alerts;
}

/**
 * Calculate competitor pricing comparison
 * 
 * @param {Object} params - Comparison parameters
 * @param {number} params.ourPrice - Our final price
 * @param {number} params.competitorPrices - Array of competitor prices
 * @returns {Object} - Pricing comparison
 */
export function getPricingComparison(params) {
  const { ourPrice, competitorPrices = [] } = params;

  if (!ourPrice || competitorPrices.length === 0) {
    return { success: false, error: 'Invalid parameters' };
  }

  const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
  const minCompetitorPrice = Math.min(...competitorPrices);
  const maxCompetitorPrice = Math.max(...competitorPrices);

  const priceDiffFromAvg = ourPrice - avgCompetitorPrice;
  const percentDiffFromAvg = (priceDiffFromAvg / avgCompetitorPrice) * 100;

  const isCompetitive = priceDiffFromAvg <= 0 && priceDiffFromAvg >= -5000; // Within 5%

  return {
    success: true,
    ourPrice,
    avgCompetitorPrice: Math.round(avgCompetitorPrice),
    minCompetitorPrice,
    maxCompetitorPrice,
    priceDiffFromAvg: Math.round(priceDiffFromAvg),
    percentDiffFromAvg: percentDiffFromAvg.toFixed(1),
    isCompetitive,
    recommendation: isCompetitive
      ? '✅ Competitive pricing'
      : percentDiffFromAvg > 0
      ? `⚠️ ${Math.abs(percentDiffFromAvg).toFixed(1)}% above market - Consider reducing price`
      : `✅ ${Math.abs(percentDiffFromAvg).toFixed(1)}% below market - Strong value proposition`,
  };
}

/**
 * Calculate recommended price based on demand forecasting
 * 
 * @param {Object} params - Forecast parameters
 * @param {number} params.basePrice - Base price
 * @param {number} params.historicalOccupancy - Historical occupancy rate (0-1)
 * @param {number} params.upcomingOccupancy - Forecasted occupancy (0-1)
 * @param {number} params.daysUntilBooking - Days until booking date
 * @returns {Object} - Recommendation
 */
export function getRecommendedPrice(params) {
  const {
    basePrice,
    historicalOccupancy = 0.6,
    upcomingOccupancy = 0.7,
    daysUntilBooking = 14,
  } = params;

  if (!basePrice || basePrice <= 0) {
    return { success: false, error: 'Invalid base price' };
  }

  let recommendedPrice = basePrice;
  const rationale = [];

  // Adjust based on occupancy trend
  const occupancyTrend = upcomingOccupancy - historicalOccupancy;
  if (occupancyTrend > 0.2) {
    recommendedPrice *= 1.25;
    rationale.push(`High occupancy trend (+${(occupancyTrend * 100).toFixed(0)}%): Increase by 25%`);
  } else if (occupancyTrend > 0.1) {
    recommendedPrice *= 1.1;
    rationale.push(`Moderate occupancy trend (+${(occupancyTrend * 100).toFixed(0)}%): Increase by 10%`);
  } else if (occupancyTrend < -0.2) {
    recommendedPrice *= 0.9;
    rationale.push(`Low occupancy trend (${(occupancyTrend * 100).toFixed(0)}%): Decrease by 10%`);
  }

  // Adjust based on booking window
  if (daysUntilBooking < 7) {
    recommendedPrice *= 1.2;
    rationale.push('Last-minute booking: Add 20% premium');
  } else if (daysUntilBooking > 60) {
    recommendedPrice *= 0.85;
    rationale.push('Far in advance: Reduce by 15% (early bird)');
  }

  return {
    success: true,
    basePrice,
    recommendedPrice: Math.round(recommendedPrice / 50) * 50,
    priceChange: Math.round(recommendedPrice - basePrice),
    percentChange: (((recommendedPrice - basePrice) / basePrice) * 100).toFixed(1),
    rationale,
    confidence: Math.min(95, 60 + occupancyTrend * 100),
  };
}

/**
 * Calculate price freeze feature cost
 * Price freeze: Lock current price for 7 days
 * 
 * @param {number} currentPrice - Current booking price
 * @param {number} userTier - Loyalty tier
 * @returns {number} - Price freeze cost
 */
export function getPriceFreezeCost(currentPrice, userTier = 'bronze') {
  const baseCost = 10; // R10 base cost
  
  // Loyalty tiers get discount
  const tierMultipliers = {
    bronze: 1.0,
    silver: 0.9,    // 10% discount
    gold: 0.75,     // 25% discount
    platinum: 0.5,  // 50% discount (free for platinum)
  };

  const multiplier = tierMultipliers[userTier?.toLowerCase()] || 1.0;
  const cost = baseCost * multiplier;

  return {
    baseCost,
    tierDiscount: (1 - multiplier) * 100,
    finalCost: Math.round(cost),
    message: multiplier === 0.5 ? 'FREE for Platinum members!' : `R${Math.round(cost)} to freeze price`,
  };
}

/**
 * Calculate flash deal pricing
 * Limited-time discounts for inventory clearing
 * 
 * @param {Object} params - Flash deal parameters
 * @param {number} params.basePrice - Base price
 * @param {number} params.inventoryToMove - Units to clear
 * @param {number} params.totalInventory - Total inventory
 * @param {number} params.maxDiscountPercent - Max discount allowed
 * @returns {Object} - Flash deal recommendation
 */
export function calculateFlashDeal(params) {
  const {
    basePrice,
    inventoryToMove,
    totalInventory,
    maxDiscountPercent = 30,
  } = params;

  if (!basePrice || !inventoryToMove || !totalInventory) {
    return { success: false, error: 'Invalid parameters' };
  }

  // Calculate required discount to move inventory
  const percentToMove = (inventoryToMove / totalInventory) * 100;
  
  let recommendedDiscount = 10; // Start with 10%
  
  if (percentToMove > 50) {
    recommendedDiscount = 25; // 25% discount for heavy inventory
  } else if (percentToMove > 30) {
    recommendedDiscount = 20;
  } else if (percentToMove > 20) {
    recommendedDiscount = 15;
  }

  // Cap at max discount
  recommendedDiscount = Math.min(recommendedDiscount, maxDiscountPercent);

  const flashPrice = basePrice * (1 - recommendedDiscount / 100);
  const margin = basePrice - flashPrice;

  return {
    success: true,
    basePrice,
    flashPrice: Math.round(flashPrice),
    discountPercent: recommendedDiscount,
    savingsPerUnit: Math.round(margin),
    urgencyMessage: `⏰ Flash Sale! ${recommendedDiscount}% off - Only ${inventoryToMove} left!`,
    expectedConversion: Math.min(90, 50 + recommendedDiscount * 2), // Higher discount = higher conversion
  };
}

/**
 * Analyze pricing performance
 */
export function analyzePricingPerformance(params) {
  const {
    bookingsAtBasePrice,
    bookingsAtOptimizedPrice,
    basePrice,
    optimizedPrice,
    period = 30, // days
  } = params;

  const baseRevenue = bookingsAtBasePrice * basePrice;
  const optimizedRevenue = bookingsAtOptimizedPrice * optimizedPrice;
  const revenueIncrease = optimizedRevenue - baseRevenue;
  const percentIncrease = (revenueIncrease / baseRevenue) * 100;

  const avgBookingsPerDay = (bookingsAtOptimizedPrice + bookingsAtBasePrice) / 2 / period;
  const projectedMonthlyRevenue = optimizedRevenue * (30 / period);

  return {
    baseRevenue: Math.round(baseRevenue),
    optimizedRevenue: Math.round(optimizedRevenue),
    revenueIncrease: Math.round(revenueIncrease),
    percentIncrease: percentIncrease.toFixed(1),
    avgBookingsPerDay: avgBookingsPerDay.toFixed(1),
    projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
    roi: ((revenueIncrease / basePrice) * 100).toFixed(1),
    recommendation:
      revenueIncrease > 0
        ? `✅ Dynamic pricing working! +R${Math.round(revenueIncrease)} revenue over ${period} days`
        : `❌ Consider adjusting pricing strategy`,
  };
}
