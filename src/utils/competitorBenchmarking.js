/**
 * Competitor Benchmarking System
 * Analyzes market trends, competitor performance, and provides pricing recommendations
 */

const MARKET_DATA = {
  // Market segments and their average metrics
  segments: {
    luxury: { avgPrice: 3500, avgRating: 4.6, avgOccupancy: 75, competitors: 120 },
    midRange: { avgPrice: 1500, avgRating: 4.3, avgOccupancy: 70, competitors: 450 },
    budget: { avgPrice: 600, avgRating: 4.1, avgOccupancy: 65, competitors: 890 },
  },
  
  // Regional variations
  regions: {
    durban: { demandMultiplier: 1.2, seasonalPeak: { months: [12, 1, 7], multiplier: 1.5 } },
    capeTown: { demandMultiplier: 1.4, seasonalPeak: { months: [11, 12, 1, 2], multiplier: 1.6 } },
    kruger: { demandMultiplier: 1.3, seasonalPeak: { months: [6, 7, 8], multiplier: 1.4 } },
    johburg: { demandMultiplier: 1.1, seasonalPeak: { months: [12, 1], multiplier: 1.3 } },
  },
};

/**
 * Analyze competitor landscape
 */
export function analyzeCompetitors(partnerId, propertyType, location, pricePoint) {
  const key = `competitorAnalysis:v1:${partnerId}`;
  
  let analysis = null;
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const data = JSON.parse(cached);
      // Use cache if less than 7 days old
      if (new Date() - new Date(data.analyzedAt) < 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {
    // Proceed with fresh analysis
  }
  
  const segment = getSegment(pricePoint);
  const regional = MARKET_DATA.regions[location.toLowerCase()] || MARKET_DATA.regions.johburg;
  const segmentData = MARKET_DATA.segments[segment];
  
  analysis = {
    partnerId,
    propertyType,
    location,
    pricePoint,
    analyzedAt: new Date().toISOString(),
    
    // Market positioning
    market: {
      segment,
      segmentAvgPrice: segmentData.avgPrice,
      segmentAvgRating: segmentData.avgRating,
      segmentAvgOccupancy: segmentData.avgOccupancy,
      competitorCount: segmentData.competitors,
      marketDemand: 'high', // high, medium, low
      demandMultiplier: regional.demandMultiplier,
    },
    
    // Competitive analysis
    competition: {
      directCompetitors: Math.floor(segmentData.competitors * 0.1), // 10% are direct
      pricePosition: getPricePosition(pricePoint, segmentData.avgPrice),
      ratingPosition: 'average', // above, average, below
      occupancyBenchmark: segmentData.avgOccupancy,
      marketShare: 0.5, // percentage of segment market share
    },
    
    // Pricing recommendations
    pricing: {
      currentPrice: pricePoint,
      recommendedPrice: calculateRecommendedPrice(pricePoint, segment, regional),
      minPrice: Math.round(segmentData.avgPrice * 0.7),
      maxPrice: Math.round(segmentData.avgPrice * 1.5),
      priceOpportunity: calculatePriceOpportunity(pricePoint, segment, regional),
      seasonalRecommendations: generateSeasonalRecommendations(pricePoint, regional),
    },
    
    // Performance opportunities
    opportunities: {
      occupancyGap: segmentData.avgOccupancy - 60, // Assumed current occupancy
      ratingGap: segmentData.avgRating - 4.0, // Assumed current rating
      potentialRevenue: 0, // Calculated below
      competitiveAdvantages: [],
    },
  };
  
  // Calculate potential revenue opportunity
  const currentRevenue = pricePoint * 365 * 0.6; // Assumed 60% occupancy
  const potentialRevenue = analysis.pricing.recommendedPrice * 365 * (segmentData.avgOccupancy / 100);
  analysis.opportunities.potentialRevenue = Math.round(potentialRevenue - currentRevenue);
  
  // Identify competitive advantages
  if (pricePoint < segmentData.avgPrice * 0.9) {
    analysis.opportunities.competitiveAdvantages.push('Price advantage');
  }
  if (propertyType === 'luxury' && segment !== 'luxury') {
    analysis.opportunities.competitiveAdvantages.push('Premium positioning opportunity');
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(analysis));
  } catch (e) {
    console.error('Failed to cache competitor analysis:', e);
  }
  
  return analysis;
}

/**
 * Get market segment based on price
 */
function getSegment(price) {
  if (price >= 2500) return 'luxury';
  if (price >= 1000) return 'midRange';
  return 'budget';
}

/**
 * Get price position relative to segment average
 */
function getPricePosition(currentPrice, avgPrice) {
  const ratio = currentPrice / avgPrice;
  if (ratio > 1.2) return 'premium';
  if (ratio > 0.95) return 'competitive';
  if (ratio > 0.75) return 'value';
  return 'budget';
}

/**
 * Calculate recommended price
 */
function calculateRecommendedPrice(currentPrice, segment, regional) {
  const segmentData = MARKET_DATA.segments[segment];
  
  // Base recommendation is segment average
  let recommended = segmentData.avgPrice;
  
  // Apply regional demand multiplier
  recommended *= regional.demandMultiplier;
  
  // Apply current price sensitivity (don't change too drastically)
  const blended = (recommended * 0.7) + (currentPrice * 0.3);
  
  return Math.round(blended);
}

/**
 * Calculate price opportunity
 */
function calculatePriceOpportunity(currentPrice, segment, regional) {
  const recommended = calculateRecommendedPrice(currentPrice, segment, regional);
  const opportunity = recommended - currentPrice;
  const percentageChange = (opportunity / currentPrice) * 100;
  
  return {
    priceChange: Math.round(opportunity),
    percentageChange: Math.round(percentageChange * 10) / 10,
    annualImpact: Math.round(opportunity * 365 * 0.65), // Assumed 65% occupancy
    recommendation: opportunity > 0 ? 'Increase price' : opportunity < 0 ? 'Decrease price' : 'Price is optimal',
  };
}

/**
 * Generate seasonal pricing recommendations
 */
function generateSeasonalRecommendations(basePrice, regional) {
  const { months: peakMonths, multiplier: peakMultiplier } = regional.seasonalPeak;
  
  const recommendations = {};
  for (let month = 1; month <= 12; month++) {
    if (peakMonths.includes(month)) {
      recommendations[`month_${month}`] = {
        month,
        season: 'peak',
        recommendedPrice: Math.round(basePrice * peakMultiplier),
        multiplier: peakMultiplier,
      };
    } else if (peakMonths.includes(month + 1) || peakMonths.includes(month - 1)) {
      recommendations[`month_${month}`] = {
        month,
        season: 'shoulder',
        recommendedPrice: Math.round(basePrice * 1.1),
        multiplier: 1.1,
      };
    } else {
      recommendations[`month_${month}`] = {
        month,
        season: 'offpeak',
        recommendedPrice: Math.round(basePrice * 0.85),
        multiplier: 0.85,
      };
    }
  }
  
  return recommendations;
}

/**
 * Compare with direct competitors
 */
export function compareWithCompetitors(analysis) {
  const avgPrice = MARKET_DATA.segments[analysis.market.segment].avgPrice;
  const avgRating = MARKET_DATA.segments[analysis.market.segment].avgRating;
  const avgOccupancy = MARKET_DATA.segments[analysis.market.segment].avgOccupancy;
  
  return {
    priceComparison: {
      yourPrice: analysis.pricing.currentPrice,
      avgPrice,
      difference: analysis.pricing.currentPrice - avgPrice,
      percentageDifference: ((analysis.pricing.currentPrice - avgPrice) / avgPrice * 100).toFixed(1),
      position: getPricePosition(analysis.pricing.currentPrice, avgPrice),
    },
    ratingComparison: {
      benchmark: avgRating,
      opportunity: `Target ${avgRating} rating to match competitors`,
    },
    occupancyComparison: {
      benchmark: avgOccupancy,
      opportunity: `Target ${avgOccupancy}% occupancy for market competitiveness`,
    },
  };
}

/**
 * Get pricing strategy recommendations
 */
export function getPricingStrategy(analysis, partnerMetrics) {
  const strategies = [];
  const opportunity = analysis.pricing.priceOpportunity;
  
  // Strategy 1: Value positioning
  if (opportunity.percentageChange < -10) {
    strategies.push({
      name: 'Value Positioning',
      description: 'You can reduce prices to capture more market share',
      pricePoint: Math.round(analysis.pricing.currentPrice * 0.95),
      expectedOccupancy: '75%',
      expectedRevenue: Math.round(Math.round(analysis.pricing.currentPrice * 0.95) * 365 * 0.75),
      pros: ['Higher occupancy', 'Competitive advantage', 'More bookings'],
      cons: ['Lower per-night revenue', 'Potential race to bottom'],
    });
  }
  
  // Strategy 2: Premium positioning
  if (opportunity.percentageChange > 10) {
    strategies.push({
      name: 'Premium Positioning',
      description: 'Increase prices to improve revenue per night',
      pricePoint: Math.round(analysis.pricing.currentPrice * 1.05),
      expectedOccupancy: '60%',
      expectedRevenue: Math.round(Math.round(analysis.pricing.currentPrice * 1.05) * 365 * 0.60),
      pros: ['Higher revenue per night', 'Premium image', 'Attract quality guests'],
      cons: ['Lower occupancy', 'Longer vacancy periods'],
    });
  }
  
  // Strategy 3: Dynamic pricing
  strategies.push({
    name: 'Dynamic Pricing',
    description: 'Adjust prices seasonally to maximize revenue',
    pricePoint: 'Variable by season',
    expectedOccupancy: '70%',
    expectedRevenue: Math.round(analysis.pricing.currentPrice * 365 * 0.70 * 1.15), // 15% uplift
    pros: ['Maximized revenue', 'Responsive to demand', 'Outcompete rivals'],
    cons: ['More management overhead', 'Guest perception variability'],
  });
  
  return strategies;
}

/**
 * Analyze revenue opportunities
 */
export function analyzeRevenueOpportunities(analysis, currentMetrics) {
  const opportunities = [];
  
  // Price optimization opportunity
  if (analysis.pricing.priceOpportunity.annualImpact > 0) {
    opportunities.push({
      type: 'pricing',
      name: 'Price Optimization',
      impact: analysis.pricing.priceOpportunity.annualImpact,
      timeToImplement: '1 week',
      difficulty: 'easy',
      description: `Increase average price by R${analysis.pricing.priceOpportunity.priceChange} per night`,
    });
  }
  
  // Occupancy improvement
  const occupancyGap = (analysis.market.segmentAvgOccupancy - 60) * 365;
  if (occupancyGap > 0) {
    opportunities.push({
      type: 'occupancy',
      name: 'Occupancy Improvement',
      impact: Math.round(occupancyGap * analysis.pricing.currentPrice * 0.1), // Conservative estimate
      timeToImplement: '2-4 weeks',
      difficulty: 'medium',
      description: `Improve occupancy from 60% to ${analysis.market.segmentAvgOccupancy}%`,
    });
  }
  
  // Rating improvement
  if (currentMetrics && currentMetrics.satisfaction.averageRating < analysis.market.segmentAvgRating) {
    opportunities.push({
      type: 'rating',
      name: 'Rating Improvement',
      impact: Math.round(5000), // Estimated impact of better ratings
      timeToImplement: '4-8 weeks',
      difficulty: 'medium',
      description: `Improve rating from ${currentMetrics.satisfaction.averageRating} to ${analysis.market.segmentAvgRating}`,
    });
  }
  
  // Sort by impact
  opportunities.sort((a, b) => b.impact - a.impact);
  
  return opportunities;
}

/**
 * Get market insights
 */
export function getMarketInsights(location, segment) {
  const regional = MARKET_DATA.regions[location.toLowerCase()] || MARKET_DATA.regions.johburg;
  const segmentData = MARKET_DATA.segments[segment];
  
  return {
    location,
    segment,
    regionalDemand: regional.demandMultiplier > 1.2 ? 'Very High' : regional.demandMultiplier > 1.1 ? 'High' : 'Moderate',
    competitorDensity: segmentData.competitors > 600 ? 'Very High' : segmentData.competitors > 300 ? 'High' : 'Moderate',
    marketOpportunity: segmentData.competitors < 300 && regional.demandMultiplier > 1.2 ? 'Excellent' : 'Good',
    avgPrice: segmentData.avgPrice,
    avgRating: segmentData.avgRating,
    avgOccupancy: segmentData.avgOccupancy,
  };
}
