import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Download, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getPlan, calculateMonthlyROI } from '../utils/subscriptionPlans.js';
import { createROIAnalyzer } from '../utils/subscriptionAnalytics.js';

/**
 * Subscription Management Component
 * Display current subscription, billing history, and change plan
 */
export default function SubscriptionManagement({
  partnerId,
  currentPlan = 'free',
  monthlyRevenue = 0,
  onChangePlan,
  onCancelSubscription,
}) {
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [_selectedUpgrade, _setSelectedUpgrade] = useState(null);
  const [showROI, _setShowROI] = useState(true);

  const loadSubscriptionDetails = useCallback(() => {
    const plan = getPlan(currentPlan);
    const roi = calculateMonthlyROI(currentPlan, monthlyRevenue);
    
    setSubscription({
      planId: currentPlan,
      planName: plan.name,
      badge: plan.badge,
      monthlyPrice: plan.monthlyPrice,
      commission: plan.commission.base,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'active',
      roi,
      features: plan.features,
    });
  }, [currentPlan, monthlyRevenue]);

  const loadBillingHistory = useCallback(() => {
    // Mock billing history
    const history = [
      {
        id: 'INV_001',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        amount: getPlan(currentPlan).monthlyPrice,
        description: `${getPlan(currentPlan).name} Subscription`,
        status: 'paid',
      },
      {
        id: 'INV_002',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        amount: getPlan(currentPlan).monthlyPrice,
        description: `${getPlan(currentPlan).name} Subscription`,
        status: 'paid',
      },
    ];
    setBillingHistory(history);
  }, [currentPlan]);

  useEffect(() => {
    loadSubscriptionDetails();
    loadBillingHistory();
  }, [loadSubscriptionDetails, loadBillingHistory]);

  

  const handleDownloadInvoice = (invoiceId) => {
    // In real app, trigger invoice download
    alert(`Downloading invoice ${invoiceId}...`);
  };

  if (!subscription) {
    return <div className="p-6 text-center text-gray-500">Loading subscription details...</div>;
  }

  const analyzer = createROIAnalyzer(partnerId, {
    revenue: { thisMonth: monthlyRevenue },
    subscription: { planId: currentPlan },
  });

  const insight = analyzer.generateInsight();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Current Subscription Card */}
      <div className="bg-white rounded-xl border-2 border-brand-brown shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Plan Info */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Plan</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl">{subscription.badge}</span>
              <h2 className="text-3xl font-bold text-brand-brown">{subscription.planName}</h2>
            </div>
            <p className="text-lg font-semibold text-brand-orange mt-4">
              {typeof subscription.monthlyPrice === 'number' 
                ? `R${subscription.monthlyPrice}/month`
                : 'Custom Pricing'
              }
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Commission: <span className="font-bold text-brand-brown">{(subscription.commission * 100).toFixed(1)}%</span>
            </p>
          </div>

          {/* Status Info */}
          <div className="md:border-l md:border-gray-200 md:pl-8">
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-500" size={20} />
              <span className="font-semibold text-green-700">Active</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">Renewal Date</p>
            <p className="font-semibold text-gray-800">
              {subscription.renewalDate.toLocaleDateString()}
            </p>
            
            <p className="text-sm text-gray-600 mt-4 mb-1">Active Since</p>
            <p className="font-semibold text-gray-800">
              {subscription.startDate.toLocaleDateString()}
            </p>
          </div>

          {/* ROI Summary */}
          {showROI && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 md:border md:border-green-200">
              <p className="text-sm text-gray-600 mb-3 font-semibold">Your ROI</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    R{subscription.roi.monthlyROI.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Commission Rate</p>
                  <p className="text-lg font-bold text-brand-orange">
                    {subscription.roi.commissionRate}
                  </p>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <p className="text-xs text-gray-600">Annual Savings</p>
                  <p className="text-lg font-bold text-green-600">
                    R{(subscription.roi.monthlyROI * 12).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Insight */}
        {insight.type === 'wow_positive' && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-brand-orange p-4 rounded mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-gray-800">{insight.message}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your current plan is paying for itself and generating profit!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => onChangePlan?.()}
            className="flex-1 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <ChevronRight size={18} />
            Change Plan
          </button>
          <button
            onClick={() => onCancelSubscription?.()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Pause Subscription
          </button>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-brand-brown mb-6">Your Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase mb-3">Listings & Properties</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>
                  {subscription.features.listings === 'unlimited' ? 'Unlimited' : subscription.features.listings} active listings
                </span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>{subscription.features.automationRules || 0} automation rules</span>
              </li>
              {subscription.features.customBranding && (
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Custom branding</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase mb-3">Analytics & Insights</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>Real-time analytics</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>Weekly performance reports</span>
              </li>
              {subscription.features.competitorBenchmarking && (
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Competitor benchmarking</span>
                </li>
              )}
              {subscription.features.advancedPricingTools && (
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Dynamic pricing engine</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-brand-brown">Billing History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-8 py-4 text-left font-semibold text-gray-700">Date</th>
                <th className="px-8 py-4 text-left font-semibold text-gray-700">Description</th>
                <th className="px-8 py-4 text-left font-semibold text-gray-700">Amount</th>
                <th className="px-8 py-4 text-left font-semibold text-gray-700">Status</th>
                <th className="px-8 py-4 text-left font-semibold text-gray-700">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-8 py-4 text-gray-700">
                    {invoice.date.toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4 text-gray-700">{invoice.description}</td>
                  <td className="px-8 py-4 font-semibold text-gray-800">
                    R{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {invoice.status === 'paid' ? '✓ Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="flex items-center gap-2 text-brand-orange hover:text-orange-600 transition font-semibold"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {billingHistory.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No billing history yet
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-brand-brown">Payment Method</h3>
          <button className="text-brand-orange hover:text-orange-600 font-semibold transition">
            Update
          </button>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <CreditCard className="text-gray-400" size={32} />
          <div>
            <p className="font-semibold text-gray-800">Visa ending in 4242</p>
            <p className="text-sm text-gray-600">Expires 12/25</p>
          </div>
        </div>
      </div>

      {/* FAQ / Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Need Help?</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Visit our <a href="#" className="underline font-semibold hover:text-blue-600">subscription FAQ</a></li>
          <li>• <a href="#" className="underline font-semibold hover:text-blue-600">Chat with support</a> - Available 24/7</li>
          <li>• <a href="#" className="underline font-semibold hover:text-blue-600">View pricing details</a></li>
        </ul>
      </div>
    </div>
  );
}
