/**
 * Partner Analytics Engine
 * Comprehensive analytics, trend analysis, and forecast generation
 */

/**
 * Calculate revenue analytics
 */
export function calculateRevenueAnalytics(metrics) {
  const history = metrics.revenue.history || [];
  
  if (history.length === 0) {
    return {
      totalRevenue: 0,
      averageMonthly: 0,
      trend: 0,
      growth: 0,
      forecast: [],
      insights: [],
    };
  }
  
  const totalRevenue = history.reduce((sum, item) => sum + item.amount, 0);
  const averageMonthly = Math.round(totalRevenue / history.length);
  
  // Calculate trend (linear regression)
  const trend = calculateTrend(history.map(h => h.amount));
  
  // Calculate growth rate
  let growth = 0;
  if (history.length >= 2) {
    const lastMonth = history[history.length - 1].amount;
    const previousMonth = history[history.length - 2].amount;
    growth = ((lastMonth - previousMonth) / previousMonth) * 100;
  }
  
  // Generate forecast
  const forecast = generateRevenueForecast(history.map(h => h.amount), 3);
  
  // Generate insights
  const insights = generateRevenueInsights(history, trend, growth);
  
  return {
    totalRevenue,
    averageMonthly,
    trend,
    growth,
    forecast,
    insights,
    history: history.slice(-12), // Last 12 months
  };
}

/**
 * Calculate occupancy analytics
 */
export function calculateOccupancyAnalytics(metrics) {
  const occupancyRate = metrics.performance?.occupancyRate || 0;
  const totalListings = metrics.inventory?.totalListings || 1;
  const activeListings = metrics.inventory?.activeListings || 0;
  
  // Estimate vacant days
  const occupiedDays = Math.round((occupancyRate / 100) * 365);
  const vacantDays = 365 - occupiedDays;
  
  // Calculate opportunity
  const opportunityCost = calculateOccupancyOpportunityCost(vacantDays, metrics.performance.responseTime);
  
  return {
    currentOccupancy: occupancyRate,
    occupiedDays,
    vacantDays,
    activeListings,
    listingUtilization: (activeListings / totalListings) * 100,
    opportunityCost,
    recommendations: generateOccupancyRecommendations(occupancyRate, vacantDays),
  };
}

/**
 * Calculate guest satisfaction analytics
 */
export function calculateGuestSatisfactionAnalytics(metrics) {
  const satisfaction = metrics.satisfaction || {};
  const rating = satisfaction.averageRating || 4.0;
  const reviewCount = satisfaction.reviewCount || 0;
  const recommendationRate = satisfaction.recommendationRate || 80;
  const complaintCount = satisfaction.complaintCount || 0;
  
  return {
    averageRating: rating,
    reviewCount,
    recommendationRate,
    complaintRate: complaintCount > 0 ? (complaintCount / reviewCount) * 100 : 0,
    nps: (recommendationRate - (100 - recommendationRate)), // Net Promoter Score
    satisfactionTrend: rating >= 4.3 ? 'improving' : rating >= 4.0 ? 'stable' : 'declining',
    insights: generateSatisfactionInsights(rating, reviewCount, recommendationRate),
  };
}

/**
 * Calculate booking analytics
 */
export function calculateBookingAnalytics(metrics) {
  const bookings = metrics.bookings || {};
  const total = bookings.total || 0;
  const completed = bookings.completed || 0;
  const cancelled = bookings.cancelled || 0;
  const completionRate = bookings.completionRate || 95;
  
  const avgBookingValue = total > 0 ? Math.round(metrics.revenue.total / total) : 0;
  const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
  
  return {
    totalBookings: total,
    completedBookings: completed,
    cancelledBookings: cancelled,
    completionRate,
    cancellationRate,
    averageBookingValue: avgBookingValue,
    monthlyBookings: bookings.thisMonth || 0,
    bookingTrend: bookings.thisMonth > 0 ? 'increasing' : 'stable',
    insights: generateBookingInsights(total, completed, cancelled, cancellationRate),
  };
}

/**
 * Calculate performance score
 */
export function calculatePerformanceScore(metrics) {
  const performance = metrics.performance || {};
  
  const scores = {
    responseTime: Math.max(0, 100 - ((performance.responseTime || 2) - 2) * 15), // Penalty for slow response
    occupancy: Math.min(100, (performance.occupancyRate || 0) * 1.43), // Target is 70%
    rating: Math.min(100, (performance.guestRating || 4.0) * 22.2), // Target is 4.5/5
    cancellation: Math.max(0, 100 - ((performance.cancellationRate || 0) - 5) * 8), // Target is 5%
    completion: performance.completionRate || 95,
    pricing: Math.min(100, (performance.pricingOptimization || 0) * 10), // Target is 10%
  };
  
  const weights = {
    responseTime: 0.15,
    occupancy: 0.25,
    rating: 0.20,
    cancellation: 0.15,
    completion: 0.15,
    pricing: 0.10,
  };
  
  const weighted = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + (score * (weights[key] || 0));
  }, 0);
  
  return Math.round(weighted);
}

/**
 * Generate trend line (simple linear regression)
 */
function calculateTrend(data) {
  if (data.length < 2) return 0;
  
  const n = data.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = data.reduce((sum, y, i) => sum + (i + 1) * y, 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}

/**
 * Generate revenue forecast
 */
function generateRevenueForecast(history, months = 3) {
  const forecast = [];
  const trend = calculateTrend(history);
  const lastValue = history[history.length - 1];
  
  for (let i = 1; i <= months; i++) {
    const projected = lastValue + (trend * i);
    forecast.push({
      month: i,
      projected: Math.round(Math.max(0, projected)),
      confidence: 80 - (i * 5), // Confidence decreases with distance
    });
  }
  
  return forecast;
}

/**
 * Generate revenue insights
 */
function generateRevenueInsights(history, trend, growth) {
  const insights = [];
  
  if (trend > 0) {
    insights.push({
      type: 'positive',
      title: 'Revenue Growing',
      message: `Your revenue is trending upward with an average monthly increase of R${Math.round(trend)}.`,
    });
  } else if (trend < 0) {
    insights.push({
      type: 'warning',
      title: 'Revenue Declining',
      message: `Your revenue is trending downward. Consider reviewing pricing or marketing strategy.`,
    });
  }
  
  if (growth > 20) {
    insights.push({
      type: 'positive',
      title: 'Strong Month',
      message: `This month's revenue grew ${Math.round(growth)}% compared to last month - excellent work!`,
    });
  } else if (growth < -20) {
    insights.push({
      type: 'warning',
      title: 'Declining Revenue',
      message: `This month's revenue declined ${Math.abs(Math.round(growth))}% compared to last month.`,
    });
  }
  
  return insights;
}

/**
 * Generate occupancy recommendations
 */
function generateOccupancyRecommendations(occupancy, vacantDays) {
  const recommendations = [];
  
  if (occupancy < 60) {
    recommendations.push({
      priority: 'high',
      action: 'Reduce price or increase marketing',
      impact: `Filling ${vacantDays} vacant days could increase annual revenue significantly`,
    });
  } else if (occupancy < 70) {
    recommendations.push({
      priority: 'medium',
      action: 'Optimize your property listing photos and description',
      impact: `Small improvements in listing quality could boost occupancy by 5-10%`,
    });
  }
  
  if (vacantDays > 100) {
    recommendations.push({
      priority: 'high',
      action: 'Consider seasonal pricing adjustments',
      impact: `Off-season discounts could help fill ${vacantDays} vacant days`,
    });
  }
  
  return recommendations;
}

/**
 * Calculate occupancy opportunity cost
 */
function calculateOccupancyOpportunityCost(vacantDays, avgPrice = 1500) {
  return vacantDays * avgPrice;
}

/**
 * Generate satisfaction insights
 */
function generateSatisfactionInsights(rating, reviewCount, recommendationRate) {
  const insights = [];
  
  if (rating >= 4.5) {
    insights.push({
      type: 'positive',
      title: 'Excellent Rating',
      message: `Your ${rating}/5 rating puts you in the top tier of properties. Keep it up!`,
    });
  } else if (rating >= 4.0) {
    insights.push({
      type: 'neutral',
      title: 'Good Rating',
      message: `Your ${rating}/5 rating is solid. Focus on the feedback in your reviews to improve.`,
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Low Rating',
      message: `Your ${rating}/5 rating is below market average. Review guest feedback and address issues.`,
    });
  }
  
  if (recommendationRate > 80) {
    insights.push({
      type: 'positive',
      title: 'High Recommendation Rate',
      message: `${recommendationRate}% of guests would recommend your property - that's excellent for referrals!`,
    });
  }
  
  if (reviewCount < 10) {
    insights.push({
      type: 'opportunity',
      title: 'Build Review Credibility',
      message: `With only ${reviewCount} reviews, focus on getting more to build trust with potential guests.`,
    });
  }
  
  return insights;
}

/**
 * Generate booking insights
 */
function generateBookingInsights(total, completed, cancelled, cancellationRate) {
  const insights = [];
  
  if (cancellationRate > 10) {
    insights.push({
      type: 'warning',
      title: 'High Cancellation Rate',
      message: `Your ${Math.round(cancellationRate)}% cancellation rate is high. Review your policies and communication.`,
    });
  }
  
  if (total > 50) {
    insights.push({
      type: 'positive',
      title: 'High Booking Volume',
      message: `${total} bookings shows strong market demand for your property type.`,
    });
  }
  
  return insights;
}

/**
 * Get comprehensive dashboard data
 */
export function getComprehensiveDashboardData(metrics, analysis) {
  return {
    revenue: calculateRevenueAnalytics(metrics),
    occupancy: calculateOccupancyAnalytics(metrics),
    satisfaction: calculateGuestSatisfactionAnalytics(metrics),
    bookings: calculateBookingAnalytics(metrics),
    performanceScore: calculatePerformanceScore(metrics),
    competitorAnalysis: analysis,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate monthly report
 */
export function generateMonthlyReport(metrics) {
  const revenue = calculateRevenueAnalytics(metrics);
  const occupancy = calculateOccupancyAnalytics(metrics);
  const satisfaction = calculateGuestSatisfactionAnalytics(metrics);
  const bookings = calculateBookingAnalytics(metrics);
  const performance = calculatePerformanceScore(metrics);
  
  return {
    period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    summary: {
      totalRevenue: revenue.totalRevenue,
      totalBookings: bookings.totalBookings,
      averageRating: satisfaction.averageRating,
      occupancyRate: occupancy.currentOccupancy,
      performanceScore: performance,
    },
    metrics: {
      revenue,
      occupancy,
      satisfaction,
      bookings,
    },
    recommendations: generateMonthlyRecommendations(metrics),
  };
}

/**
 * Generate monthly recommendations
 */
function generateMonthlyRecommendations(metrics) {
  const recommendations = [];
  const revenue = calculateRevenueAnalytics(metrics);
  const occupancy = calculateOccupancyAnalytics(metrics);
  const satisfaction = calculateGuestSatisfactionAnalytics(metrics);
  
  if (revenue.growth > 0) {
    recommendations.push('Keep your current strategy - it\'s working!');
  } else {
    recommendations.push('Consider adjusting your pricing or marketing approach.');
  }
  
  if (occupancy.currentOccupancy < 70) {
    recommendations.push(`Work to improve occupancy from ${occupancy.currentOccupancy}% to 70%+`);
  }
  
  if (satisfaction.averageRating < 4.3) {
    recommendations.push('Focus on improving guest experience to boost ratings');
  }
  
  return recommendations;
}
