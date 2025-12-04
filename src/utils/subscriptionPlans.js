/**
 * Hybrid Subscription System
 * Combines flexible pay-as-you-grow subscriptions with commission-based earnings
 * 
 * Philosophy: No forced premiums. Startups pay ONLY what they use.
 * Free tier for new partners until they hit thresholds.
 * Subscription unlocks features that scale their business faster.
 */

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    badge: '🚀',
    monthlyPrice: 0,
    stripePriceId: null,
    description: 'Perfect for new partners testing the platform',
    targetAudience: 'Startups and new partners',
    
    // Commission structure (higher commission because no subscription)
    commission: {
      base: 0.20, // 20% base commission
      bonusPercentage: 0.05, // +5% bonus for hitting targets
      maxCommission: 0.25, // Cap at 25%
    },
    
    // Features
    features: {
      listings: 1,
      analyticsTracking: true,
      basicReports: true,
      competitorBenchmarking: false,
      advancedPricingTools: false,
      dedicatedSupport: false,
      customBranding: false,
      apiAccess: false,
      automationRules: 0,
      monthlyLeads: 50,
    },
    
    // Limitations
    limitations: {
      reportFrequency: 'monthly',
      historicalData: 3, // months
      dataExportFormat: 'csv',
      responseTimeTarget: '48 hours',
    },
    
    // Auto-upgrade conditions
    autoUpgrade: {
      monthlyRevenue: 5000, // Upgrade at R5k revenue
      listingsNeeded: 2,
      daysActive: 30,
    },
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    badge: '⭐',
    monthlyPrice: 149,
    stripePriceId: 'price_starter_monthly',
    description: 'For emerging partners ready to scale',
    targetAudience: 'Growing businesses (1-3 properties)',
    
    // Hybrid pricing: subscription + lower commission
    commission: {
      base: 0.15, // 15% base (5% discount vs Free)
      bonusPercentage: 0.03, // +3% bonus
      maxCommission: 0.18,
    },
    
    features: {
      listings: 3,
      analyticsTracking: true,
      basicReports: true,
      competitorBenchmarking: true, // NEW
      advancedPricingTools: false,
      dedicatedSupport: 'email',
      customBranding: false,
      apiAccess: false,
      automationRules: 2,
      monthlyLeads: 200,
    },
    
    limitations: {
      reportFrequency: 'weekly',
      historicalData: 6,
      dataExportFormat: ['csv', 'json'],
      responseTimeTarget: '24 hours',
    },
    
    benefits: [
      'Competitor benchmarking included',
      'Weekly performance reports',
      'Email support',
      '2 automation rules',
      'Access to promotions',
    ],
    
    autoUpgrade: {
      monthlyRevenue: 15000,
      listingsNeeded: 5,
      daysActive: 90,
    },
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    badge: '💎',
    monthlyPrice: 299,
    stripePriceId: 'price_pro_monthly',
    description: 'For successful partners maximizing revenue',
    targetAudience: 'Established businesses (4-10 properties)',
    
    // Subscription + significant commission discount
    commission: {
      base: 0.12, // 12% base (8% discount vs Free!)
      bonusPercentage: 0.02, // +2% bonus
      maxCommission: 0.14,
    },
    
    features: {
      listings: 10,
      analyticsTracking: true,
      advancedReports: true,
      competitorBenchmarking: true,
      advancedPricingTools: true, // NEW - Dynamic pricing
      dedicatedSupport: 'priority_email',
      customBranding: true, // NEW
      apiAccess: 'read',
      automationRules: 10,
      monthlyLeads: 1000,
    },
    
    limitations: {
      reportFrequency: 'daily',
      historicalData: 24,
      dataExportFormat: ['csv', 'json', 'xml'],
      responseTimeTarget: '4 hours',
    },
    
    benefits: [
      'Dynamic pricing engine included',
      'Daily reports and insights',
      'Priority email support',
      'Custom branding options',
      'Up to 10 automation rules',
      'Revenue optimization tools',
      'Advanced guest profiling',
      'Bulk operations',
      'Marketing templates',
    ],
    
    autoUpgrade: {
      monthlyRevenue: 50000,
      listingsNeeded: 20,
      daysActive: 180,
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    badge: '👑',
    monthlyPrice: 'custom',
    stripePriceId: 'contact_sales',
    description: 'White-glove service for portfolio operators',
    targetAudience: 'Large operators (10+ properties)',
    
    // Premium pricing: high subscription but lowest commission
    commission: {
      base: 0.08, // 8% base (12% discount vs Free!)
      bonusPercentage: 0.02, // +2% bonus
      maxCommission: 0.10,
    },
    
    features: {
      listings: 'unlimited',
      analyticsTracking: true,
      advancedReports: true,
      competitorBenchmarking: true,
      advancedPricingTools: true,
      dedicatedSupport: 'dedicated_account_manager',
      customBranding: true,
      apiAccess: 'full',
      automationRules: 'unlimited',
      monthlyLeads: 'unlimited',
    },
    
    limitations: {
      reportFrequency: 'real-time',
      historicalData: 60,
      dataExportFormat: ['csv', 'json', 'xml', 'api'],
      responseTimeTarget: '1 hour',
    },
    
    benefits: [
      'Dedicated account manager',
      'Real-time analytics',
      '24/7 phone support',
      'Custom integration support',
      'White-label options',
      'Full API access',
      'Unlimited automation',
      'Custom training',
      'Priority feature requests',
      'Revenue guarantee consulting',
    ],
    
    customTerms: true,
    minimumCommitment: 12, // months
  },
};

/**
 * Calculate total monthly cost (subscription + expected commission impact)
 * This is the "WoW" moment - partners can see if subscription pays for itself
 */
export function calculateMonthlyROI(plan, estimatedMonthlyRevenue = 10000) {
  const planData = SUBSCRIPTION_PLANS[plan];
  if (!planData) return null;

  const subscriptionCost = typeof planData.monthlyPrice === 'number' ? planData.monthlyPrice : 0;
  
  // Commission calculation
  const baseCommission = estimatedMonthlyRevenue * planData.commission.base;
  
  // If on free tier, no subscription cost but higher commission
  // If on paid tier, subscription cost offsets lower commission
  const netCost = subscriptionCost; // Subscription cost
  const commissionSaved = planData.id === 'free' ? 0 : (
    (SUBSCRIPTION_PLANS.free.commission.base - planData.commission.base) * estimatedMonthlyRevenue
  );
  
  const roi = commissionSaved - subscriptionCost; // Positive = subscription paid for itself
  const roiPercentage = (roi / estimatedMonthlyRevenue) * 100;
  
  return {
    plan: planData.name,
    subscriptionCost,
    baseCommission,
    commissionRate: `${(planData.commission.base * 100).toFixed(1)}%`,
    monthlyRevenue: estimatedMonthlyRevenue,
    commissionSaved,
    monthlyROI: Math.round(roi),
    roiPercentage: roiPercentage.toFixed(1),
    breakeven: subscriptionCost > 0 ? Math.round(subscriptionCost / ((SUBSCRIPTION_PLANS.free.commission.base - planData.commission.base) * estimatedMonthlyRevenue / 100)) : 0,
    recommendation: roiPercentage > 0 ? 'upgrade' : 'stay', // "WoW" moment flag
  };
}

/**
 * Get plan recommendation based on partner metrics
 */
export function recommendPlan(partnerMetrics) {
  const monthlyRevenue = partnerMetrics.revenue?.thisMonth || 0;
  const listings = partnerMetrics.inventory?.activeListings || 1;
  const occupancy = partnerMetrics.performance?.occupancyRate || 0;
  
  // Start with Free
  let recommended = 'free';
  
  // Starter threshold: R5k revenue or 2+ listings
  if (monthlyRevenue >= 5000 || listings >= 2) {
    recommended = 'starter';
    const starterROI = calculateMonthlyROI('starter', monthlyRevenue);
    if (starterROI.roiPercentage > 5) recommended = 'starter';
  }
  
  // Pro threshold: R15k revenue or 5+ listings with high occupancy
  if (monthlyRevenue >= 15000 || (listings >= 5 && occupancy > 70)) {
    recommended = 'pro';
    const proROI = calculateMonthlyROI('pro', monthlyRevenue);
    if (proROI.roiPercentage > 3) recommended = 'pro';
  }
  
  // Enterprise: R50k+ revenue
  if (monthlyRevenue >= 50000) {
    recommended = 'enterprise';
  }
  
  return {
    recommended,
    reason: getRecommendationReason(recommended, monthlyRevenue, listings),
    alternatives: getAlternatives(recommended),
    expectedSavings: calculateMonthlyROI(recommended, monthlyRevenue).commissionSaved,
  };
}

function getRecommendationReason(plan, revenue, listings) {
  const reasons = {
    free: 'Perfect for getting started. No cost, full access.',
    starter: `Your revenue (R${revenue.toLocaleString()}) makes Starter profitable.`,
    pro: `With ${listings} properties, Pro unlocks advanced tools that drive growth.`,
    enterprise: 'Your scale deserves dedicated support and lowest commission rates.',
  };
  return reasons[plan] || reasons.free;
}

function getAlternatives(currentPlan) {
  const plans = ['free', 'starter', 'pro', 'enterprise'];
  const idx = plans.indexOf(currentPlan);
  const alternatives = [];
  
  if (idx > 0) alternatives.push(plans[idx - 1]); // Lower tier
  if (idx < plans.length - 1) alternatives.push(plans[idx + 1]); // Higher tier
  
  return alternatives;
}

/**
 * Get subscription benefits summary
 */
export function getSubscriptionBenefits(plan) {
  const planData = SUBSCRIPTION_PLANS[plan];
  if (!planData) return null;
  
  return {
    name: planData.name,
    price: planData.monthlyPrice,
    commission: `${(planData.commission.base * 100).toFixed(1)}%`,
    features: planData.features,
    benefits: planData.benefits || [],
    listing: planData.listings,
    support: planData.features.dedicatedSupport,
    reporting: planData.limitations.reportFrequency,
  };
}

/**
 * Calculate cost comparison across all plans
 */
export function getComparisonChart(monthlyRevenue = 10000) {
  return Object.keys(SUBSCRIPTION_PLANS).map(planId => {
    const roi = calculateMonthlyROI(planId, monthlyRevenue);
    return {
      ...roi,
      planId,
      badge: SUBSCRIPTION_PLANS[planId].badge,
    };
  });
}

/**
 * Get upgrade/downgrade simulation
 */
export function simulateUpgrade(currentPlan, newPlan, monthlyRevenue) {
  const currentROI = calculateMonthlyROI(currentPlan, monthlyRevenue);
  const newROI = calculateMonthlyROI(newPlan, monthlyRevenue);
  
  return {
    from: SUBSCRIPTION_PLANS[currentPlan].name,
    to: SUBSCRIPTION_PLANS[newPlan].name,
    currentMonthlyROI: currentROI.monthlyROI,
    newMonthlyROI: newROI.monthlyROI,
    roiChange: newROI.monthlyROI - currentROI.monthlyROI,
    isPositive: newROI.monthlyROI > currentROI.monthlyROI,
    breakeven: newROI.breakeven,
    annualSavings: (newROI.monthlyROI - currentROI.monthlyROI) * 12,
  };
}

/**
 * Get all plans
 */
export function getAllPlans() {
  return SUBSCRIPTION_PLANS;
}

/**
 * Get plan by ID
 */
export function getPlan(planId) {
  return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
}

/**
 * Calculate breakeven revenue for a plan
 */
export function calculateBreakevenRevenue(planId) {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan || plan.monthlyPrice === 0 || plan.monthlyPrice === 'custom') return 0;
  
  // Breakeven = subscription cost / (free commission rate - plan commission rate)
  const freePlan = SUBSCRIPTION_PLANS.free;
  const commissionDifference = freePlan.commission.base - plan.commission.base;
  
  return Math.ceil(plan.monthlyPrice / commissionDifference);
}

/**
 * Create subscription order
 */
export function createSubscriptionOrder(partnerId, planId, billingInfo) {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) throw new Error('Invalid plan');
  
  const order = {
    id: `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    partnerId,
    planId,
    planName: plan.name,
    monthlyPrice: plan.monthlyPrice,
    createdAt: new Date().toISOString(),
    startDate: new Date().toISOString(),
    renewalDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingInfo,
    status: 'pending_payment',
    stripeSessionId: null,
  };
  
  return order;
}

/**
 * Validate plan switch
 */
export function validatePlanSwitch(currentPlan, newPlan, monthlyRevenue) {
  const current = SUBSCRIPTION_PLANS[currentPlan];
  const next = SUBSCRIPTION_PLANS[newPlan];
  
  if (!current || !next) return { valid: false, reason: 'Invalid plan' };
  
  // Prevent immediate downgrades (cooldown period)
  if (Object.keys(SUBSCRIPTION_PLANS).indexOf(newPlan) < Object.keys(SUBSCRIPTION_PLANS).indexOf(currentPlan)) {
    return { 
      valid: true, 
      warning: 'Downgrade will reduce available features',
      requiresConfirmation: true,
    };
  }
  
  return { valid: true };
}
