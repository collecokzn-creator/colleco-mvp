import React, { useState } from 'react';
import SubscriptionSelector from '../components/SubscriptionSelector.jsx';
import SubscriptionManagement from '../components/SubscriptionManagement.jsx';

/**
 * Subscription Tiers Page
 * Complete subscription management interface with intelligent ROI recommendations
 */
export default function SubscriptionTiers() {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'manage'
  const [partnerId] = useState('PARTNER_001'); // In real app, get from auth

  const handleSelectPlan = (planId) => {
    // In real app, initiate payment flow
    setCurrentPlan(planId);
  };

  const handleChangePlan = () => {
    setActiveTab('plans');
  };

  const handleCancelSubscription = () => {
    // In real app, trigger cancel flow with confirmation
    alert('Subscription pause/cancel - would trigger payment flow');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      {/* Header */}
      <div className="bg-brand-brown text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-lg text-orange-100">
            Choose the plan that fits your business. Start free, upgrade as you grow.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === 'plans'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Browse Plans
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === 'manage'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {activeTab === 'plans' && (
          <div>
            {/* Revenue Input Section */}
            <div className="mb-12 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border-2 border-brand-orange shadow-lg p-8">
                <h2 className="text-2xl font-bold text-brand-brown mb-4">
                  Your Estimated Monthly Revenue
                </h2>
                <p className="text-gray-600 mb-6">
                  Help us recommend the perfect plan by entering your typical monthly revenue. We'll calculate your exact ROI.
                </p>
                
                <div className="flex items-center gap-4">
                  <label className="text-lg font-semibold text-gray-700">R</label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    placeholder="Enter your monthly revenue"
                    className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 transition"
                  />
                  <span className="text-gray-600 text-sm">/month</span>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  💡 This helps us show you accurate ROI calculations for each plan. Your data is private and never shared.
                </p>
              </div>
            </div>

            {/* Plan Selector */}
            <SubscriptionSelector
              partnerId={partnerId}
              currentPlan={currentPlan}
              monthlyRevenue={monthlyRevenue}
              onSelectPlan={handleSelectPlan}
              showROI={true}
            />

            {/* FAQ Section */}
            <div className="mt-16 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-brand-brown mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {faqItems.map((item, idx) => (
                  <FAQItem key={idx} {...item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <SubscriptionManagement
              partnerId={partnerId}
              currentPlan={currentPlan}
              monthlyRevenue={monthlyRevenue}
              onChangePlan={handleChangePlan}
              onCancelSubscription={handleCancelSubscription}
            />
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {activeTab === 'plans' && (
        <div className="bg-brand-brown text-white py-12 px-4 sm:px-6 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to scale your business?</h2>
            <p className="text-lg text-orange-100 mb-8">
              Join hundreds of partners already using CollEco to maximize their revenue
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="px-8 py-4 bg-white text-brand-brown font-bold rounded-lg hover:bg-gray-100 transition">
                Start Free Trial
              </button>
              <button className="px-8 py-4 bg-brand-orange text-white font-bold rounded-lg hover:bg-orange-600 transition">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * FAQ Item Component
 */
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <h3 className="text-left font-semibold text-gray-800">{question}</h3>
        <span className={`text-brand-orange transition ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
          {answer}
        </div>
      )}
    </div>
  );
}

/**
 * FAQ Items
 */
const faqItems = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle. If you upgrade mid-cycle, we\'ll prorate the difference.',
  },
  {
    question: 'What if my revenue drops after upgrading?',
    answer: 'No problem! You can downgrade anytime. We recommend staying on the plan that matches your actual revenue, as the commission savings often outweigh the subscription cost.',
  },
  {
    question: 'Is there a long-term commitment?',
    answer: 'No long-term contracts. All plans are month-to-month. However, Enterprise plans may include custom terms - contact our sales team for details.',
  },
  {
    question: 'What\'s the "WOW" insight about?',
    answer: 'We calculate exactly when a plan upgrade pays for itself through commission savings. If it shows green, upgrading makes financial sense immediately. Our AI recommends the optimal plan for YOUR revenue level.',
  },
  {
    question: 'Do you offer annual billing discounts?',
    answer: 'Yes! Annual billing saves you 20% compared to monthly. You can switch to annual at any time, and we\'ll credit any unused time from your current month.',
  },
  {
    question: 'What support do I get on each plan?',
    answer: 'Free: Community support. Starter: Email support. Pro: Priority email & chat. Enterprise: Dedicated account manager with 24/7 phone support.',
  },
  {
    question: 'How are commissions calculated?',
    answer: 'Commissions are calculated as a percentage of confirmed bookings. Your commission rate depends on your subscription plan (8-20%). Bonuses apply when you hit performance targets.',
  },
  {
    question: 'What if I go over my plan limits?',
    answer: 'Your plan scales with your business. If you exceed listing limits or need more features, we\'ll suggest an upgrade. No surprise charges - you stay on your current plan unless you choose to upgrade.',
  },
];
