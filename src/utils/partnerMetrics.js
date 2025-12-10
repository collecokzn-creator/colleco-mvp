/**
 * Partner Success Metrics Engine
 * Tracks KPIs, performance scoring, and partner tier management
 */

const PARTNER_TIERS = {
  bronze: { name: 'Bronze', minRevenue: 0, commission: 0.15, badge: '🥉' },
  silver: { name: 'Silver', minRevenue: 50000, commission: 0.12, badge: '🥈' },
  gold: { name: 'Gold', minRevenue: 150000, commission: 0.10, badge: '🥇' },
  platinum: { name: 'Platinum', minRevenue: 500000, commission: 0.08, badge: '💎' },
};

const SUCCESS_METRICS = {
  responseTime: { name: 'Response Time', unit: 'hours', target: 2, weight: 15 },
  occupancyRate: { name: 'Occupancy Rate', unit: '%', target: 70, weight: 25 },
  guestRating: { name: 'Guest Rating', unit: '/5', target: 4.5, weight: 20 },
  cancellationRate: { name: 'Cancellation Rate', unit: '%', target: 5, weight: 15 },
  completionRate: { name: 'Booking Completion', unit: '%', target: 95, weight: 15 },
  pricingOptimization: { name: 'Pricing Optimization', unit: '%', target: 10, weight: 10 },
};

const HEALTH_CHECKS = {
  responseTime: (actual, target) => actual <= target ? 100 : Math.max(0, 100 - ((actual - target) * 5)),
  occupancyRate: (actual, target) => (actual / target) * 100,
  guestRating: (actual, target) => (actual / target) * 100,
  cancellationRate: (actual, target) => actual <= target ? 100 : Math.max(0, 100 - ((actual - target) * 5)),
  completionRate: (actual, target) => (actual / target) * 100,
  pricingOptimization: (actual, target) => Math.min(100, (actual / target) * 100),
};

/**
 * Get or create partner metrics data
 */
export function getPartnerMetrics(partnerId) {
  const key = `partnerMetrics:v1:${partnerId}`;
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load partner metrics:', e);
  }
  return getDefaultMetrics(partnerId);
}

/**
 * Get default metrics structure
 */
export function getDefaultMetrics(partnerId) {
  const now = new Date();
  return {
    partnerId,
    createdAt: now.toISOString(),
    lastUpdated: now.toISOString(),
    
    // Revenue tracking
    revenue: {
      thisMonth: 0,
      lastMonth: 0,
      thisYear: 0,
      total: 0,
      trend: 0, // percentage change
      history: [], // Monthly revenue history
    },
    
    // Booking metrics
    bookings: {
      total: 0,
      thisMonth: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      completionRate: 95,
    },
    
    // Performance metrics
    performance: {
      responseTime: 2, // hours
      occupancyRate: 70, // percentage
      guestRating: 4.5, // out of 5
      cancellationRate: 5, // percentage
      pricingOptimization: 10, // percentage improvement
    },
    
    // Tier management
    tier: 'bronze',
    tierScore: 0,
    nextTierProgress: 0,
    
    // Health indicators
    health: {
      status: 'healthy', // healthy, warning, critical
      score: 85, // 0-100
      metrics: {},
      lastCheck: now.toISOString(),
    },
    
    // Inventory management
    inventory: {
      totalListings: 0,
      activeListings: 0,
      vacantDays: 0,
      oversoldDays: 0,
    },
    
    // Guest satisfaction
    satisfaction: {
      averageRating: 4.5,
      reviewCount: 0,
      recommendationRate: 85,
      complaintCount: 0,
    },
    
    // Financial summary
    earnings: {
      commissionEarnings: 0,
      bonusEarnings: 0,
      totalEarnings: 0,
      payoutSchedule: 'monthly',
      lastPayout: null,
      nextPayout: null,
    },
  };
}

/**
 * Save partner metrics
 */
export function savePartnerMetrics(metrics, partnerId) {
  const key = `partnerMetrics:v1:${partnerId}`;
  try {
    metrics.lastUpdated = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(metrics));
    return true;
  } catch (e) {
    console.error('Failed to save partner metrics:', e);
    return false;
  }
}

/**
 * Calculate health score based on all metrics
 */
export function calculateHealthScore(metrics) {
  const performanceMetrics = metrics.performance || {};
  let totalScore = 0;
  let totalWeight = 0;
  let healthMetrics = {};

  Object.entries(SUCCESS_METRICS).forEach(([key, config]) => {
    const actual = performanceMetrics[key] || 0;
    const target = config.target;
    const scoreFunc = HEALTH_CHECKS[key];
    
    if (scoreFunc) {
      const score = scoreFunc(actual, target);
      healthMetrics[key] = { actual, target, score };
      totalScore += score * config.weight;
      totalWeight += config.weight;
    }
  });

  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  
  let status = 'healthy';
  if (finalScore < 50) status = 'critical';
  else if (finalScore < 75) status = 'warning';

  return {
    score: finalScore,
    status,
    metrics: healthMetrics,
  };
}

/**
 * Determine partner tier based on revenue
 */
export function getPartnerTier(annualRevenue) {
  if (annualRevenue >= PARTNER_TIERS.platinum.minRevenue) return 'platinum';
  if (annualRevenue >= PARTNER_TIERS.gold.minRevenue) return 'gold';
  if (annualRevenue >= PARTNER_TIERS.silver.minRevenue) return 'silver';
  return 'bronze';
}

/**
 * Update partner tier if revenue qualifies
 */
export function updatePartnerTier(metrics) {
  const newTier = getPartnerTier(metrics.revenue.total);
  const oldTier = metrics.tier;
  
  if (newTier !== oldTier) {
    metrics.tier = newTier;
    metrics.tierUpgradeAt = new Date().toISOString();
  }
  
  // Calculate progress to next tier
  const tierLevels = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierLevels.indexOf(newTier);
  
  if (currentIndex < tierLevels.length - 1) {
    const nextTier = tierLevels[currentIndex + 1];
    const nextThreshold = PARTNER_TIERS[nextTier].minRevenue;
    const currentThreshold = PARTNER_TIERS[newTier].minRevenue;
    const progress = ((metrics.revenue.total - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    metrics.nextTierProgress = Math.min(100, Math.max(0, progress));
  } else {
    metrics.nextTierProgress = 100;
  }

  return metrics;
}

/**
 * Record a booking for partner
 */
export function recordPartnerBooking(partnerId, booking) {
  const metrics = getPartnerMetrics(partnerId);
  
  metrics.bookings.total++;
  metrics.bookings.thisMonth++;
  metrics.bookings.completed++;
  
  metrics.revenue.thisMonth += booking.amount;
  metrics.revenue.total += booking.amount;
  
  // Add to revenue history
  const now = new Date();
  const monthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const historyItem = metrics.revenue.history.find(h => h.month === monthKey);
  if (historyItem) {
    historyItem.amount += booking.amount;
  } else {
    metrics.revenue.history.push({ month: monthKey, amount: booking.amount });
  }
  
  // Keep only last 12 months
  metrics.revenue.history = metrics.revenue.history.slice(-12);
  
  // Calculate commission
  const tier = PARTNER_TIERS[metrics.tier];
  const commission = booking.amount * tier.commission;
  metrics.earnings.commissionEarnings += commission;
  metrics.earnings.totalEarnings += commission;
  
  // Update tier if needed
  updatePartnerTier(metrics);
  
  // Recalculate health
  const health = calculateHealthScore(metrics);
  metrics.health = health;
  
  savePartnerMetrics(metrics, partnerId);
  return metrics;
}

/**
 * Update performance metric
 */
export function updatePerformanceMetric(partnerId, metricKey, value) {
  const metrics = getPartnerMetrics(partnerId);
  
  if (metricKey in metrics.performance) {
    metrics.performance[metricKey] = value;
    
    // Recalculate health score
    const health = calculateHealthScore(metrics);
    metrics.health = health;
    
    savePartnerMetrics(metrics, partnerId);
  }
  
  return metrics;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(metrics) {
  const health = metrics.health || calculateHealthScore(metrics);
  const tier = PARTNER_TIERS[metrics.tier];
  
  return {
    tier: tier.name,
    tierBadge: tier.badge,
    commission: `${(tier.commission * 100).toFixed(1)}%`,
    healthScore: health.score,
    healthStatus: health.status,
    totalRevenue: metrics.revenue.total,
    monthlyRevenue: metrics.revenue.thisMonth,
    totalBookings: metrics.bookings.total,
    completionRate: metrics.bookings.completionRate,
    guestRating: metrics.satisfaction.averageRating,
    occupancy: metrics.performance.occupancyRate,
    nextTierAt: tier.name === 'Platinum' ? null : PARTNER_TIERS[Object.keys(PARTNER_TIERS)[Object.values(PARTNER_TIERS).indexOf(tier) + 1]]?.minRevenue,
    nextTierProgress: metrics.nextTierProgress,
  };
}

/**
 * Get actionable insights
 */
export function getPartnerInsights(metrics) {
  const insights = [];
  const performance = metrics.performance;
  
  // Response time insights
  if (performance.responseTime > SUCCESS_METRICS.responseTime.target) {
    insights.push({
      type: 'warning',
      category: 'Response Time',
      message: `Average response time is ${performance.responseTime}h. Target is ${SUCCESS_METRICS.responseTime.target}h.`,
      action: 'Improve response time to maintain guest satisfaction and booking rates.',
      priority: 'high',
    });
  }
  
  // Occupancy insights
  if (performance.occupancyRate < SUCCESS_METRICS.occupancyRate.target) {
    const _gap = SUCCESS_METRICS.occupancyRate.target - performance.occupancyRate;
    insights.push({
      type: 'opportunity',
      category: 'Occupancy',
      message: `Occupancy is ${performance.occupancyRate}%. There's ${_gap}% room for improvement.`,
      action: 'Consider dynamic pricing or targeted promotions to fill vacant days.',
      priority: 'high',
    });
  }
  
  // Rating insights
  if (performance.guestRating < SUCCESS_METRICS.guestRating.target) {
    const _gap = SUCCESS_METRICS.guestRating.target - performance.guestRating;
    insights.push({
      type: 'warning',
      category: 'Guest Rating',
      message: `Guest rating is ${performance.guestRating}/5. Target is ${SUCCESS_METRICS.guestRating.target}/5.`,
      action: 'Review guest feedback and address common complaints.',
      priority: 'high',
    });
  }
  
  // Cancellation insights
  if (performance.cancellationRate > SUCCESS_METRICS.cancellationRate.target) {
    const _excess = performance.cancellationRate - SUCCESS_METRICS.cancellationRate.target;
    insights.push({
      type: 'warning',
      category: 'Cancellation Rate',
      message: `Cancellation rate is ${performance.cancellationRate}%. Target is ${SUCCESS_METRICS.cancellationRate.target}%.`,
      action: 'Review cancellation policies or improve property quality.',
      priority: 'medium',
    });
  }
  
  // Pricing optimization insights
  if (performance.pricingOptimization < 5) {
    insights.push({
      type: 'opportunity',
      category: 'Pricing',
      message: 'Your pricing hasn\'t been optimized yet.',
      action: 'Use our pricing recommendations to increase revenue per booking.',
      priority: 'medium',
    });
  }
  
  // Tier progression insights
  if (metrics.nextTierProgress < 100 && metrics.nextTierProgress > 50) {
    insights.push({
      type: 'success',
      category: 'Tier Progress',
      message: `You're ${Math.round(metrics.nextTierProgress)}% toward the next tier!`,
      action: 'Keep up the performance to unlock better commission rates.',
      priority: 'low',
    });
  }
  
  return insights;
}

/**
 * Calculate commission earnings
 */
export function calculateCommissionEarnings(totalRevenue, tier = 'bronze') {
  const commissionRate = PARTNER_TIERS[tier]?.commission || PARTNER_TIERS.bronze.commission;
  return totalRevenue * commissionRate;
}

/**
 * Get tier info
 */
export function getTierInfo(tier) {
  return PARTNER_TIERS[tier] || PARTNER_TIERS.bronze;
}

/**
 * Get all metrics info
 */
export function getMetricsInfo(metricKey) {
  return SUCCESS_METRICS[metricKey];
}

/**
 * Get tier progression data
 */
export function getTierProgression() {
  return Object.entries(PARTNER_TIERS).map(([key, tier]) => ({
    tier: key,
    name: tier.name,
    badge: tier.badge,
    minRevenue: tier.minRevenue,
    commission: `${(tier.commission * 100).toFixed(1)}%`,
  }));
}
