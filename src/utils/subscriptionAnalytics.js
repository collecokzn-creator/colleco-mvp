/**
 * ROI Calculator and Analytics
 * Shows partners exactly when subscription pays for itself
 * This is the "WoW" moment - data-driven upgrade recommendations
 */

import { calculateMonthlyROI, getPlan, SUBSCRIPTION_PLANS } from './subscriptionPlans.js';

export class ROIAnalyzer {
  constructor(partnerId, partnerMetrics) {
    this.partnerId = partnerId;
    this.metrics = partnerMetrics;
    this.currentPlan = partnerMetrics.subscription?.planId || 'free';
    this.monthlyRevenue = partnerMetrics.revenue?.thisMonth || 0;
  }

  /**
   * Calculate ROI for all plans
   */
  analyzeAllPlans() {
    const analysis = [];
    const planIds = ['free', 'starter', 'pro', 'enterprise'];
    
    for (const planId of planIds) {
      const roi = calculateMonthlyROI(planId, this.monthlyRevenue);
      const plan = getPlan(planId);
      
      analysis.push({
        planId,
        name: plan.name,
        badge: plan.badge,
        monthlyPrice: plan.monthlyPrice,
        commission: `${(plan.commission.base * 100).toFixed(1)}%`,
        ...roi,
        isCurrent: planId === this.currentPlan,
        isRecommended: this.getRecommendation() === planId,
      });
    }
    
    return analysis;
  }

  /**
   * Get smart recommendation
   */
  getRecommendation() {
    const current = getPlan(this.currentPlan);
    if (!current) return 'free';
    
    // Current revenue-based recommendation
    if (this.monthlyRevenue >= 50000) return 'enterprise';
    if (this.monthlyRevenue >= 15000) return 'pro';
    if (this.monthlyRevenue >= 5000) return 'starter';
    return 'free';
  }

  /**
   * Calculate breakeven point (when subscription pays for itself)
   */
  calculateBreakeven() {
    const plans = ['starter', 'pro'];
    const results = {};
    
    for (const planId of plans) {
      const plan = getPlan(planId);
      if (typeof plan.monthlyPrice !== 'number' || plan.monthlyPrice === 0) continue;
      
      const freePlan = getPlan('free');
      const commissionDifference = freePlan.commission.base - plan.commission.base;
      
      // Breakeven revenue = subscription cost / commission difference
      const breakeven = Math.ceil(plan.monthlyPrice / commissionDifference);
      
      results[planId] = {
        monthlyBreakeven: breakeven,
        daysToBreakeven: Math.ceil(breakeven / (this.monthlyRevenue / 30)) || 365,
        isAlreadyProfit: this.monthlyRevenue >= breakeven,
        profitIfUpgraded: Math.max(0, this.monthlyRevenue * commissionDifference - plan.monthlyPrice),
      };
    }
    
    return results;
  }

  /**
   * Generate "WoW" insight - when does upgrade pay for itself?
   */
  generateInsight() {
    const recommendation = this.getRecommendation();
    const breakeven = this.calculateBreakeven();
    
    if (recommendation === this.currentPlan) {
      return {
        type: 'optimal',
        message: `Your current plan (${getPlan(this.currentPlan).name}) is perfect for your revenue level.`,
        action: 'continue',
      };
    }
    
    const recommendedPlan = getPlan(recommendation);
    const breakevensData = breakeven[recommendation];
    
    if (!breakevensData) {
      return {
        type: 'info',
        message: `Consider exploring ${recommendedPlan.name} for more advanced features.`,
        action: 'explore',
      };
    }
    
    const isWorthIt = breakevensData.isAlreadyProfit || breakevensData.daysToBreakeven < 90;
    
    if (isWorthIt) {
      return {
        type: 'wow_positive',
        message: `🎉 ${recommendedPlan.name} would PAY FOR ITSELF in ${breakevensData.daysToBreakeven} days at your current revenue!`,
        savings: breakevensData.profitIfUpgraded,
        annualSavings: breakeventsData.profitIfUpgraded * 12,
        daysToBreakeven: breakeventsData.daysToBreakeven,
        action: 'upgrade_now',
      };
    }
    
    return {
      type: 'info',
      message: `Upgrade to ${recommendedPlan.name} when you reach R${breakeventsData.monthlyBreakeven.toLocaleString()}/month revenue.`,
      targetRevenue: breakeventsData.monthlyBreakeven,
      action: 'monitor',
    };
  }

  /**
   * Simulate growth path
   */
  simulateGrowthPath(monthlyGrowthRate = 0.05) {
    const projections = [];
    let currentRevenue = this.monthlyRevenue;
    let currentPlan = this.currentPlan;
    
    for (let month = 0; month <= 24; month++) {
      const projection = {
        month,
        revenue: Math.round(currentRevenue),
        plan: currentPlan,
        planName: getPlan(currentPlan).name,
      };
      
      // Update ROI info
      const roi = calculateMonthlyROI(currentPlan, currentRevenue);
      projection.roi = roi.monthlyROI;
      projection.savings = roi.commissionSaved;
      
      // Check if should upgrade
      if (month > 0 && month % 3 === 0) {
        const recommended = this.getRecommendedPlanForRevenue(currentRevenue);
        if (recommended !== currentPlan && recommended !== 'enterprise') {
          currentPlan = recommended;
          projection.planChange = true;
          projection.newPlan = recommended;
        }
      }
      
      projections.push(projection);
      currentRevenue = currentRevenue * (1 + monthlyGrowthRate);
    }
    
    return projections;
  }

  getRecommendedPlanForRevenue(revenue) {
    if (revenue >= 50000) return 'enterprise';
    if (revenue >= 15000) return 'pro';
    if (revenue >= 5000) return 'starter';
    return 'free';
  }

  /**
   * Cost comparison across all plans at different revenue levels
   */
  generateComparisonTable() {
    const revenuePoints = [0, 5000, 10000, 15000, 25000, 50000];
    const table = [];
    
    for (const revenue of revenuePoints) {
      const row = { revenue };
      
      for (const planId of ['free', 'starter', 'pro', 'enterprise']) {
        const plan = getPlan(planId);
        const roi = calculateMonthlyROI(planId, revenue);
        
        row[planId] = {
          subscription: plan.monthlyPrice,
          commission: `${(plan.commission.base * 100).toFixed(1)}%`,
          monthlyROI: roi.monthlyROI,
          savings: roi.commissionSaved,
        };
      }
      
      table.push(row);
    }
    
    return table;
  }

  /**
   * Feature value analysis
   */
  analyzeFeatureValue() {
    const currentPlan = getPlan(this.currentPlan);
    const upgradePlans = ['starter', 'pro', 'enterprise'];
    const analysis = {};
    
    for (const planId of upgradePlans) {
      const plan = getPlan(planId);
      const newFeatures = this.getNewFeatures(currentPlan, plan);
      const estimatedRevenueLift = this.estimateRevenueLift(newFeatures);
      
      const subscriptionCost = typeof plan.monthlyPrice === 'number' ? plan.monthlyPrice : 0;
      const addedValue = estimatedRevenueLift - subscriptionCost;
      
      analysis[planId] = {
        newFeatures: newFeatures.map(f => f.name),
        estimatedRevenueLift: Math.round(estimatedRevenueLift),
        subscriptionCost,
        netValue: Math.round(addedValue),
        roi: addedValue > 0 ? 'positive' : 'neutral',
      };
    }
    
    return analysis;
  }

  getNewFeatures(currentPlan, upgradePlan) {
    const currentFeatures = currentPlan.features || {};
    const newFeatures = upgradePlan.features || {};
    const differences = [];
    
    const featureValues = {
      competitorBenchmarking: 500,
      advancedPricingTools: 2000,
      customBranding: 800,
      automationRules: 300, // per rule
      dedicatedSupport: 1000,
    };
    
    for (const [feature, value] of Object.entries(featureValues)) {
      if (!currentFeatures[feature] && newFeatures[feature]) {
        differences.push({
          name: feature,
          estimatedValue: value,
        });
      }
    }
    
    return differences;
  }

  estimateRevenueLift(features) {
    return features.reduce((sum, f) => sum + f.estimatedValue, 0);
  }

  /**
   * Partner success indicators
   */
  getHealthScore() {
    const score = {};
    
    // Revenue health
    score.revenue = this.monthlyRevenue > 10000 ? 'high' : 
                   this.monthlyRevenue > 5000 ? 'medium' : 'low';
    
    // Plan optimization
    const recommended = this.getRecommendation();
    score.planOptimization = recommended === this.currentPlan ? 'optimal' :
                            Object.keys(SUBSCRIPTION_PLANS).indexOf(recommended) > Object.keys(SUBSCRIPTION_PLANS).indexOf(this.currentPlan) ? 'upgrade_ready' : 'downgrade_available';
    
    // ROI opportunity
    const breakeven = this.calculateBreakeven();
    const opportunities = Object.values(breakeven).filter(b => b.isAlreadyProfit).length;
    score.roiOpportunity = opportunities > 0 ? 'high' : 'monitor';
    
    return score;
  }

  /**
   * Export analysis for dashboard
   */
  exportAnalysis() {
    return {
      partnerId: this.partnerId,
      currentPlan: this.currentPlan,
      monthlyRevenue: this.monthlyRevenue,
      allPlansAnalysis: this.analyzeAllPlans(),
      breakeven: this.calculateBreakeven(),
      insight: this.generateInsight(),
      healthScore: this.getHealthScore(),
      comparisonTable: this.generateComparisonTable(),
      featureAnalysis: this.analyzeFeatureValue(),
      growthPath: this.simulateGrowthPath(),
    };
  }
}

/**
 * Get ROI analyzer for partner
 */
export function createROIAnalyzer(partnerId, partnerMetrics) {
  return new ROIAnalyzer(partnerId, partnerMetrics);
}

/**
 * Quick ROI check
 */
export function quickROICheck(planId, monthlyRevenue) {
  const roi = calculateMonthlyROI(planId, monthlyRevenue);
  const plan = getPlan(planId);
  
  return {
    plan: plan.name,
    subscription: plan.monthlyPrice,
    commission: `${(plan.commission.base * 100).toFixed(1)}%`,
    monthlyROI: roi.monthlyROI,
    recommendation: roi.roiPercentage > 0 ? '✅ Worth upgrading' : '❌ Stay with current plan',
  };
}
