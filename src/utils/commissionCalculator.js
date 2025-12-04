/**
 * Commission Calculation System
 * Calculates real-time earnings based on subscription tier
 * Integrates with booking flows to apply correct commission rate
 * Core revenue tracking for partners
 */

import { getCommissionRate, getEffectiveCommissionRate, getPartnerSubscription } from './subscriptionManager.js';
import { getPlan } from './subscriptionPlans.js';

const EARNINGS_KEY = 'colleco.partner_earnings';
const TRANSACTIONS_KEY = 'colleco.partner_transactions';

/**
 * Calculate commission for a booking
 */
export function calculateCommission(partnerId, bookingAmount, bookingType = 'accommodation', performanceMetrics = {}) {
  const baseRate = getCommissionRate(partnerId);
  const effectiveRate = getEffectiveCommissionRate(partnerId, performanceMetrics);
  
  const commission = bookingAmount * effectiveRate;
  
  return {
    bookingAmount,
    bookingType,
    baseRate,
    performanceBonus: effectiveRate - baseRate,
    effectiveRate,
    commission: Math.round(commission * 100) / 100,
    earnedAt: new Date().toISOString(),
  };
}

/**
 * Record booking transaction and apply commission
 */
export function recordBookingTransaction(partnerId, booking) {
  const { bookingId, amount, type = 'accommodation', status = 'confirmed', performanceMetrics = {} } = booking;
  
  if (status !== 'confirmed') {
    return { success: false, reason: 'Only confirmed bookings generate commission' };
  }
  
  const commission = calculateCommission(partnerId, amount, type, performanceMetrics);
  
  // Record transaction
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
  if (!transactions[partnerId]) transactions[partnerId] = [];
  
  const transaction = {
    id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    partnerId,
    bookingId,
    bookingType: type,
    bookingAmount: amount,
    ...commission,
    status: 'earned', // earned, paid, pending_payout
    recordedAt: new Date().toISOString(),
    paidOutAt: null,
  };
  
  transactions[partnerId].push(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  
  // Update earnings summary
  updateEarningsSummary(partnerId, transaction.commission);
  
  return {
    success: true,
    transaction,
    message: `Commission recorded: R${transaction.commission.toLocaleString()} earned`,
  };
}

/**
 * Update earnings summary for partner
 */
function updateEarningsSummary(partnerId, commissionAmount) {
  const earnings = JSON.parse(localStorage.getItem(EARNINGS_KEY) || '{}');
  
  if (!earnings[partnerId]) {
    earnings[partnerId] = {
      partnerId,
      totalEarned: 0,
      thisMonthEarned: 0,
      thisMonthTransactions: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthKey = `earnings_${currentMonth}`;
  
  earnings[partnerId].totalEarned += commissionAmount;
  earnings[partnerId].thisMonthEarned += commissionAmount;
  earnings[partnerId].thisMonthTransactions++;
  earnings[partnerId].lastUpdated = new Date().toISOString();
  
  // Track monthly history
  if (!earnings[partnerId][monthKey]) {
    earnings[partnerId][monthKey] = {
      month: currentMonth,
      earned: 0,
      transactions: 0,
    };
  }
  earnings[partnerId][monthKey].earned += commissionAmount;
  earnings[partnerId][partnerId][monthKey].transactions++;
  
  localStorage.setItem(EARNINGS_KEY, JSON.stringify(earnings));
}

/**
 * Get partner earnings summary
 */
export function getEarningsSummary(partnerId) {
  const earnings = JSON.parse(localStorage.getItem(EARNINGS_KEY) || '{}');
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  
  const summary = earnings[partnerId] || {
    partnerId,
    totalEarned: 0,
    thisMonthEarned: 0,
    thisMonthTransactions: 0,
  };
  
  // Calculate subscription costs
  const subscriptionCost = typeof plan.monthlyPrice === 'number' ? plan.monthlyPrice : 0;
  const netEarnings = summary.thisMonthEarned - subscriptionCost;
  
  return {
    ...summary,
    subscriptionCost,
    netEarnings: Math.max(0, netEarnings),
    commissionRate: `${(plan.commission.base * 100).toFixed(1)}%`,
    tier: plan.name,
  };
}

/**
 * Get detailed transactions for partner
 */
export function getPartnerTransactions(partnerId, limit = 50) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
  const partnerTransactions = transactions[partnerId] || [];
  
  return partnerTransactions
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    .slice(0, limit)
    .map(txn => ({
      ...txn,
      date: new Date(txn.recordedAt).toLocaleDateString(),
      displayCommission: `R${txn.commission.toLocaleString()}`,
      rateDisplay: `${(txn.effectiveRate * 100).toFixed(1)}%`,
    }));
}

/**
 * Calculate monthly earnings report
 */
export function getMonthlyEarningsReport(partnerId, monthOffset = 0) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
  const partnerTransactions = transactions[partnerId] || [];
  
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const monthStart = targetMonth.toISOString().split('T')[0].substring(0, 7);
  
  const monthTransactions = partnerTransactions.filter(txn => {
    const txnMonth = txn.recordedAt.substring(0, 7);
    return txnMonth === monthStart;
  });
  
  const totalBookingAmount = monthTransactions.reduce((sum, t) => sum + t.bookingAmount, 0);
  const totalCommission = monthTransactions.reduce((sum, t) => sum + t.commission, 0);
  
  // Group by booking type
  const byType = {};
  for (const txn of monthTransactions) {
    if (!byType[txn.bookingType]) {
      byType[txn.bookingType] = { count: 0, amount: 0, commission: 0 };
    }
    byType[txn.bookingType].count++;
    byType[txn.bookingType].amount += txn.bookingAmount;
    byType[txn.bookingType].commission += txn.commission;
  }
  
  // Calculate subscription cost for month
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  const subscriptionCost = typeof plan.monthlyPrice === 'number' ? plan.monthlyPrice : 0;
  
  return {
    month: monthStart,
    year: targetMonth.getFullYear(),
    monthName: targetMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
    transactions: monthTransactions.length,
    totalBookingAmount: Math.round(totalBookingAmount * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    byType: Object.entries(byType).map(([type, data]) => ({
      type,
      ...data,
      average: Math.round(data.amount / data.count * 100) / 100,
    })),
    subscriptionCost,
    netEarnings: Math.round((totalCommission - subscriptionCost) * 100) / 100,
    averageCommissionRate: monthTransactions.length > 0 ?
      (monthTransactions.reduce((sum, t) => sum + t.effectiveRate, 0) / monthTransactions.length * 100).toFixed(1) :
      '0',
  };
}

/**
 * Get year-to-date earnings
 */
export function getYearToDateEarnings(partnerId) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
  const partnerTransactions = transactions[partnerId] || [];
  
  const currentYear = new Date().getFullYear().toString();
  const yearTransactions = partnerTransactions.filter(t => t.recordedAt.startsWith(currentYear));
  
  const totalCommission = yearTransactions.reduce((sum, t) => sum + t.commission, 0);
  const totalBookingAmount = yearTransactions.reduce((sum, t) => sum + t.bookingAmount, 0);
  
  // Calculate subscription costs paid YTD
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  const monthlySubCost = typeof plan.monthlyPrice === 'number' ? plan.monthlyPrice : 0;
  const monthsActive = Math.ceil((Date.now() - new Date(sub.startDate)) / (1000 * 60 * 60 * 24 * 30));
  const totalSubscriptionCost = monthlySubCost * monthsActive;
  
  return {
    year: currentYear,
    transactions: yearTransactions.length,
    totalBookingAmount: Math.round(totalBookingAmount * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalSubscriptionCost: Math.round(totalSubscriptionCost * 100) / 100,
    netEarnings: Math.round((totalCommission - totalSubscriptionCost) * 100) / 100,
    averageMonthlyEarnings: Math.round((totalCommission / Math.max(1, monthsActive)) * 100) / 100,
    averageBookingValue: yearTransactions.length > 0 ?
      Math.round((totalBookingAmount / yearTransactions.length) * 100) / 100 : 0,
    averageCommissionRate: yearTransactions.length > 0 ?
      (yearTransactions.reduce((sum, t) => sum + t.effectiveRate, 0) / yearTransactions.length * 100).toFixed(1) :
      '0',
  };
}

/**
 * Get upcoming payout amount
 */
export function getUpcomingPayoutAmount(partnerId) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
  const partnerTransactions = transactions[partnerId] || [];
  
  // Unpaid transactions
  const unpaidTransactions = partnerTransactions.filter(t => t.status === 'earned');
  const totalEarned = unpaidTransactions.reduce((sum, t) => sum + t.commission, 0);
  
  // Subtract pending subscription charges
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  const pendingSubscriptionCharge = typeof plan.monthlyPrice === 'number' ? plan.monthlyPrice : 0;
  
  const payoutAmount = Math.max(0, totalEarned - pendingSubscriptionCharge);
  
  return {
    totalEarned: Math.round(totalEarned * 100) / 100,
    pendingCharges: pendingSubscriptionCharge,
    payoutAmount: Math.round(payoutAmount * 100) / 100,
    transactions: unpaidTransactions.length,
    minimumPayoutThreshold: 100, // Minimum R100 payout
    isReadyForPayout: payoutAmount >= 100,
  };
}

/**
 * Mark transactions as paid (after payout)
 */
export function markTransactionsAsPaid(partnerId, transactionIds, payoutId) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
  const partnerTransactions = transactions[partnerId] || [];
  
  for (const txn of partnerTransactions) {
    if (transactionIds.includes(txn.id)) {
      txn.status = 'paid';
      txn.paidOutAt = new Date().toISOString();
      txn.payoutId = payoutId;
    }
  }
  
  transactions[partnerId] = partnerTransactions;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  
  return {
    success: true,
    transactionsPaid: transactionIds.length,
    totalAmount: partnerTransactions
      .filter(t => transactionIds.includes(t.id))
      .reduce((sum, t) => sum + t.commission, 0),
  };
}

/**
 * Get commission analytics
 */
export function getCommissionAnalytics() {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
  
  let totalCommission = 0;
  let totalBookings = 0;
  let totalBookingAmount = 0;
  const topPartners = [];
  
  for (const [partnerId, txns] of Object.entries(transactions)) {
    const partnerTotal = txns.reduce((sum, t) => sum + t.commission, 0);
    const partnerBookingAmount = txns.reduce((sum, t) => sum + t.bookingAmount, 0);
    
    totalCommission += partnerTotal;
    totalBookings += txns.length;
    totalBookingAmount += partnerBookingAmount;
    
    topPartners.push({
      partnerId,
      transactions: txns.length,
      totalCommission: Math.round(partnerTotal * 100) / 100,
      totalBookingAmount: Math.round(partnerBookingAmount * 100) / 100,
      averageCommissionPerBooking: Math.round((partnerTotal / txns.length) * 100) / 100,
    });
  }
  
  topPartners.sort((a, b) => b.totalCommission - a.totalCommission);
  
  return {
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalBookings,
    totalBookingAmount: Math.round(totalBookingAmount * 100) / 100,
    averageCommissionPerBooking: totalBookings > 0 ?
      Math.round((totalCommission / totalBookings) * 100) / 100 : 0,
    activePartners: Object.keys(transactions).length,
    topPartners: topPartners.slice(0, 10),
  };
}
