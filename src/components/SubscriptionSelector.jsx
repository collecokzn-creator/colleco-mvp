import React, { useState, useMemo } from 'react';
import { ChevronRight, Check, TrendingUp, AlertCircle, Star, Crown as _Crown, Zap as _Zap } from 'lucide-react';
import { getAllPlans, calculateMonthlyROI } from '../utils/subscriptionPlans.js';
import { createROIAnalyzer } from '../utils/subscriptionAnalytics.js';

/**
 * Subscription Selector Component
 * Shows tier comparison with intelligent ROI highlighting
 * This is where the "WoW" moment happens - partners see exactly when they save money
 */
export default function SubscriptionSelector({ 
  partnerId, 
  currentPlan = 'free', 
  monthlyRevenue = 0, 
  onSelectPlan,
  showROI = true 
}) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);

  // Generate ROI analysis
  const analysis = useMemo(() => {
    if (!showROI || monthlyRevenue === 0) return null;
    
    const analyzer = createROIAnalyzer(partnerId, {
      revenue: { thisMonth: monthlyRevenue },
      subscription: { planId: currentPlan },
    });
    
    return {
      all: analyzer.analyzeAllPlans(),
      insight: analyzer.generateInsight(),
      breakeven: analyzer.calculateBreakeven(),
    };
  }, [partnerId, monthlyRevenue, currentPlan, showROI]);

  const plans = getAllPlans();
  const planIds = ['free', 'starter', 'pro', 'enterprise'];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    onSelectPlan?.(planId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-cream-50 to-white rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-brand-brown mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">
          Start free and upgrade as you grow. Only pay for what you use.
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center mb-8">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`px-6 py-3 rounded-l-lg font-medium transition ${
            billingPeriod === 'monthly'
              ? 'bg-brand-orange text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Monthly Billing
        </button>
        <button
          onClick={() => setBillingPeriod('annual')}
          className={`px-6 py-3 rounded-r-lg font-medium transition ${
            billingPeriod === 'annual'
              ? 'bg-brand-orange text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Annual (Save 20%)
        </button>
      </div>

      {/* Revenue Input (for ROI calculation) */}
      {showROI && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Monthly Revenue
          </label>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">R</span>
            <input
              type="number"
              value={monthlyRevenue || ''}
              onChange={(_e) => {
                // Note: In real implementation, pass to parent via callback
              }}
              placeholder="Enter your estimated monthly revenue"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 We use this to calculate your exact ROI for each plan
          </p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {planIds.map((planId) => {
          const plan = plans[planId];
          const isCurrent = planId === currentPlan;
          const isSelected = planId === selectedPlan;
          const roi = showROI && monthlyRevenue > 0 ? calculateMonthlyROI(planId, monthlyRevenue) : null;
          
          // Check if this plan ROI is positive
          const isROIPositive = roi && roi.roiPercentage > 0;
          const showWOWBadge = isROIPositive && !isCurrent;

          return (
            <div
              key={planId}
              onClick={() => handlePlanSelect(planId)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition transform hover:scale-105 ${
                isSelected
                  ? 'border-brand-orange bg-orange-50 shadow-lg'
                  : isCurrent
                  ? 'border-brand-brown bg-cream-50'
                  : 'border-gray-200 bg-white hover:border-brand-orange'
              }`}
            >
              {/* Current Badge */}
              {isCurrent && (
                <div className="absolute -top-3 -right-3 bg-brand-brown text-white px-3 py-1 rounded-full text-xs font-bold">
                  Current
                </div>
              )}

              {/* WOW Badge - The magic moment! */}
              {showWOWBadge && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                  <Star size={12} />
                  WOW
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{plan.badge}</span>
                  <span className="text-sm font-semibold text-gray-500">{plan.id.toUpperCase()}</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-brown mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="mb-4 pb-4 border-b-2 border-gray-100">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-brand-orange">
                    {typeof plan.monthlyPrice === 'number' ? `R${plan.monthlyPrice}` : 'Custom'}
                  </span>
                  {typeof plan.monthlyPrice === 'number' && (
                    <span className="text-gray-600">/month</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Commission: <span className="font-bold text-brand-brown">
                    {(plan.commission.base * 100).toFixed(1)}%
                  </span>
                </p>
              </div>

              {/* ROI Highlight - The "WOW" moment explanation */}
              {roi && monthlyRevenue > 0 && (
                <div className={`mb-4 p-3 rounded-lg ${
                  isROIPositive
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {isROIPositive ? (
                      <TrendingUp className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    ) : (
                      <AlertCircle className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">
                        {isROIPositive ? '💰 Saves you' : 'Cost'} <span className={isROIPositive ? 'text-green-600' : 'text-gray-600'}>
                          R{Math.abs(roi.monthlyROI).toLocaleString()}
                        </span>/month
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        vs Free plan at your revenue level
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Key Features</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500" />
                    <span>{plan.features.listings === 'unlimited' ? 'Unlimited' : plan.features.listings} Listings</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500" />
                    <span>{plan.limitations.reportFrequency} Reports</span>
                  </li>
                  {plan.features.competitorBenchmarking && (
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-500" />
                      <span>Competitor Insights</span>
                    </li>
                  )}
                  {plan.features.advancedPricingTools && (
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-500" />
                      <span>Dynamic Pricing</span>
                    </li>
                  )}
                  {plan.features.dedicatedSupport !== false && (
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-500" />
                      <span>Priority Support</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-gray-200 text-gray-700 cursor-default'
                    : isSelected
                    ? 'bg-brand-orange text-white hover:bg-orange-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-brand-orange hover:text-white'
                }`}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
                {!isCurrent && <ChevronRight size={18} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Detailed Comparison */}
      <button
        onClick={() => setShowComparison(!showComparison)}
        className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition flex items-center justify-center gap-2 mb-8"
      >
        {showComparison ? '✕ Hide' : '+ Show'} Detailed Comparison
      </button>

      {showComparison && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Feature</th>
                {planIds.map(planId => (
                  <th key={planId} className="px-6 py-3 text-left font-semibold text-gray-700">
                    {plans[planId].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-3 font-semibold text-gray-700">Monthly Price</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3 text-gray-600">
                    {typeof plans[planId].monthlyPrice === 'number' ? `R${plans[planId].monthlyPrice}` : 'Custom'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 bg-orange-50">
                <td className="px-6 py-3 font-semibold text-gray-700">Commission Rate</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3 font-bold text-brand-orange">
                    {(plans[planId].commission.base * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-3 font-semibold text-gray-700">Listings</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3 text-gray-600">
                    {plans[planId].features.listings}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-3 font-semibold text-gray-700">Report Frequency</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3 text-gray-600">
                    {plans[planId].limitations.reportFrequency}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-3 font-semibold text-gray-700">Competitor Benchmarking</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3">
                    {plans[planId].features.competitorBenchmarking ? (
                      <Check className="text-green-500" size={20} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-3 font-semibold text-gray-700">Dynamic Pricing</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3">
                    {plans[planId].features.advancedPricingTools ? (
                      <Check className="text-green-500" size={20} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-3 font-semibold text-gray-700">Automation Rules</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3 text-gray-600">
                    {plans[planId].features.automationRules}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 font-semibold text-gray-700">Support</td>
                {planIds.map(planId => (
                  <td key={planId} className="px-6 py-3 text-gray-600 capitalize">
                    {typeof plans[planId].features.dedicatedSupport === 'string' 
                      ? plans[planId].features.dedicatedSupport.replace(/_/g, ' ')
                      : 'None'
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Insight Card */}
      {analysis?.insight && monthlyRevenue > 0 && (
        <div className={`p-6 rounded-xl border-2 ${
          analysis.insight.type === 'wow_positive'
            ? 'bg-green-50 border-green-300'
            : 'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-start gap-4">
            <div className="text-3xl mt-1">
              {analysis.insight.type === 'wow_positive' ? '🎉' : '💡'}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">{analysis.insight.message}</h4>
              {analysis.insight.annualSavings > 0 && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Annual Savings:</span> R{analysis.insight.annualSavings.toLocaleString()}
                </p>
              )}
              {analysis.insight.targetRevenue && (
                <p className="text-sm text-gray-700 mt-1">
                  Target to upgrade: <span className="font-semibold">R{analysis.insight.targetRevenue.toLocaleString()}/month</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
