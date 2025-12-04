import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Calendar, Download, 
  CreditCard, AlertCircle, CheckCircle, Clock,
  ArrowUpRight, Award, Percent, Banknote
} from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import { 
  getEarningsSummary, 
  getPartnerTransactions, 
  getMonthlyEarningsReport,
  getUpcomingPayoutAmount 
} from '../utils/commissionCalculator.js';
import { 
  getPayoutMethods, 
  initiatePayout, 
  getPayoutHistory 
} from '../utils/payoutsSystem.js';
import { getPartnerSubscription } from '../utils/subscriptionManager.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function PartnerEarnings() {
  const { user } = useUser();
  const partnerId = user?.id || 'demo-partner';
  
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payoutInfo, setPayoutInfo] = useState(null);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);

  useEffect(() => {
    loadData();
  }, [partnerId]);

  const loadData = () => {
    // Load earnings summary
    const earningsSummary = getEarningsSummary(partnerId);
    setSummary(earningsSummary);

    // Load subscription
    const sub = getPartnerSubscription(partnerId);
    setSubscription(sub);

    // Load recent transactions
    const txns = getPartnerTransactions(partnerId, 10);
    setTransactions(txns);

    // Load payout info
    const payout = getUpcomingPayoutAmount(partnerId);
    setPayoutInfo(payout);

    // Load payment methods
    const methods = getPayoutMethods(partnerId);
    setPayoutMethods(methods);

    // Load payout history
    const history = getPayoutHistory(partnerId, 5);
    setPayoutHistory(history);

    // Load current month report
    const report = getMonthlyEarningsReport(partnerId, 0);
    setMonthlyReport(report);
  };

  const handleRequestPayout = () => {
    if (!payoutInfo?.isReadyForPayout) {
      alert(`Minimum payout is R${payoutInfo?.minimumThreshold || 100}. Current balance: R${payoutInfo?.payoutAmount || 0}`);
      return;
    }

    if (payoutMethods.length === 0) {
      alert('Please add a payment method first');
      return;
    }

    const result = initiatePayout(partnerId);
    if (result.success) {
      alert('Payout request submitted! Expected delivery: ' + result.payout.expectedDate);
      loadData(); // Refresh data
    } else {
      alert('Error: ' + result.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCommissionRateColor = (rate) => {
    if (rate >= 15) return 'text-red-600';
    if (rate >= 12) return 'text-orange-600';
    if (rate >= 8) return 'text-green-600';
    return 'text-emerald-600';
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-brown mb-2">
            Earnings & Payouts
          </h1>
          <p className="text-brand-russty">
            Track your commission earnings, manage payouts, and optimize your subscription plan.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={DollarSign}
            label="This Month"
            value={formatCurrency(summary?.thisMonthEarned || 0)}
            trend={`+${((summary?.thisMonthEarned || 0) / (summary?.lastMonthEarned || 1) * 100 - 100).toFixed(1)}%`}
            trendUp={summary?.thisMonthEarned >= summary?.lastMonthEarned}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Available Balance"
            value={formatCurrency(payoutInfo?.payoutAmount || 0)}
            subtitle={payoutInfo?.isReadyForPayout ? 'Ready for payout' : 'Below R100 threshold'}
            highlight={payoutInfo?.isReadyForPayout}
          />
          <SummaryCard
            icon={Percent}
            label="Commission Rate"
            value={`${subscription?.currentRate || 20}%`}
            subtitle={subscription?.planName || 'Free Plan'}
            className={getCommissionRateColor(subscription?.currentRate || 20)}
          />
          <SummaryCard
            icon={Award}
            label="Total Earned (YTD)"
            value={formatCurrency(summary?.yearToDateTotal || 0)}
            subtitle={`${summary?.totalBookings || 0} bookings`}
          />
        </div>

        {/* Subscription Banner */}
        {subscription && subscription.currentRate > 12 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-brand-orange to-yellow-500 text-white rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Award className="h-6 w-6" />
                  Lower Your Commission Rate!
                </h3>
                <p className="mb-4">
                  You're currently on the <strong>{subscription.planName}</strong> plan with a {subscription.currentRate}% commission rate.
                  Upgrade to <strong>Pro</strong> (12%) or <strong>Enterprise</strong> (8%) to keep more of your earnings.
                </p>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <div className="text-sm opacity-90">Current Monthly Fee</div>
                    <div className="text-2xl font-bold">{formatCurrency(subscription.monthlyFee || 0)}</div>
                  </div>
                  <ArrowUpRight className="h-8 w-8" />
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <div className="text-sm opacity-90">Potential Savings</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(((subscription.currentRate - 8) / 100) * (summary?.thisMonthEarned || 0))}
                    </div>
                  </div>
                </div>
              </div>
              <a
                href="/subscription/manage"
                className="ml-4 bg-white text-brand-orange px-6 py-3 rounded-lg font-bold hover:bg-cream-sand transition shadow-lg hover:shadow-xl"
              >
                Upgrade Now
              </a>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-cream-border overflow-x-auto">
            {['overview', 'transactions', 'payouts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-brand-brown hover:text-brand-orange'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Monthly Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-cream-border p-6">
              <h3 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Month's Earnings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricBox label="Gross Earnings" value={formatCurrency(monthlyReport?.grossEarnings || 0)} />
                <MetricBox 
                  label="Subscription Cost" 
                  value={`-${formatCurrency(monthlyReport?.subscriptionCost || 0)}`}
                  negative
                />
                <MetricBox 
                  label="Net Earnings" 
                  value={formatCurrency(monthlyReport?.netEarnings || 0)}
                  highlight
                />
              </div>
              <div className="mt-4 pt-4 border-t border-cream-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-russty">Bookings this month:</span>
                  <span className="font-bold text-brand-brown">{monthlyReport?.bookingCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-brand-russty">Average commission per booking:</span>
                  <span className="font-bold text-brand-brown">
                    {formatCurrency((monthlyReport?.grossEarnings || 0) / (monthlyReport?.bookingCount || 1))}
                  </span>
                </div>
              </div>
            </div>

            {/* Payout Action */}
            <div className="bg-white rounded-lg shadow-sm border border-cream-border p-6">
              <h3 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Request Payout
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-brand-russty">Available for Payout</div>
                  <div className="text-3xl font-bold text-brand-brown">
                    {formatCurrency(payoutInfo?.payoutAmount || 0)}
                  </div>
                  {!payoutInfo?.isReadyForPayout && (
                    <div className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Minimum payout: R{payoutInfo?.minimumThreshold || 100}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRequestPayout}
                  disabled={!payoutInfo?.isReadyForPayout}
                  className={`px-6 py-3 rounded-lg font-bold transition shadow-md ${
                    payoutInfo?.isReadyForPayout
                      ? 'bg-brand-orange text-white hover:bg-yellow-600 hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Request Payout
                </button>
              </div>
              {payoutMethods.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900">No payment method on file</div>
                    <div className="text-sm text-amber-700">Add a bank account to receive payouts.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-sm border border-cream-border">
            <div className="p-6 border-b border-cream-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-brand-brown">Recent Transactions</h3>
              <button className="flex items-center gap-2 text-brand-orange hover:text-yellow-600 font-semibold">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream-sand">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase">Booking</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-brand-russty">
                        No transactions yet. Your earnings will appear here once bookings are confirmed.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-cream-sand/50 transition">
                        <td className="px-6 py-4 text-sm">{formatDate(txn.date)}</td>
                        <td className="px-6 py-4 text-sm font-mono text-brand-brown">{txn.bookingId}</td>
                        <td className="px-6 py-4 text-sm capitalize">{txn.bookingType}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(txn.bookingAmount)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`font-semibold ${getCommissionRateColor(txn.commissionRate)}`}>
                            {txn.commissionRate}%
                          </span>
                          {txn.bonusApplied && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              +{txn.bonusApplied}% bonus
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          +{formatCurrency(txn.commissionEarned)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={txn.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Payout History */}
            <div className="bg-white rounded-lg shadow-sm border border-cream-border">
              <div className="p-6 border-b border-cream-border">
                <h3 className="text-xl font-bold text-brand-brown">Payout History</h3>
              </div>
              <div className="divide-y divide-cream-border">
                {payoutHistory.length === 0 ? (
                  <div className="px-6 py-12 text-center text-brand-russty">
                    No payouts yet. Request your first payout when you reach R100 balance.
                  </div>
                ) : (
                  payoutHistory.map((payout) => (
                    <div key={payout.id} className="p-6 hover:bg-cream-sand/50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            payout.status === 'completed' ? 'bg-green-100' :
                            payout.status === 'failed' ? 'bg-red-100' :
                            payout.status === 'processing' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {payout.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-600" />}
                            {payout.status === 'failed' && <AlertCircle className="h-6 w-6 text-red-600" />}
                            {payout.status === 'processing' && <Clock className="h-6 w-6 text-blue-600" />}
                            {payout.status === 'pending' && <Clock className="h-6 w-6 text-gray-600" />}
                          </div>
                          <div>
                            <div className="font-bold text-brand-brown">{formatCurrency(payout.amount)}</div>
                            <div className="text-sm text-brand-russty">
                              Requested: {formatDate(payout.requestedAt)}
                            </div>
                            {payout.completedAt && (
                              <div className="text-sm text-green-700">
                                Completed: {formatDate(payout.completedAt)}
                              </div>
                            )}
                            {payout.expectedDate && payout.status === 'processing' && (
                              <div className="text-sm text-blue-700">
                                Expected: {formatDate(payout.expectedDate)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <PayoutStatusBadge status={payout.status} />
                          {payout.referenceNumber && (
                            <div className="text-xs text-brand-russty mt-1">
                              Ref: {payout.referenceNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-cream-border p-6">
              <h3 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </h3>
              {payoutMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-brand-russty mb-4">No payment methods added yet</p>
                  <button className="bg-brand-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition">
                    Add Bank Account
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {payoutMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border border-cream-border rounded-lg hover:border-brand-orange transition"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-brand-orange" />
                        <div>
                          <div className="font-semibold">{method.bankName}</div>
                          <div className="text-sm text-brand-russty">
                            ****{method.accountNumber.slice(-4)}
                          </div>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="bg-brand-orange text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function SummaryCard({ icon: Icon, label, value, subtitle, trend, trendUp, highlight, className }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${
      highlight ? 'border-brand-orange ring-2 ring-brand-orange/20' : 'border-cream-border'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${highlight ? 'text-brand-orange' : 'text-brand-brown'}`} />
        {trend && (
          <span className={`text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-sm text-brand-russty mb-1">{label}</div>
      <div className={`text-2xl font-bold ${className || 'text-brand-brown'}`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-brand-russty mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function MetricBox({ label, value, negative, highlight }) {
  return (
    <div className={`p-4 rounded-lg ${
      highlight ? 'bg-green-50 border-2 border-green-200' :
      negative ? 'bg-red-50 border border-red-200' :
      'bg-cream-sand border border-cream-border'
    }`}>
      <div className="text-sm text-brand-russty mb-1">{label}</div>
      <div className={`text-xl font-bold ${
        highlight ? 'text-green-700' :
        negative ? 'text-red-700' :
        'text-brand-brown'
      }`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${styles[status] || styles.pending}`}>
      {status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
      {status === 'pending' && <Clock className="h-3 w-3" />}
      {status === 'paid' && <CheckCircle className="h-3 w-3" />}
      {status === 'cancelled' && <AlertCircle className="h-3 w-3" />}
      {status}
    </span>
  );
}

function PayoutStatusBadge({ status }) {
  const styles = {
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
  };

  const style = styles[status] || styles.pending;

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
