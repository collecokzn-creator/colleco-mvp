const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free",
    badge: "🚀",
    monthlyPrice: 0,
    stripePriceId: null,
    description: "Perfect for new partners testing the platform",
    targetAudience: "Startups and new partners",
    // Commission structure (higher commission because no subscription)
    commission: {
      base: 0.2,
      // 20% base commission
      bonusPercentage: 0.05,
      // +5% bonus for hitting targets
      maxCommission: 0.25
      // Cap at 25%
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
      monthlyLeads: 50
    },
    // Limitations
    limitations: {
      reportFrequency: "monthly",
      historicalData: 3,
      // months
      dataExportFormat: "csv",
      responseTimeTarget: "48 hours"
    },
    // Auto-upgrade conditions
    autoUpgrade: {
      monthlyRevenue: 5e3,
      // Upgrade at R5k revenue
      listingsNeeded: 2,
      daysActive: 30
    }
  },
  starter: {
    id: "starter",
    name: "Starter",
    badge: "⭐",
    monthlyPrice: 149,
    stripePriceId: "price_starter_monthly",
    description: "For emerging partners ready to scale",
    targetAudience: "Growing businesses (1-3 properties)",
    // Hybrid pricing: subscription + lower commission
    commission: {
      base: 0.15,
      // 15% base (5% discount vs Free)
      bonusPercentage: 0.03,
      // +3% bonus
      maxCommission: 0.18
    },
    features: {
      listings: 3,
      analyticsTracking: true,
      basicReports: true,
      competitorBenchmarking: true,
      // NEW
      advancedPricingTools: false,
      dedicatedSupport: "email",
      customBranding: false,
      apiAccess: false,
      automationRules: 2,
      monthlyLeads: 200
    },
    limitations: {
      reportFrequency: "weekly",
      historicalData: 6,
      dataExportFormat: ["csv", "json"],
      responseTimeTarget: "24 hours"
    },
    benefits: [
      "Competitor benchmarking included",
      "Weekly performance reports",
      "Email support",
      "2 automation rules",
      "Access to promotions"
    ],
    autoUpgrade: {
      monthlyRevenue: 15e3,
      listingsNeeded: 5,
      daysActive: 90
    }
  },
  pro: {
    id: "pro",
    name: "Pro",
    badge: "💎",
    monthlyPrice: 299,
    stripePriceId: "price_pro_monthly",
    description: "For successful partners maximizing revenue",
    targetAudience: "Established businesses (4-10 properties)",
    // Subscription + significant commission discount
    commission: {
      base: 0.12,
      // 12% base (8% discount vs Free!)
      bonusPercentage: 0.02,
      // +2% bonus
      maxCommission: 0.14
    },
    features: {
      listings: 10,
      analyticsTracking: true,
      advancedReports: true,
      competitorBenchmarking: true,
      advancedPricingTools: true,
      // NEW - Dynamic pricing
      dedicatedSupport: "priority_email",
      customBranding: true,
      // NEW
      apiAccess: "read",
      automationRules: 10,
      monthlyLeads: 1e3
    },
    limitations: {
      reportFrequency: "daily",
      historicalData: 24,
      dataExportFormat: ["csv", "json", "xml"],
      responseTimeTarget: "4 hours"
    },
    benefits: [
      "Dynamic pricing engine included",
      "Daily reports and insights",
      "Priority email support",
      "Custom branding options",
      "Up to 10 automation rules",
      "Revenue optimization tools",
      "Advanced guest profiling",
      "Bulk operations",
      "Marketing templates"
    ],
    autoUpgrade: {
      monthlyRevenue: 5e4,
      listingsNeeded: 20,
      daysActive: 180
    }
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    badge: "👑",
    monthlyPrice: "custom",
    stripePriceId: "contact_sales",
    description: "White-glove service for portfolio operators",
    targetAudience: "Large operators (10+ properties)",
    // Premium pricing: high subscription but lowest commission
    commission: {
      base: 0.08,
      // 8% base (12% discount vs Free!)
      bonusPercentage: 0.02,
      // +2% bonus
      maxCommission: 0.1
    },
    features: {
      listings: "unlimited",
      analyticsTracking: true,
      advancedReports: true,
      competitorBenchmarking: true,
      advancedPricingTools: true,
      dedicatedSupport: "dedicated_account_manager",
      customBranding: true,
      apiAccess: "full",
      automationRules: "unlimited",
      monthlyLeads: "unlimited"
    },
    limitations: {
      reportFrequency: "real-time",
      historicalData: 60,
      dataExportFormat: ["csv", "json", "xml", "api"],
      responseTimeTarget: "1 hour"
    },
    benefits: [
      "Dedicated account manager",
      "Real-time analytics",
      "24/7 phone support",
      "Custom integration support",
      "White-label options",
      "Full API access",
      "Unlimited automation",
      "Custom training",
      "Priority feature requests",
      "Revenue guarantee consulting"
    ],
    customTerms: true,
    minimumCommitment: 12
    // months
  }
};
function calculateMonthlyROI(plan, estimatedMonthlyRevenue = 1e4) {
  const planData = SUBSCRIPTION_PLANS[plan];
  if (!planData) return null;
  const subscriptionCost = typeof planData.monthlyPrice === "number" ? planData.monthlyPrice : 0;
  const baseCommission = estimatedMonthlyRevenue * planData.commission.base;
  const commissionSaved = planData.id === "free" ? 0 : (SUBSCRIPTION_PLANS.free.commission.base - planData.commission.base) * estimatedMonthlyRevenue;
  const roi = commissionSaved - subscriptionCost;
  const roiPercentage = roi / estimatedMonthlyRevenue * 100;
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
    recommendation: roiPercentage > 0 ? "upgrade" : "stay"
    // "WoW" moment flag
  };
}
function getAllPlans() {
  return SUBSCRIPTION_PLANS;
}
function getPlan(planId) {
  return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
}
export {
  SUBSCRIPTION_PLANS as S,
  getAllPlans as a,
  calculateMonthlyROI as c,
  getPlan as g
};
//# sourceMappingURL=subscriptionPlans-rkZPWK28.js.map
