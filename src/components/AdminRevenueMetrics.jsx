import React, { useState, useEffect } from 'react';
import { BarChart3, Users, CreditCard, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { getSubscriptionAnalytics, getAllSubscriptions } from '../utils/subscriptionManager.js';
import { getCommissionAnalytics } from '../utils/commissionCalculator.js';
import { getPayoutStatistics } from '../utils/payoutsSystem.js';

/**
 * Admin Subscription & Commission Dashboard
 * Monitor revenue metrics, partner tiers, commissions, and payouts
 */
export default function AdminRevenueMetrics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [commissionData, setCommissionData] = useState(null);
  const [payoutData, setPayoutData] = useState(null);
  const [allPartners, setAllPartners] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    setSubscriptionData(getSubscriptionAnalytics());
    setCommissionData(getCommissionAnalytics());
    setPayoutData(getPayoutStatistics());
    setAllPartners(getAllSubscriptions());
  };

  if (!subscriptionData || !commissionData || !payoutData) {
    return <div className="p-6 text-center text-gray-500">Loading metrics...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-brown mb-2">Revenue Dashboard</h1>
          <p className="text-gray-600">Monitor subscriptions, commissions, and partner payouts</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={<CreditCard className="text-brand-orange" size={32} />}
            label="Monthly Recurring Revenue"
            value={`R${subscriptionData.totalMRR.toLocaleString()}`}
            change="+12%"
            trend="up"
          />
          <KPICard
            icon={<Users className="text-blue-500" size={32} />}
            label="Active Partners"
            value={subscriptionData.activePartners}
            subtitle={`${subscriptionData.totalPartners} total`}
          />
          <KPICard
            icon={<TrendingUp className="text-green-500" size={32} />}
            label="Total Commission Paid"
            value={`R${commissionData.totalCommission.toLocaleString()}`}
            subtitle={`${commissionData.totalBookings} bookings`}
          />
          <KPICard
            icon={<BarChart3 className="text-purple-500" size={32} />}
            label="Pending Payouts"
            value={`R${payoutData.totalPending.toLocaleString()}`}
            subtitle={`${payoutData.payoutsPending} partners`}
            warning={payoutData.payoutsPending > 0}
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="flex gap-8 p-6 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
              { id: 'commissions', label: 'Commissions', icon: '💰' },
              { id: 'payouts', label: 'Payouts', icon: '💸' },
              { id: 'partners', label: 'Partners', icon: '👥' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-semibold flex items-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'text-brand-orange border-b-2 border-brand-orange'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab data={{ subscriptionData, commissionData, payoutData }} />}
            {activeTab === 'subscriptions' && <SubscriptionsTab data={subscriptionData} />}
            {activeTab === 'commissions' && <CommissionsTab data={commissionData} />}
            {activeTab === 'payouts' && <PayoutsTab data={payoutData} />}
            {activeTab === 'partners' && <PartnersTab partners={allPartners} filter={filter} setFilter={setFilter} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * KPI Card Component
 */
function KPICard({ icon, label, value, subtitle, change, trend, warning }) {
  return (
    <div className={`p-6 rounded-lg border-2 ${
      warning ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
        {change && (
          <div className={`text-sm font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}

/**
 * Overview Tab
 */
function OverviewTab({ data }) {
  const { subscriptionData, commissionData, payoutData } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MRR Breakdown */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-4">MRR by Plan</h3>
          {subscriptionData.adoptionByPlan.map(tier => (
            <div key={tier.plan} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">{tier.plan}</span>
                <span className="text-gray-600">R{tier.mrr.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${(tier.mrr / subscriptionData.totalMRR * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{tier.percentage}% adoption</p>
            </div>
          ))}
        </div>

        {/* Revenue Health */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-4">Revenue Health</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Average LTV</p>
              <p className="text-2xl font-bold text-green-600">R{subscriptionData.averageLTV.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-orange-600">{(subscriptionData.churnRate * 100).toFixed(1)}%</p>
            </div>
            <div className="pt-2 border-t border-green-300">
              <p className="text-xs text-gray-600">Status: <span className="font-bold text-green-600">Healthy</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Performance */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-4">Booking Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-purple-600">{commissionData.totalBookings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Booking Value</p>
            <p className="text-2xl font-bold text-purple-600">R{(commissionData.totalBookingAmount / commissionData.totalBookings).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Commission</p>
            <p className="text-2xl font-bold text-purple-600">R{commissionData.averageCommissionPerBooking.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Subscriptions Tab
 */
function SubscriptionsTab({ data }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">Subscription Distribution</h3>
      <div className="space-y-3">
        {data.adoptionByPlan.map((tier, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-800">{tier.plan}</p>
              <p className="text-sm text-gray-600">{tier.count} partners · {tier.percentage}% adoption</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-orange">R{tier.mrr.toLocaleString()}/mo MRR</p>
              <p className="text-sm text-gray-600">LTV: R{tier.ltv.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Commissions Tab
 */
function CommissionsTab({ data }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">Top Commission Earners</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Partner ID</th>
              <th className="px-4 py-3 text-left font-semibold">Bookings</th>
              <th className="px-4 py-3 text-right font-semibold">Booking Amount</th>
              <th className="px-4 py-3 text-right font-semibold">Commission</th>
              <th className="px-4 py-3 text-right font-semibold">Avg/Booking</th>
            </tr>
          </thead>
          <tbody>
            {data.topPartners.map((partner, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{partner.partnerId.substring(0, 12)}...</td>
                <td className="px-4 py-3">{partner.transactions}</td>
                <td className="px-4 py-3 text-right">R{partner.totalBookingAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-bold text-brand-orange">R{partner.totalCommission.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-600">R{partner.averageCommissionPerBooking.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Payouts Tab
 */
function PayoutsTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Completed</p>
          <p className="text-2xl font-bold text-green-600">{data.payoutsCompleted}</p>
          <p className="text-sm text-gray-600 mt-2">R{data.totalPaidOut.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{data.payoutsPending}</p>
          <p className="text-sm text-gray-600 mt-2">R{data.totalPending.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-2">Failed</p>
          <p className="text-2xl font-bold text-red-600">{data.payoutsFailed}</p>
          <p className="text-sm text-gray-600 mt-2">R{data.totalFailed.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Average Payout</p>
          <p className="text-2xl font-bold text-blue-600">R{data.averagePayoutAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">{data.totalPayouts} total</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Partners Tab
 */
function PartnersTab({ partners, filter, setFilter }) {
  return (
    <div>
      <div className="mb-6 flex gap-4">
        {['all', 'active', 'paused', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-brand-orange text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Partner</th>
              <th className="px-4 py-3 text-left font-semibold">Plan</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">MRR</th>
              <th className="px-4 py-3 text-right font-semibold">LTV</th>
              <th className="px-4 py-3 text-right font-semibold">Months Active</th>
            </tr>
          </thead>
          <tbody>
            {partners
              .filter(p => filter === 'all' || p.status === filter)
              .map((partner, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{partner.partnerId.substring(0, 12)}...</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      partner.planId === 'free' ? 'bg-gray-200 text-gray-700' :
                      partner.planId === 'starter' ? 'bg-blue-200 text-blue-700' :
                      partner.planId === 'pro' ? 'bg-purple-200 text-purple-700' :
                      'bg-brand-orange/20 text-brand-orange'
                    }`}>
                      {partner.planName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      partner.status === 'active' ? 'bg-green-200 text-green-700' :
                      partner.status === 'paused' ? 'bg-yellow-200 text-yellow-700' :
                      'bg-red-200 text-red-700'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">R{partner.stats.monthlyRecurringRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">R{partner.stats.lifetimeValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{partner.stats.monthsSinceStart}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
