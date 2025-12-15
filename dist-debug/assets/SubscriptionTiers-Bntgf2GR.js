import { r as reactExports, j as jsxRuntimeExports, R as React } from "./motion-D9fZRtSt.js";
import { c as calculateMonthlyROI, g as getPlan, S as SUBSCRIPTION_PLANS, a as getAllPlans } from "./subscriptionPlans-rkZPWK28.js";
import { x as Star, T as TrendingUp, A as AlertCircle, I as Check, w as ChevronRight, a4 as CheckCircle, D as Download, l as CreditCard } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
class ROIAnalyzer {
  constructor(partnerId, partnerMetrics) {
    this.partnerId = partnerId;
    this.metrics = partnerMetrics;
    this.currentPlan = partnerMetrics.subscription?.planId || "free";
    this.monthlyRevenue = partnerMetrics.revenue?.thisMonth || 0;
  }
  /**
   * Calculate ROI for all plans
   */
  analyzeAllPlans() {
    const analysis = [];
    const planIds = ["free", "starter", "pro", "enterprise"];
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
        isRecommended: this.getRecommendation() === planId
      });
    }
    return analysis;
  }
  /**
   * Get smart recommendation
   */
  getRecommendation() {
    const current = getPlan(this.currentPlan);
    if (!current) return "free";
    if (this.monthlyRevenue >= 5e4) return "enterprise";
    if (this.monthlyRevenue >= 15e3) return "pro";
    if (this.monthlyRevenue >= 5e3) return "starter";
    return "free";
  }
  /**
   * Calculate breakeven point (when subscription pays for itself)
   */
  calculateBreakeven() {
    const plans = ["starter", "pro"];
    const results = {};
    for (const planId of plans) {
      const plan = getPlan(planId);
      if (typeof plan.monthlyPrice !== "number" || plan.monthlyPrice === 0) continue;
      const freePlan = getPlan("free");
      const commissionDifference = freePlan.commission.base - plan.commission.base;
      const breakeven = Math.ceil(plan.monthlyPrice / commissionDifference);
      results[planId] = {
        monthlyBreakeven: breakeven,
        daysToBreakeven: Math.ceil(breakeven / (this.monthlyRevenue / 30)) || 365,
        isAlreadyProfit: this.monthlyRevenue >= breakeven,
        profitIfUpgraded: Math.max(0, this.monthlyRevenue * commissionDifference - plan.monthlyPrice)
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
        type: "optimal",
        message: `Your current plan (${getPlan(this.currentPlan).name}) is perfect for your revenue level.`,
        action: "continue"
      };
    }
    const recommendedPlan = getPlan(recommendation);
    const breakevensData = breakeven[recommendation];
    if (!breakevensData) {
      return {
        type: "info",
        message: `Consider exploring ${recommendedPlan.name} for more advanced features.`,
        action: "explore"
      };
    }
    const isWorthIt = breakevensData.isAlreadyProfit || breakevensData.daysToBreakeven < 90;
    if (isWorthIt) {
      return {
        type: "wow_positive",
        message: `🎉 ${recommendedPlan.name} would PAY FOR ITSELF in ${breakevensData.daysToBreakeven} days at your current revenue!`,
        savings: breakevensData.profitIfUpgraded,
        annualSavings: breakevensData.profitIfUpgraded * 12,
        daysToBreakeven: breakevensData.daysToBreakeven,
        action: "upgrade_now"
      };
    }
    return {
      type: "info",
      message: `Upgrade to ${recommendedPlan.name} when you reach R${breakevensData.monthlyBreakeven.toLocaleString()}/month revenue.`,
      targetRevenue: breakevensData.monthlyBreakeven,
      action: "monitor"
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
        planName: getPlan(currentPlan).name
      };
      const roi = calculateMonthlyROI(currentPlan, currentRevenue);
      projection.roi = roi.monthlyROI;
      projection.savings = roi.commissionSaved;
      if (month > 0 && month % 3 === 0) {
        const recommended = this.getRecommendedPlanForRevenue(currentRevenue);
        if (recommended !== currentPlan && recommended !== "enterprise") {
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
    if (revenue >= 5e4) return "enterprise";
    if (revenue >= 15e3) return "pro";
    if (revenue >= 5e3) return "starter";
    return "free";
  }
  /**
   * Cost comparison across all plans at different revenue levels
   */
  generateComparisonTable() {
    const revenuePoints = [0, 5e3, 1e4, 15e3, 25e3, 5e4];
    const table = [];
    for (const revenue of revenuePoints) {
      const row = { revenue };
      for (const planId of ["free", "starter", "pro", "enterprise"]) {
        const plan = getPlan(planId);
        const roi = calculateMonthlyROI(planId, revenue);
        row[planId] = {
          subscription: plan.monthlyPrice,
          commission: `${(plan.commission.base * 100).toFixed(1)}%`,
          monthlyROI: roi.monthlyROI,
          savings: roi.commissionSaved
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
    const upgradePlans = ["starter", "pro", "enterprise"];
    const analysis = {};
    for (const planId of upgradePlans) {
      const plan = getPlan(planId);
      const newFeatures = this.getNewFeatures(currentPlan, plan);
      const estimatedRevenueLift = this.estimateRevenueLift(newFeatures);
      const subscriptionCost = typeof plan.monthlyPrice === "number" ? plan.monthlyPrice : 0;
      const addedValue = estimatedRevenueLift - subscriptionCost;
      analysis[planId] = {
        newFeatures: newFeatures.map((f) => f.name),
        estimatedRevenueLift: Math.round(estimatedRevenueLift),
        subscriptionCost,
        netValue: Math.round(addedValue),
        roi: addedValue > 0 ? "positive" : "neutral"
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
      advancedPricingTools: 2e3,
      customBranding: 800,
      automationRules: 300,
      // per rule
      dedicatedSupport: 1e3
    };
    for (const [feature, value] of Object.entries(featureValues)) {
      if (!currentFeatures[feature] && newFeatures[feature]) {
        differences.push({
          name: feature,
          estimatedValue: value
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
    score.revenue = this.monthlyRevenue > 1e4 ? "high" : this.monthlyRevenue > 5e3 ? "medium" : "low";
    const recommended = this.getRecommendation();
    score.planOptimization = recommended === this.currentPlan ? "optimal" : Object.keys(SUBSCRIPTION_PLANS).indexOf(recommended) > Object.keys(SUBSCRIPTION_PLANS).indexOf(this.currentPlan) ? "upgrade_ready" : "downgrade_available";
    const breakeven = this.calculateBreakeven();
    const opportunities = Object.values(breakeven).filter((b) => b.isAlreadyProfit).length;
    score.roiOpportunity = opportunities > 0 ? "high" : "monitor";
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
      growthPath: this.simulateGrowthPath()
    };
  }
}
function createROIAnalyzer(partnerId, partnerMetrics) {
  return new ROIAnalyzer(partnerId, partnerMetrics);
}
function SubscriptionSelector({
  partnerId,
  currentPlan = "free",
  monthlyRevenue = 0,
  onSelectPlan,
  showROI = true
}) {
  const [selectedPlan, setSelectedPlan] = reactExports.useState(currentPlan);
  const [billingPeriod, setBillingPeriod] = reactExports.useState("monthly");
  const [showComparison, setShowComparison] = reactExports.useState(false);
  const analysis = reactExports.useMemo(() => {
    if (!showROI || monthlyRevenue === 0) return null;
    const analyzer = createROIAnalyzer(partnerId, {
      revenue: { thisMonth: monthlyRevenue },
      subscription: { planId: currentPlan }
    });
    return {
      all: analyzer.analyzeAllPlans(),
      insight: analyzer.generateInsight(),
      breakeven: analyzer.calculateBreakeven()
    };
  }, [partnerId, monthlyRevenue, currentPlan, showROI]);
  const plans = getAllPlans();
  const planIds = ["free", "starter", "pro", "enterprise"];
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    onSelectPlan?.(planId);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-cream-50 to-white rounded-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-brand-brown mb-2", children: "Choose Your Plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Start free and upgrade as you grow. Only pay for what you use." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setBillingPeriod("monthly"),
          className: `px-6 py-3 rounded-l-lg font-medium transition ${billingPeriod === "monthly" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-700"}`,
          children: "Monthly Billing"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setBillingPeriod("annual"),
          className: `px-6 py-3 rounded-r-lg font-medium transition ${billingPeriod === "annual" ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-700"}`,
          children: "Annual (Save 20%)"
        }
      )
    ] }),
    showROI && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Your Monthly Revenue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "R" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            value: monthlyRevenue || "",
            onChange: (_e) => {
            },
            placeholder: "Enter your estimated monthly revenue",
            className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2", children: "💡 We use this to calculate your exact ROI for each plan" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: planIds.map((planId) => {
      const plan = plans[planId];
      const isCurrent = planId === currentPlan;
      const isSelected = planId === selectedPlan;
      const roi = showROI && monthlyRevenue > 0 ? calculateMonthlyROI(planId, monthlyRevenue) : null;
      const isROIPositive = roi && roi.roiPercentage > 0;
      const showWOWBadge = isROIPositive && !isCurrent;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => handlePlanSelect(planId),
          className: `relative p-6 rounded-xl border-2 cursor-pointer transition transform hover:scale-105 ${isSelected ? "border-brand-orange bg-orange-50 shadow-lg" : isCurrent ? "border-brand-brown bg-cream-50" : "border-gray-200 bg-white hover:border-brand-orange"}`,
          children: [
            isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-3 -right-3 bg-brand-brown text-white px-3 py-1 rounded-full text-xs font-bold", children: "Current" }),
            showWOWBadge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12 }),
              "WOW"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: plan.badge }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-500", children: plan.id.toUpperCase() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-brand-brown mb-2", children: plan.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: plan.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 pb-4 border-b-2 border-gray-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold text-brand-orange", children: typeof plan.monthlyPrice === "number" ? `R${plan.monthlyPrice}` : "Custom" }),
                typeof plan.monthlyPrice === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "/month" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                "Commission: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-brand-brown", children: [
                  (plan.commission.base * 100).toFixed(1),
                  "%"
                ] })
              ] })
            ] }),
            roi && monthlyRevenue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mb-4 p-3 rounded-lg ${isROIPositive ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              isROIPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "text-green-600 flex-shrink-0 mt-0.5", size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "text-gray-400 flex-shrink-0 mt-0.5", size: 16 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-gray-800", children: [
                  isROIPositive ? "💰 Saves you" : "Cost",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: isROIPositive ? "text-green-600" : "text-gray-600", children: [
                    "R",
                    Math.abs(roi.monthlyROI).toLocaleString()
                  ] }),
                  "/month"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "vs Free plan at your revenue level" })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase mb-3", children: "Key Features" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, className: "text-green-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    plan.features.listings === "unlimited" ? "Unlimited" : plan.features.listings,
                    " Listings"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, className: "text-green-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    plan.limitations.reportFrequency,
                    " Reports"
                  ] })
                ] }),
                plan.features.competitorBenchmarking && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, className: "text-green-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Competitor Insights" })
                ] }),
                plan.features.advancedPricingTools && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, className: "text-green-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Dynamic Pricing" })
                ] }),
                plan.features.dedicatedSupport !== false && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, className: "text-green-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Priority Support" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: `w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${isCurrent ? "bg-gray-200 text-gray-700 cursor-default" : isSelected ? "bg-brand-orange text-white hover:bg-orange-600" : "bg-gray-200 text-gray-700 hover:bg-brand-orange hover:text-white"}`,
                disabled: isCurrent,
                children: [
                  isCurrent ? "Current Plan" : "Select Plan",
                  !isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 })
                ]
              }
            )
          ]
        },
        planId
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setShowComparison(!showComparison),
        className: "w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition flex items-center justify-center gap-2 mb-8",
        children: [
          showComparison ? "✕ Hide" : "+ Show",
          " Detailed Comparison"
        ]
      }
    ),
    showComparison && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 bg-white rounded-xl border border-gray-200 overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left font-semibold text-gray-700", children: "Feature" }),
        planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left font-semibold text-gray-700", children: plans[planId].name }, planId))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Monthly Price" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 text-gray-600", children: typeof plans[planId].monthlyPrice === "number" ? `R${plans[planId].monthlyPrice}` : "Custom" }, planId))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 bg-orange-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Commission Rate" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-3 font-bold text-brand-orange", children: [
            (plans[planId].commission.base * 100).toFixed(1),
            "%"
          ] }, planId))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Listings" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 text-gray-600", children: plans[planId].features.listings }, planId))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Report Frequency" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 text-gray-600", children: plans[planId].limitations.reportFrequency }, planId))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Competitor Benchmarking" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3", children: plans[planId].features.competitorBenchmarking ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-green-500", size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }, planId))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Dynamic Pricing" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3", children: plans[planId].features.advancedPricingTools ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-green-500", size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }, planId))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Automation Rules" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 text-gray-600", children: plans[planId].features.automationRules }, planId))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 font-semibold text-gray-700", children: "Support" }),
          planIds.map((planId) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-3 text-gray-600 capitalize", children: typeof plans[planId].features.dedicatedSupport === "string" ? plans[planId].features.dedicatedSupport.replace(/_/g, " ") : "None" }, planId))
        ] })
      ] })
    ] }) }),
    analysis?.insight && monthlyRevenue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-6 rounded-xl border-2 ${analysis.insight.type === "wow_positive" ? "bg-green-50 border-green-300" : "bg-blue-50 border-blue-300"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl mt-1", children: analysis.insight.type === "wow_positive" ? "🎉" : "💡" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-gray-800 mb-2", children: analysis.insight.message }),
        analysis.insight.annualSavings > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Annual Savings:" }),
          " R",
          analysis.insight.annualSavings.toLocaleString()
        ] }),
        analysis.insight.targetRevenue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700 mt-1", children: [
          "Target to upgrade: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            "R",
            analysis.insight.targetRevenue.toLocaleString(),
            "/month"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function SubscriptionManagement({
  partnerId,
  currentPlan = "free",
  monthlyRevenue = 0,
  onChangePlan,
  onCancelSubscription
}) {
  const [subscription, setSubscription] = reactExports.useState(null);
  const [billingHistory, setBillingHistory] = reactExports.useState([]);
  const [_selectedUpgrade, _setSelectedUpgrade] = reactExports.useState(null);
  const [showROI, _setShowROI] = reactExports.useState(true);
  const loadSubscriptionDetails = reactExports.useCallback(() => {
    const plan = getPlan(currentPlan);
    const roi = calculateMonthlyROI(currentPlan, monthlyRevenue);
    setSubscription({
      planId: currentPlan,
      planName: plan.name,
      badge: plan.badge,
      monthlyPrice: plan.monthlyPrice,
      commission: plan.commission.base,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1e3),
      // 45 days ago
      renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3),
      // 15 days from now
      status: "active",
      roi,
      features: plan.features
    });
  }, [currentPlan, monthlyRevenue]);
  const loadBillingHistory = reactExports.useCallback(() => {
    const history = [
      {
        id: "INV_001",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
        amount: getPlan(currentPlan).monthlyPrice,
        description: `${getPlan(currentPlan).name} Subscription`,
        status: "paid"
      },
      {
        id: "INV_002",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1e3),
        amount: getPlan(currentPlan).monthlyPrice,
        description: `${getPlan(currentPlan).name} Subscription`,
        status: "paid"
      }
    ];
    setBillingHistory(history);
  }, [currentPlan]);
  reactExports.useEffect(() => {
    loadSubscriptionDetails();
    loadBillingHistory();
  }, [loadSubscriptionDetails, loadBillingHistory]);
  const handleDownloadInvoice = (invoiceId) => {
    alert(`Downloading invoice ${invoiceId}...`);
  };
  if (!subscription) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-gray-500", children: "Loading subscription details..." });
  }
  const analyzer = createROIAnalyzer(partnerId, {
    revenue: { thisMonth: monthlyRevenue },
    subscription: { planId: currentPlan }
  });
  const insight = analyzer.generateInsight();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border-2 border-brand-brown shadow-lg p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Current Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: subscription.badge }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-brand-brown", children: subscription.planName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-brand-orange mt-4", children: typeof subscription.monthlyPrice === "number" ? `R${subscription.monthlyPrice}/month` : "Custom Pricing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [
            "Commission: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-brand-brown", children: [
              (subscription.commission * 100).toFixed(1),
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:border-l md:border-gray-200 md:pl-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "text-green-500", size: 20 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-green-700", children: "Active" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Renewal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800", children: subscription.renewalDate.toLocaleDateString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-4 mb-1", children: "Active Since" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800", children: subscription.startDate.toLocaleDateString() })
        ] }),
        showROI && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 md:border md:border-green-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-3 font-semibold", children: "Your ROI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Monthly Savings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-600", children: [
                "R",
                subscription.roi.monthlyROI.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Commission Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-brand-orange", children: subscription.roi.commissionRate })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-green-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Annual Savings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-green-600", children: [
                "R",
                (subscription.roi.monthlyROI * 12).toLocaleString()
              ] })
            ] })
          ] })
        ] })
      ] }),
      insight.type === "wow_positive" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-brand-orange p-4 rounded mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🎉" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800", children: insight.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Your current plan is paying for itself and generating profit!" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-6 border-t border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onChangePlan?.(),
            className: "flex-1 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 }),
              "Change Plan"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onCancelSubscription?.(),
            className: "px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition",
            children: "Pause Subscription"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-brand-brown mb-6", children: "Your Features" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-600 uppercase mb-3", children: "Listings & Properties" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                subscription.features.listings === "unlimited" ? "Unlimited" : subscription.features.listings,
                " active listings"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                subscription.features.automationRules || 0,
                " automation rules"
              ] })
            ] }),
            subscription.features.customBranding && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Custom branding" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-600 uppercase mb-3", children: "Analytics & Insights" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Real-time analytics" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Weekly performance reports" })
            ] }),
            subscription.features.competitorBenchmarking && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Competitor benchmarking" })
            ] }),
            subscription.features.advancedPricingTools && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Dynamic pricing engine" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-brand-brown", children: "Billing History" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-8 py-4 text-left font-semibold text-gray-700", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-8 py-4 text-left font-semibold text-gray-700", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-8 py-4 text-left font-semibold text-gray-700", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-8 py-4 text-left font-semibold text-gray-700", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-8 py-4 text-left font-semibold text-gray-700", children: "Invoice" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: billingHistory.map((invoice) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 hover:bg-gray-50 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-8 py-4 text-gray-700", children: invoice.date.toLocaleDateString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-8 py-4 text-gray-700", children: invoice.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-8 py-4 font-semibold text-gray-800", children: [
            "R",
            invoice.amount.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-8 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${invoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`, children: invoice.status === "paid" ? "✓ Paid" : "Pending" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-8 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleDownloadInvoice(invoice.id),
              className: "flex items-center gap-2 text-brand-orange hover:text-orange-600 transition font-semibold",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
                "Download"
              ]
            }
          ) })
        ] }, invoice.id)) })
      ] }) }),
      billingHistory.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-gray-500", children: "No billing history yet" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown", children: "Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-brand-orange hover:text-orange-600 font-semibold transition", children: "Update" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 p-4 bg-gray-50 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "text-gray-400", size: 32 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800", children: "Visa ending in 4242" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Expires 12/25" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-blue-900 mb-4", children: "Need Help?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "• Visit our ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "underline font-semibold hover:text-blue-600", children: "subscription FAQ" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "underline font-semibold hover:text-blue-600", children: "Chat with support" }),
          " - Available 24/7"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "underline font-semibold hover:text-blue-600", children: "View pricing details" })
        ] })
      ] })
    ] })
  ] });
}
function SubscriptionTiers() {
  const [currentPlan, setCurrentPlan] = reactExports.useState("free");
  const [monthlyRevenue, setMonthlyRevenue] = reactExports.useState(1e4);
  const [activeTab, setActiveTab] = reactExports.useState("plans");
  const [partnerId] = reactExports.useState("PARTNER_001");
  const handleSelectPlan = (planId) => {
    setCurrentPlan(planId);
  };
  const handleChangePlan = () => {
    setActiveTab("plans");
  };
  const handleCancelSubscription = () => {
    alert("Subscription pause/cancel - would trigger payment flow");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-brand-brown text-white py-12 px-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold mb-4", children: "Subscription Plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-orange-100", children: "Choose the plan that fits your business. Start free, upgrade as you grow." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200 sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab("plans"),
          className: `py-4 px-2 font-semibold border-b-2 transition ${activeTab === "plans" ? "border-brand-orange text-brand-orange" : "border-transparent text-gray-600 hover:text-gray-800"}`,
          children: "Browse Plans"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab("manage"),
          className: `py-4 px-2 font-semibold border-b-2 transition ${activeTab === "manage" ? "border-brand-orange text-brand-orange" : "border-transparent text-gray-600 hover:text-gray-800"}`,
          children: "Manage Subscription"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-12", children: [
      activeTab === "plans" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-12 max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border-2 border-brand-orange shadow-lg p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-4", children: "Your Estimated Monthly Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "Help us recommend the perfect plan by entering your typical monthly revenue. We'll calculate your exact ROI." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-lg font-semibold text-gray-700", children: "R" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: monthlyRevenue,
                onChange: (e) => setMonthlyRevenue(Number(e.target.value)),
                placeholder: "Enter your monthly revenue",
                className: "flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 transition"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 text-sm", children: "/month" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-4", children: "💡 This helps us show you accurate ROI calculations for each plan. Your data is private and never shared." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SubscriptionSelector,
          {
            partnerId,
            currentPlan,
            monthlyRevenue,
            onSelectPlan: handleSelectPlan,
            showROI: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 max-w-4xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-brand-brown mb-8", children: "Frequently Asked Questions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: faqItems.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(FAQItem, { ...item }, idx)) })
        ] })
      ] }),
      activeTab === "manage" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SubscriptionManagement,
        {
          partnerId,
          currentPlan,
          monthlyRevenue,
          onChangePlan: handleChangePlan,
          onCancelSubscription: handleCancelSubscription
        }
      ) })
    ] }),
    activeTab === "plans" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-brand-brown text-white py-12 px-4 sm:px-6 mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold mb-4", children: "Ready to scale your business?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-orange-100 mb-8", children: "Join hundreds of partners already using CollEco to maximize their revenue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 justify-center flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-8 py-4 bg-white text-brand-brown font-bold rounded-lg hover:bg-gray-100 transition", children: "Start Free Trial" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-8 py-4 bg-brand-orange text-white font-bold rounded-lg hover:bg-orange-600 transition", children: "Talk to Sales" })
      ] })
    ] }) })
  ] });
}
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-left font-semibold text-gray-800", children: question }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-brand-orange transition ${isOpen ? "rotate-180" : ""}`, children: "▼" })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700", children: answer })
  ] });
}
const faqItems = [
  {
    question: "Can I change my plan anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle. If you upgrade mid-cycle, we'll prorate the difference."
  },
  {
    question: "What if my revenue drops after upgrading?",
    answer: "No problem! You can downgrade anytime. We recommend staying on the plan that matches your actual revenue, as the commission savings often outweigh the subscription cost."
  },
  {
    question: "Is there a long-term commitment?",
    answer: "No long-term contracts. All plans are month-to-month. However, Enterprise plans may include custom terms - contact our sales team for details."
  },
  {
    question: `What's the "WOW" insight about?`,
    answer: "We calculate exactly when a plan upgrade pays for itself through commission savings. If it shows green, upgrading makes financial sense immediately. Our AI recommends the optimal plan for YOUR revenue level."
  },
  {
    question: "Do you offer annual billing discounts?",
    answer: "Yes! Annual billing saves you 20% compared to monthly. You can switch to annual at any time, and we'll credit any unused time from your current month."
  },
  {
    question: "What support do I get on each plan?",
    answer: "Free: Community support. Starter: Email support. Pro: Priority email & chat. Enterprise: Dedicated account manager with 24/7 phone support."
  },
  {
    question: "How are commissions calculated?",
    answer: "Commissions are calculated as a percentage of confirmed bookings. Your commission rate depends on your subscription plan (8-20%). Bonuses apply when you hit performance targets."
  },
  {
    question: "What if I go over my plan limits?",
    answer: "Your plan scales with your business. If you exceed listing limits or need more features, we'll suggest an upgrade. No surprise charges - you stay on your current plan unless you choose to upgrade."
  }
];
export {
  SubscriptionTiers as default
};
//# sourceMappingURL=SubscriptionTiers-Bntgf2GR.js.map
