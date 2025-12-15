import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { F as Footer } from "./Footer-ByqUfdvj.js";
import { Z as Zap, a as DollarSign, U as Users, x as Star, ay as Target, C as Calendar, k as BarChart3, a4 as CheckCircle, az as Lightbulb, A as AlertCircle, G as Award, T as TrendingUp, aA as TrendingDown } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
const PARTNER_TIERS = {
  bronze: { name: "Bronze", minRevenue: 0, commission: 0.15, badge: "🥉" },
  silver: { name: "Silver", minRevenue: 5e4, commission: 0.12, badge: "🥈" },
  gold: { name: "Gold", minRevenue: 15e4, commission: 0.1, badge: "🥇" },
  platinum: { name: "Platinum", minRevenue: 5e5, commission: 0.08, badge: "💎" }
};
const SUCCESS_METRICS = {
  responseTime: { name: "Response Time", unit: "hours", target: 2, weight: 15 },
  occupancyRate: { name: "Occupancy Rate", unit: "%", target: 70, weight: 25 },
  guestRating: { name: "Guest Rating", unit: "/5", target: 4.5, weight: 20 },
  cancellationRate: { name: "Cancellation Rate", unit: "%", target: 5, weight: 15 },
  completionRate: { name: "Booking Completion", unit: "%", target: 95, weight: 15 },
  pricingOptimization: { name: "Pricing Optimization", unit: "%", target: 10, weight: 10 }
};
const HEALTH_CHECKS = {
  responseTime: (actual, target) => actual <= target ? 100 : Math.max(0, 100 - (actual - target) * 5),
  occupancyRate: (actual, target) => actual / target * 100,
  guestRating: (actual, target) => actual / target * 100,
  cancellationRate: (actual, target) => actual <= target ? 100 : Math.max(0, 100 - (actual - target) * 5),
  completionRate: (actual, target) => actual / target * 100,
  pricingOptimization: (actual, target) => Math.min(100, actual / target * 100)
};
function getPartnerMetrics(partnerId) {
  const key = `partnerMetrics:v1:${partnerId}`;
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load partner metrics:", e);
  }
  return getDefaultMetrics(partnerId);
}
function getDefaultMetrics(partnerId) {
  const now = /* @__PURE__ */ new Date();
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
      trend: 0,
      // percentage change
      history: []
      // Monthly revenue history
    },
    // Booking metrics
    bookings: {
      total: 0,
      thisMonth: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      completionRate: 95
    },
    // Performance metrics
    performance: {
      responseTime: 2,
      // hours
      occupancyRate: 70,
      // percentage
      guestRating: 4.5,
      // out of 5
      cancellationRate: 5,
      // percentage
      pricingOptimization: 10
      // percentage improvement
    },
    // Tier management
    tier: "bronze",
    tierScore: 0,
    nextTierProgress: 0,
    // Health indicators
    health: {
      status: "healthy",
      // healthy, warning, critical
      score: 85,
      // 0-100
      metrics: {},
      lastCheck: now.toISOString()
    },
    // Inventory management
    inventory: {
      totalListings: 0,
      activeListings: 0,
      vacantDays: 0,
      oversoldDays: 0
    },
    // Guest satisfaction
    satisfaction: {
      averageRating: 4.5,
      reviewCount: 0,
      recommendationRate: 85,
      complaintCount: 0
    },
    // Financial summary
    earnings: {
      commissionEarnings: 0,
      bonusEarnings: 0,
      totalEarnings: 0,
      payoutSchedule: "monthly",
      lastPayout: null,
      nextPayout: null
    }
  };
}
function calculateHealthScore(metrics) {
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
  let status = "healthy";
  if (finalScore < 50) status = "critical";
  else if (finalScore < 75) status = "warning";
  return {
    score: finalScore,
    status,
    metrics: healthMetrics
  };
}
function getPartnerTier(annualRevenue) {
  if (annualRevenue >= PARTNER_TIERS.platinum.minRevenue) return "platinum";
  if (annualRevenue >= PARTNER_TIERS.gold.minRevenue) return "gold";
  if (annualRevenue >= PARTNER_TIERS.silver.minRevenue) return "silver";
  return "bronze";
}
function updatePartnerTier(metrics) {
  const newTier = getPartnerTier(metrics.revenue.total);
  const oldTier = metrics.tier;
  if (newTier !== oldTier) {
    metrics.tier = newTier;
    metrics.tierUpgradeAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  const tierLevels = ["bronze", "silver", "gold", "platinum"];
  const currentIndex = tierLevels.indexOf(newTier);
  if (currentIndex < tierLevels.length - 1) {
    const nextTier = tierLevels[currentIndex + 1];
    const nextThreshold = PARTNER_TIERS[nextTier].minRevenue;
    const currentThreshold = PARTNER_TIERS[newTier].minRevenue;
    const progress = (metrics.revenue.total - currentThreshold) / (nextThreshold - currentThreshold) * 100;
    metrics.nextTierProgress = Math.min(100, Math.max(0, progress));
  } else {
    metrics.nextTierProgress = 100;
  }
  return metrics;
}
function getPerformanceSummary(metrics) {
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
    nextTierAt: tier.name === "Platinum" ? null : PARTNER_TIERS[Object.keys(PARTNER_TIERS)[Object.values(PARTNER_TIERS).indexOf(tier) + 1]]?.minRevenue,
    nextTierProgress: metrics.nextTierProgress
  };
}
function getPartnerInsights(metrics) {
  const insights = [];
  const performance = metrics.performance;
  if (performance.responseTime > SUCCESS_METRICS.responseTime.target) {
    insights.push({
      type: "warning",
      category: "Response Time",
      message: `Average response time is ${performance.responseTime}h. Target is ${SUCCESS_METRICS.responseTime.target}h.`,
      action: "Improve response time to maintain guest satisfaction and booking rates.",
      priority: "high"
    });
  }
  if (performance.occupancyRate < SUCCESS_METRICS.occupancyRate.target) {
    const _gap = SUCCESS_METRICS.occupancyRate.target - performance.occupancyRate;
    insights.push({
      type: "opportunity",
      category: "Occupancy",
      message: `Occupancy is ${performance.occupancyRate}%. There's ${_gap}% room for improvement.`,
      action: "Consider dynamic pricing or targeted promotions to fill vacant days.",
      priority: "high"
    });
  }
  if (performance.guestRating < SUCCESS_METRICS.guestRating.target) {
    SUCCESS_METRICS.guestRating.target - performance.guestRating;
    insights.push({
      type: "warning",
      category: "Guest Rating",
      message: `Guest rating is ${performance.guestRating}/5. Target is ${SUCCESS_METRICS.guestRating.target}/5.`,
      action: "Review guest feedback and address common complaints.",
      priority: "high"
    });
  }
  if (performance.cancellationRate > SUCCESS_METRICS.cancellationRate.target) {
    performance.cancellationRate - SUCCESS_METRICS.cancellationRate.target;
    insights.push({
      type: "warning",
      category: "Cancellation Rate",
      message: `Cancellation rate is ${performance.cancellationRate}%. Target is ${SUCCESS_METRICS.cancellationRate.target}%.`,
      action: "Review cancellation policies or improve property quality.",
      priority: "medium"
    });
  }
  if (performance.pricingOptimization < 5) {
    insights.push({
      type: "opportunity",
      category: "Pricing",
      message: "Your pricing hasn't been optimized yet.",
      action: "Use our pricing recommendations to increase revenue per booking.",
      priority: "medium"
    });
  }
  if (metrics.nextTierProgress < 100 && metrics.nextTierProgress > 50) {
    insights.push({
      type: "success",
      category: "Tier Progress",
      message: `You're ${Math.round(metrics.nextTierProgress)}% toward the next tier!`,
      action: "Keep up the performance to unlock better commission rates.",
      priority: "low"
    });
  }
  return insights;
}
const MARKET_DATA = {
  // Market segments and their average metrics
  segments: {
    luxury: { avgPrice: 3500, avgRating: 4.6, avgOccupancy: 75, competitors: 120 },
    midRange: { avgPrice: 1500, avgRating: 4.3, avgOccupancy: 70, competitors: 450 },
    budget: { avgPrice: 600, avgRating: 4.1, avgOccupancy: 65, competitors: 890 }
  },
  // Regional variations
  regions: {
    durban: { demandMultiplier: 1.2, seasonalPeak: { months: [12, 1, 7], multiplier: 1.5 } },
    capeTown: { demandMultiplier: 1.4, seasonalPeak: { months: [11, 12, 1, 2], multiplier: 1.6 } },
    kruger: { demandMultiplier: 1.3, seasonalPeak: { months: [6, 7, 8], multiplier: 1.4 } },
    johburg: { demandMultiplier: 1.1, seasonalPeak: { months: [12, 1], multiplier: 1.3 } }
  }
};
function analyzeCompetitors(partnerId, propertyType, location, pricePoint) {
  const key = `competitorAnalysis:v1:${partnerId}`;
  let analysis = null;
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const data = JSON.parse(cached);
      if (/* @__PURE__ */ new Date() - new Date(data.analyzedAt) < 7 * 24 * 60 * 60 * 1e3) {
        return data;
      }
    }
  } catch (e) {
  }
  const segment = getSegment();
  const regional = MARKET_DATA.regions[location.toLowerCase()] || MARKET_DATA.regions.johburg;
  const segmentData = MARKET_DATA.segments[segment];
  analysis = {
    partnerId,
    propertyType,
    location,
    pricePoint,
    analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
    // Market positioning
    market: {
      segment,
      segmentAvgPrice: segmentData.avgPrice,
      segmentAvgRating: segmentData.avgRating,
      segmentAvgOccupancy: segmentData.avgOccupancy,
      competitorCount: segmentData.competitors,
      marketDemand: "high",
      // high, medium, low
      demandMultiplier: regional.demandMultiplier
    },
    // Competitive analysis
    competition: {
      directCompetitors: Math.floor(segmentData.competitors * 0.1),
      // 10% are direct
      pricePosition: getPricePosition(pricePoint, segmentData.avgPrice),
      ratingPosition: "average",
      // above, average, below
      occupancyBenchmark: segmentData.avgOccupancy,
      marketShare: 0.5
      // percentage of segment market share
    },
    // Pricing recommendations
    pricing: {
      currentPrice: pricePoint,
      recommendedPrice: calculateRecommendedPrice(pricePoint, segment, regional),
      minPrice: Math.round(segmentData.avgPrice * 0.7),
      maxPrice: Math.round(segmentData.avgPrice * 1.5),
      priceOpportunity: calculatePriceOpportunity(pricePoint, segment, regional),
      seasonalRecommendations: generateSeasonalRecommendations(pricePoint, regional)
    },
    // Performance opportunities
    opportunities: {
      occupancyGap: segmentData.avgOccupancy - 60,
      // Assumed current occupancy
      ratingGap: segmentData.avgRating - 4,
      // Assumed current rating
      potentialRevenue: 0,
      // Calculated below
      competitiveAdvantages: []
    }
  };
  const currentRevenue = pricePoint * 365 * 0.6;
  const potentialRevenue = analysis.pricing.recommendedPrice * 365 * (segmentData.avgOccupancy / 100);
  analysis.opportunities.potentialRevenue = Math.round(potentialRevenue - currentRevenue);
  if (pricePoint < segmentData.avgPrice * 0.9) {
    analysis.opportunities.competitiveAdvantages.push("Price advantage");
  }
  try {
    localStorage.setItem(key, JSON.stringify(analysis));
  } catch (e) {
    console.error("Failed to cache competitor analysis:", e);
  }
  return analysis;
}
function getSegment(price) {
  return "luxury";
}
function getPricePosition(currentPrice, avgPrice) {
  const ratio = currentPrice / avgPrice;
  if (ratio > 1.2) return "premium";
  if (ratio > 0.95) return "competitive";
  if (ratio > 0.75) return "value";
  return "budget";
}
function calculateRecommendedPrice(currentPrice, segment, regional) {
  const segmentData = MARKET_DATA.segments[segment];
  let recommended = segmentData.avgPrice;
  recommended *= regional.demandMultiplier;
  const blended = recommended * 0.7 + currentPrice * 0.3;
  return Math.round(blended);
}
function calculatePriceOpportunity(currentPrice, segment, regional) {
  const recommended = calculateRecommendedPrice(currentPrice, segment, regional);
  const opportunity = recommended - currentPrice;
  const percentageChange = opportunity / currentPrice * 100;
  return {
    priceChange: Math.round(opportunity),
    percentageChange: Math.round(percentageChange * 10) / 10,
    annualImpact: Math.round(opportunity * 365 * 0.65),
    // Assumed 65% occupancy
    recommendation: opportunity > 0 ? "Increase price" : opportunity < 0 ? "Decrease price" : "Price is optimal"
  };
}
function generateSeasonalRecommendations(basePrice, regional) {
  const { months: peakMonths, multiplier: peakMultiplier } = regional.seasonalPeak;
  const recommendations = {};
  for (let month = 1; month <= 12; month++) {
    if (peakMonths.includes(month)) {
      recommendations[`month_${month}`] = {
        month,
        season: "peak",
        recommendedPrice: Math.round(basePrice * peakMultiplier),
        multiplier: peakMultiplier
      };
    } else if (peakMonths.includes(month + 1) || peakMonths.includes(month - 1)) {
      recommendations[`month_${month}`] = {
        month,
        season: "shoulder",
        recommendedPrice: Math.round(basePrice * 1.1),
        multiplier: 1.1
      };
    } else {
      recommendations[`month_${month}`] = {
        month,
        season: "offpeak",
        recommendedPrice: Math.round(basePrice * 0.85),
        multiplier: 0.85
      };
    }
  }
  return recommendations;
}
function compareWithCompetitors(analysis) {
  const avgPrice = MARKET_DATA.segments[analysis.market.segment].avgPrice;
  const avgRating = MARKET_DATA.segments[analysis.market.segment].avgRating;
  const avgOccupancy = MARKET_DATA.segments[analysis.market.segment].avgOccupancy;
  return {
    priceComparison: {
      yourPrice: analysis.pricing.currentPrice,
      avgPrice,
      difference: analysis.pricing.currentPrice - avgPrice,
      percentageDifference: ((analysis.pricing.currentPrice - avgPrice) / avgPrice * 100).toFixed(1),
      position: getPricePosition(analysis.pricing.currentPrice, avgPrice)
    },
    ratingComparison: {
      benchmark: avgRating,
      opportunity: `Target ${avgRating} rating to match competitors`
    },
    occupancyComparison: {
      benchmark: avgOccupancy,
      opportunity: `Target ${avgOccupancy}% occupancy for market competitiveness`
    }
  };
}
function getPricingStrategy(analysis, _partnerMetrics) {
  const strategies = [];
  const opportunity = analysis.pricing.priceOpportunity;
  if (opportunity.percentageChange < -10) {
    strategies.push({
      name: "Value Positioning",
      description: "You can reduce prices to capture more market share",
      pricePoint: Math.round(analysis.pricing.currentPrice * 0.95),
      expectedOccupancy: "75%",
      expectedRevenue: Math.round(Math.round(analysis.pricing.currentPrice * 0.95) * 365 * 0.75),
      pros: ["Higher occupancy", "Competitive advantage", "More bookings"],
      cons: ["Lower per-night revenue", "Potential race to bottom"]
    });
  }
  if (opportunity.percentageChange > 10) {
    strategies.push({
      name: "Premium Positioning",
      description: "Increase prices to improve revenue per night",
      pricePoint: Math.round(analysis.pricing.currentPrice * 1.05),
      expectedOccupancy: "60%",
      expectedRevenue: Math.round(Math.round(analysis.pricing.currentPrice * 1.05) * 365 * 0.6),
      pros: ["Higher revenue per night", "Premium image", "Attract quality guests"],
      cons: ["Lower occupancy", "Longer vacancy periods"]
    });
  }
  strategies.push({
    name: "Dynamic Pricing",
    description: "Adjust prices seasonally to maximize revenue",
    pricePoint: "Variable by season",
    expectedOccupancy: "70%",
    expectedRevenue: Math.round(analysis.pricing.currentPrice * 365 * 0.7 * 1.15),
    // 15% uplift
    pros: ["Maximized revenue", "Responsive to demand", "Outcompete rivals"],
    cons: ["More management overhead", "Guest perception variability"]
  });
  return strategies;
}
function analyzeRevenueOpportunities(analysis, currentMetrics) {
  const opportunities = [];
  if (analysis.pricing.priceOpportunity.annualImpact > 0) {
    opportunities.push({
      type: "pricing",
      name: "Price Optimization",
      impact: analysis.pricing.priceOpportunity.annualImpact,
      timeToImplement: "1 week",
      difficulty: "easy",
      description: `Increase average price by R${analysis.pricing.priceOpportunity.priceChange} per night`
    });
  }
  const occupancyGap = (analysis.market.segmentAvgOccupancy - 60) * 365;
  if (occupancyGap > 0) {
    opportunities.push({
      type: "occupancy",
      name: "Occupancy Improvement",
      impact: Math.round(occupancyGap * analysis.pricing.currentPrice * 0.1),
      // Conservative estimate
      timeToImplement: "2-4 weeks",
      difficulty: "medium",
      description: `Improve occupancy from 60% to ${analysis.market.segmentAvgOccupancy}%`
    });
  }
  if (currentMetrics && currentMetrics.satisfaction.averageRating < analysis.market.segmentAvgRating) {
    opportunities.push({
      type: "rating",
      name: "Rating Improvement",
      impact: Math.round(5e3),
      // Estimated impact of better ratings
      timeToImplement: "4-8 weeks",
      difficulty: "medium",
      description: `Improve rating from ${currentMetrics.satisfaction.averageRating} to ${analysis.market.segmentAvgRating}`
    });
  }
  opportunities.sort((a, b) => b.impact - a.impact);
  return opportunities;
}
function calculateRevenueAnalytics(metrics) {
  const history = metrics.revenue.history || [];
  if (history.length === 0) {
    return {
      totalRevenue: 0,
      averageMonthly: 0,
      trend: 0,
      growth: 0,
      forecast: [],
      insights: []
    };
  }
  const totalRevenue = history.reduce((sum, item) => sum + item.amount, 0);
  const averageMonthly = Math.round(totalRevenue / history.length);
  const trend = calculateTrend(history.map((h) => h.amount));
  let growth = 0;
  if (history.length >= 2) {
    const lastMonth = history[history.length - 1].amount;
    const previousMonth = history[history.length - 2].amount;
    growth = (lastMonth - previousMonth) / previousMonth * 100;
  }
  const forecast = generateRevenueForecast(history.map((h) => h.amount), 3);
  const insights = generateRevenueInsights(history, trend, growth);
  return {
    totalRevenue,
    averageMonthly,
    trend,
    growth,
    forecast,
    insights,
    history: history.slice(-12)
    // Last 12 months
  };
}
function calculateOccupancyAnalytics(metrics) {
  const occupancyRate = metrics.performance?.occupancyRate || 0;
  const totalListings = metrics.inventory?.totalListings || 1;
  const activeListings = metrics.inventory?.activeListings || 0;
  const occupiedDays = Math.round(occupancyRate / 100 * 365);
  const vacantDays = 365 - occupiedDays;
  const opportunityCost = calculateOccupancyOpportunityCost(vacantDays, metrics.performance.responseTime);
  return {
    currentOccupancy: occupancyRate,
    occupiedDays,
    vacantDays,
    activeListings,
    listingUtilization: activeListings / totalListings * 100,
    opportunityCost,
    recommendations: generateOccupancyRecommendations(occupancyRate, vacantDays)
  };
}
function calculateGuestSatisfactionAnalytics(metrics) {
  const satisfaction = metrics.satisfaction || {};
  const rating = satisfaction.averageRating || 4;
  const reviewCount = satisfaction.reviewCount || 0;
  const recommendationRate = satisfaction.recommendationRate || 80;
  const complaintCount = satisfaction.complaintCount || 0;
  return {
    averageRating: rating,
    reviewCount,
    recommendationRate,
    complaintRate: complaintCount > 0 ? complaintCount / reviewCount * 100 : 0,
    nps: recommendationRate - (100 - recommendationRate),
    // Net Promoter Score
    satisfactionTrend: rating >= 4.3 ? "improving" : rating >= 4 ? "stable" : "declining",
    insights: generateSatisfactionInsights(rating, reviewCount, recommendationRate)
  };
}
function calculateBookingAnalytics(metrics) {
  const bookings = metrics.bookings || {};
  const total = bookings.total || 0;
  const completed = bookings.completed || 0;
  const cancelled = bookings.cancelled || 0;
  const completionRate = bookings.completionRate || 95;
  const avgBookingValue = total > 0 ? Math.round(metrics.revenue.total / total) : 0;
  const cancellationRate = total > 0 ? cancelled / total * 100 : 0;
  return {
    totalBookings: total,
    completedBookings: completed,
    cancelledBookings: cancelled,
    completionRate,
    cancellationRate,
    averageBookingValue: avgBookingValue,
    monthlyBookings: bookings.thisMonth || 0,
    bookingTrend: bookings.thisMonth > 0 ? "increasing" : "stable",
    insights: generateBookingInsights(total, completed, cancelled, cancellationRate)
  };
}
function calculatePerformanceScore(metrics) {
  const performance = metrics.performance || {};
  const scores = {
    responseTime: Math.max(0, 100 - ((performance.responseTime || 2) - 2) * 15),
    // Penalty for slow response
    occupancy: Math.min(100, (performance.occupancyRate || 0) * 1.43),
    // Target is 70%
    rating: Math.min(100, (performance.guestRating || 4) * 22.2),
    // Target is 4.5/5
    cancellation: Math.max(0, 100 - ((performance.cancellationRate || 0) - 5) * 8),
    // Target is 5%
    completion: performance.completionRate || 95,
    pricing: Math.min(100, (performance.pricingOptimization || 0) * 10)
    // Target is 10%
  };
  const weights = {
    responseTime: 0.15,
    occupancy: 0.25,
    rating: 0.2,
    cancellation: 0.15,
    completion: 0.15,
    pricing: 0.1
  };
  const weighted = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + score * (weights[key] || 0);
  }, 0);
  return Math.round(weighted);
}
function calculateTrend(data) {
  if (data.length < 2) return 0;
  const n = data.length;
  const sumX = n * (n + 1) / 2;
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = data.reduce((sum, y, i) => sum + (i + 1) * y, 0);
  const sumX2 = n * (n + 1) * (2 * n + 1) / 6;
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}
function generateRevenueForecast(history, months = 3) {
  const forecast = [];
  const trend = calculateTrend(history);
  const lastValue = history[history.length - 1];
  for (let i = 1; i <= months; i++) {
    const projected = lastValue + trend * i;
    forecast.push({
      month: i,
      projected: Math.round(Math.max(0, projected)),
      confidence: 80 - i * 5
      // Confidence decreases with distance
    });
  }
  return forecast;
}
function generateRevenueInsights(history, trend, growth) {
  const insights = [];
  if (trend > 0) {
    insights.push({
      type: "positive",
      title: "Revenue Growing",
      message: `Your revenue is trending upward with an average monthly increase of R${Math.round(trend)}.`
    });
  } else if (trend < 0) {
    insights.push({
      type: "warning",
      title: "Revenue Declining",
      message: `Your revenue is trending downward. Consider reviewing pricing or marketing strategy.`
    });
  }
  if (growth > 20) {
    insights.push({
      type: "positive",
      title: "Strong Month",
      message: `This month's revenue grew ${Math.round(growth)}% compared to last month - excellent work!`
    });
  } else if (growth < -20) {
    insights.push({
      type: "warning",
      title: "Declining Revenue",
      message: `This month's revenue declined ${Math.abs(Math.round(growth))}% compared to last month.`
    });
  }
  return insights;
}
function generateOccupancyRecommendations(occupancy, vacantDays) {
  const recommendations = [];
  if (occupancy < 60) {
    recommendations.push({
      priority: "high",
      action: "Reduce price or increase marketing",
      impact: `Filling ${vacantDays} vacant days could increase annual revenue significantly`
    });
  } else if (occupancy < 70) {
    recommendations.push({
      priority: "medium",
      action: "Optimize your property listing photos and description",
      impact: `Small improvements in listing quality could boost occupancy by 5-10%`
    });
  }
  if (vacantDays > 100) {
    recommendations.push({
      priority: "high",
      action: "Consider seasonal pricing adjustments",
      impact: `Off-season discounts could help fill ${vacantDays} vacant days`
    });
  }
  return recommendations;
}
function calculateOccupancyOpportunityCost(vacantDays, avgPrice = 1500) {
  return vacantDays * avgPrice;
}
function generateSatisfactionInsights(rating, reviewCount, recommendationRate) {
  const insights = [];
  if (rating >= 4.5) {
    insights.push({
      type: "positive",
      title: "Excellent Rating",
      message: `Your ${rating}/5 rating puts you in the top tier of properties. Keep it up!`
    });
  } else if (rating >= 4) {
    insights.push({
      type: "neutral",
      title: "Good Rating",
      message: `Your ${rating}/5 rating is solid. Focus on the feedback in your reviews to improve.`
    });
  } else {
    insights.push({
      type: "warning",
      title: "Low Rating",
      message: `Your ${rating}/5 rating is below market average. Review guest feedback and address issues.`
    });
  }
  if (recommendationRate > 80) {
    insights.push({
      type: "positive",
      title: "High Recommendation Rate",
      message: `${recommendationRate}% of guests would recommend your property - that's excellent for referrals!`
    });
  }
  if (reviewCount < 10) {
    insights.push({
      type: "opportunity",
      title: "Build Review Credibility",
      message: `With only ${reviewCount} reviews, focus on getting more to build trust with potential guests.`
    });
  }
  return insights;
}
function generateBookingInsights(total, completed, cancelled, cancellationRate) {
  const insights = [];
  if (cancellationRate > 10) {
    insights.push({
      type: "warning",
      title: "High Cancellation Rate",
      message: `Your ${Math.round(cancellationRate)}% cancellation rate is high. Review your policies and communication.`
    });
  }
  if (total > 50) {
    insights.push({
      type: "positive",
      title: "High Booking Volume",
      message: `${total} bookings shows strong market demand for your property type.`
    });
  }
  return insights;
}
function PartnerSuccessDashboard() {
  const [metrics, setMetrics] = reactExports.useState(null);
  const [analysis, setAnalysis] = reactExports.useState(null);
  const [analytics, setAnalytics] = reactExports.useState(null);
  const [selectedTab, setSelectedTab] = reactExports.useState("overview");
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = () => {
    const partnerId = localStorage.getItem("colleco.partner.id") || "partner_demo";
    let partnerMetrics = getPartnerMetrics(partnerId);
    if (partnerMetrics.bookings.total === 0) {
      partnerMetrics = {
        ...partnerMetrics,
        revenue: {
          ...partnerMetrics.revenue,
          thisMonth: 28500,
          lastMonth: 24200,
          thisYear: 32e4,
          total: 32e4,
          trend: 17.8,
          history: [
            { month: "2025-01", amount: 22e3 },
            { month: "2025-02", amount: 23500 },
            { month: "2025-03", amount: 25e3 },
            { month: "2025-04", amount: 24200 },
            { month: "2025-05", amount: 26e3 },
            { month: "2025-06", amount: 27500 },
            { month: "2025-07", amount: 28500 }
          ]
        },
        bookings: {
          total: 145,
          thisMonth: 24,
          completed: 140,
          cancelled: 5,
          pending: 2,
          completionRate: 96.6
        },
        performance: {
          responseTime: 1.5,
          occupancyRate: 76,
          guestRating: 4.6,
          cancellationRate: 3.4,
          pricingOptimization: 12
        },
        tier: "gold",
        satisfaction: {
          averageRating: 4.6,
          reviewCount: 52,
          recommendationRate: 92,
          complaintCount: 2
        },
        inventory: {
          totalListings: 3,
          activeListings: 3,
          vacantDays: 87,
          oversoldDays: 0
        }
      };
    }
    updatePartnerTier(partnerMetrics);
    setMetrics(partnerMetrics);
    const competitorAnalysis = analyzeCompetitors(
      partnerId,
      "hotel",
      "durban",
      2500
    );
    setAnalysis(competitorAnalysis);
    setAnalytics({
      revenue: calculateRevenueAnalytics(partnerMetrics),
      occupancy: calculateOccupancyAnalytics(partnerMetrics),
      satisfaction: calculateGuestSatisfactionAnalytics(partnerMetrics),
      bookings: calculateBookingAnalytics(partnerMetrics),
      performance: calculatePerformanceScore(partnerMetrics)
    });
    setLoading(false);
  };
  if (loading || !metrics || !analytics) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-8 h-8 text-brand-orange" }) }) });
  }
  const summary = getPerformanceSummary(metrics);
  const insights = getPartnerInsights(metrics);
  const opportunities = analyzeRevenueOpportunities(analysis, metrics);
  const comparison = compareWithCompetitors(analysis);
  const strategies = getPricingStrategy(analysis);
  const StatCard = ({ icon: Icon, label, value, trend, unit = "" }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-4 border border-cream-border hover:border-brand-orange/20 transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-brand-brown/60", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-brown mt-1", children: [
        value,
        unit
      ] }),
      trend !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-600"}`, children: [
        trend >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-3 h-3" }),
        Math.abs(trend),
        "% ",
        trend >= 0 ? "increase" : "decrease"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-orange/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-6 h-6" }) })
  ] }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-cream min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-brand-brown mb-2", children: "Partner Success Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown/60", children: "Maximize your revenue with data-driven insights and recommendations" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-brand-orange/10 to-orange-100 rounded-xl p-6 mb-8 border border-brand-orange/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-brown/60 mb-1", children: "Current Partner Tier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-brand-brown", children: [
          summary.tierBadge,
          " ",
          summary.tier
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-brand-brown/60 mt-2", children: [
          "Commission Rate: ",
          summary.commission
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-brown/60 mb-2", children: "Progress to Next Tier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 h-2 bg-white rounded-full border border-brand-orange/20 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full bg-gradient-to-r from-brand-orange to-orange-500 transition-all duration-500",
            style: { width: `${summary.nextTierProgress}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-brand-brown/60 mt-1", children: [
          Math.round(summary.nextTierProgress),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 border-b border-cream-border overflow-x-auto", children: ["overview", "revenue", "opportunities", "benchmarking", "insights"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setSelectedTab(tab),
        className: `px-4 py-3 font-medium transition-colors capitalize whitespace-nowrap border-b-2 ${selectedTab === tab ? "border-brand-orange text-brand-orange" : "border-transparent text-brand-brown/60 hover:text-brand-brown"}`,
        children: tab
      },
      tab
    )) }),
    selectedTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            icon: DollarSign,
            label: "Monthly Revenue",
            value: `R${metrics.revenue.thisMonth.toLocaleString()}`,
            trend: metrics.revenue.trend
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            icon: Users,
            label: "Total Bookings",
            value: metrics.bookings.total,
            trend: 8
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            icon: Star,
            label: "Guest Rating",
            value: metrics.satisfaction.averageRating,
            unit: "/5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            icon: Target,
            label: "Occupancy Rate",
            value: metrics.performance.occupancyRate,
            unit: "%"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            icon: Calendar,
            label: "Completion Rate",
            value: metrics.bookings.completionRate,
            unit: "%"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            icon: BarChart3,
            label: "Health Score",
            value: summary.healthScore,
            unit: "/100"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-6 border border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5 text-brand-orange" }),
          "Partnership Health"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(analytics.revenue.insights).slice(0, 3).map((insight, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 bg-cream rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-brand-brown", children: insight[1].title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/60", children: insight[1].message })
          ] })
        ] }, idx)) })
      ] })
    ] }),
    selectedTab === "revenue" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-6 border border-cream-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Revenue Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "This Month" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                "R",
                metrics.revenue.thisMonth.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "Last Month" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                "R",
                metrics.revenue.lastMonth.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "This Year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                "R",
                metrics.revenue.thisYear.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown font-medium", children: "Total Lifetime" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-lg", children: [
                "R",
                metrics.revenue.total.toLocaleString()
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-6 border border-cream-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Commission Earnings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "Commission Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: summary.commission })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "Total Commissions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                "R",
                metrics.earnings.commissionEarnings.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "Bonus Earnings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                "R",
                metrics.earnings.bonusEarnings.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown font-medium", children: "Total Earnings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-lg text-green-600", children: [
                "R",
                metrics.earnings.totalEarnings.toLocaleString()
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-6 border border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Revenue Forecast" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: analytics.revenue.forecast.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-cream rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-brand-brown/60", children: [
            "Month ",
            item.month
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 mx-4 h-1 bg-gradient-to-r from-brand-orange/20 to-brand-orange rounded-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
            "R",
            item.projected.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-brand-brown/40 ml-2", children: [
            item.confidence,
            "%"
          ] })
        ] }, idx)) })
      ] })
    ] }),
    selectedTab === "opportunities" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: opportunities.length > 0 ? opportunities.map((opp, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-6 border border-cream-border hover:border-brand-orange/20 transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-orange bg-brand-orange/10 p-3 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "w-6 h-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-brand-brown mb-1", children: opp.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/60 mb-3", children: opp.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60", children: "Revenue Impact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-green-600", children: [
              "+R",
              opp.impact.toLocaleString(),
              "/year"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60", children: "Implementation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-brand-brown", children: opp.timeToImplement })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors", children: "Learn More →" })
      ] })
    ] }) }, idx)) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-8 text-center border border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-12 h-12 text-green-500 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-medium", children: "You're optimized!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/60", children: "No immediate opportunities identified." })
    ] }) }),
    selectedTab === "benchmarking" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-6 border border-cream-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Price Analysis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/60", children: "Your Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-brown", children: [
                "R",
                comparison.priceComparison.yourPrice
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/60", children: "Market Average" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-brown/60", children: [
                "R",
                comparison.priceComparison.avgPrice
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-brown/60", children: "Position" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold capitalize text-brand-orange", children: comparison.priceComparison.position }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-brand-brown/60 mt-1", children: [
                comparison.priceComparison.percentageDifference > 0 ? "+" : "",
                comparison.priceComparison.percentageDifference,
                "% vs market"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-6 border border-cream-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Market Position" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center p-3 bg-cream rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-brand-brown/60", children: "Rating Benchmark" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                comparison.ratingComparison.benchmark,
                "/5"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center p-3 bg-cream rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-brand-brown/60", children: "Occupancy Target" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                comparison.occupancyComparison.benchmark,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-green-50 rounded-lg border border-green-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-green-700", children: "Your rating is above market average! 🎉" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Recommended Strategies" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: strategies.map((strategy, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-5 border border-cream-border hover:border-brand-orange/20 transition-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-brand-brown mb-2", children: strategy.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60 mb-3", children: strategy.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown/60", children: "Expected Occupancy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: strategy.expectedOccupancy })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown/60", children: "Est. Annual Revenue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-green-600", children: [
                "R",
                strategy.expectedRevenue.toLocaleString()
              ] })
            ] })
          ] })
        ] }, idx)) })
      ] })
    ] }),
    selectedTab === "insights" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: insights.length > 0 ? insights.map((insight, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-4 border-2 flex gap-3 ${insight.type === "warning" ? "bg-red-50 border-red-200" : insight.type === "opportunity" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5", children: [
        insight.type === "warning" && /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-5 h-5 text-red-600" }),
        insight.type === "opportunity" && /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "w-5 h-5 text-blue-600" }),
        insight.type === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-5 h-5 text-green-600" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-sm mb-1", children: [
          insight.category,
          ": ",
          insight.message
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60", children: insight.action })
      ] })
    ] }, idx)) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-8 text-center border border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-12 h-12 text-brand-orange mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-brand-brown", children: "All metrics are excellent!" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
export {
  PartnerSuccessDashboard as default
};
//# sourceMappingURL=PartnerSuccessDashboard-CjKpIuP4.js.map
