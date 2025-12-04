/**
 * Payouts System
 * Manages partner payouts and payment distribution
 * Calculates net earnings after subscription costs
 */

import { getPartnerTransactions, getUpcomingPayoutAmount, markTransactionsAsPaid } from './commissionCalculator.js';
import { getPartnerSubscription } from './subscriptionManager.js';

const PAYOUTS_KEY = 'colleco.payouts';
const PAYOUT_METHODS_KEY = 'colleco.payout_methods';

/**
 * Add payout method for partner
 */
export function addPayoutMethod(partnerId, method) {
  const { type, bankAccount, accountHolder, bankName } = method;
  
  if (type === 'bank_transfer') {
    if (!bankAccount || !accountHolder || !bankName) {
      throw new Error('Bank transfer requires account details');
    }
  }
  
  const methods = JSON.parse(localStorage.getItem(PAYOUT_METHODS_KEY) || '{}');
  if (!methods[partnerId]) methods[partnerId] = [];
  
  const payoutMethod = {
    id: `METHOD_${Date.now()}`,
    ...method,
    verified: false,
    addedAt: new Date().toISOString(),
    // In production, would require verification
    verifiedAt: type === 'bank_transfer' ? null : new Date().toISOString(),
  };
  
  methods[partnerId].push(payoutMethod);
  localStorage.setItem(PAYOUT_METHODS_KEY, JSON.stringify(methods));
  
  return payoutMethod;
}

/**
 * Get payout methods for partner
 */
export function getPayoutMethods(partnerId) {
  const methods = JSON.parse(localStorage.getItem(PAYOUT_METHODS_KEY) || '{}');
  return methods[partnerId] || [];
}

/**
 * Set default payout method
 */
export function setDefaultPayoutMethod(partnerId, methodId) {
  const methods = JSON.parse(localStorage.getItem(PAYOUT_METHODS_KEY) || '{}');
  const partnerMethods = methods[partnerId] || [];
  
  for (const method of partnerMethods) {
    method.isDefault = method.id === methodId;
  }
  
  methods[partnerId] = partnerMethods;
  localStorage.setItem(PAYOUT_METHODS_KEY, JSON.stringify(methods));
  
  return partnerMethods.find(m => m.isDefault);
}

/**
 * Get default payout method
 */
export function getDefaultPayoutMethod(partnerId) {
  const methods = getPayoutMethods(partnerId);
  return methods.find(m => m.isDefault) || methods[0] || null;
}

/**
 * Initiate payout for partner
 */
export function initiatePayout(partnerId, options = {}) {
  const payoutData = getUpcomingPayoutAmount(partnerId);
  
  if (payoutData.payoutAmount < payoutData.minimumPayoutThreshold) {
    return {
      success: false,
      reason: `Minimum payout threshold is R${payoutData.minimumPayoutThreshold}. Current amount: R${payoutData.payoutAmount}`,
      current: payoutData.payoutAmount,
      threshold: payoutData.minimumPayoutThreshold,
    };
  }
  
  const payoutMethod = options.methodId ? 
    getPayoutMethods(partnerId).find(m => m.id === options.methodId) :
    getDefaultPayoutMethod(partnerId);
  
  if (!payoutMethod) {
    return {
      success: false,
      reason: 'No payout method configured. Please add a bank account or payment method.',
    };
  }
  
  // Create payout record
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '{}');
  if (!payouts[partnerId]) payouts[partnerId] = [];
  
  const transactions = JSON.parse(localStorage.getItem('colleco.partner_transactions') || '{}');
  const unpaidTransactionIds = (transactions[partnerId] || [])
    .filter(t => t.status === 'earned')
    .map(t => t.id);
  
  const payout = {
    id: `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    partnerId,
    amount: payoutData.payoutAmount,
    grossAmount: payoutData.totalEarned,
    subscriptionDeduction: payoutData.pendingCharges,
    transactionCount: unpaidTransactionIds.length,
    transactionIds: unpaidTransactionIds,
    payoutMethod,
    status: 'pending', // pending, processing, completed, failed
    requestedAt: new Date().toISOString(),
    processedAt: null,
    completedAt: null,
    reference: null,
  };
  
  payouts[partnerId].push(payout);
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
  
  return {
    success: true,
    payout,
    estimatedDelivery: addBusinessDays(new Date(), 2).toISOString(),
  };
}

/**
 * Get payout history
 */
export function getPayoutHistory(partnerId, limit = 12) {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '{}');
  const partnerPayouts = payouts[partnerId] || [];
  
  return partnerPayouts
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
    .slice(0, limit)
    .map(p => ({
      ...p,
      statusDisplay: getPayoutStatusDisplay(p.status),
      estimatedDelivery: p.status === 'completed' ?
        p.completedAt :
        addBusinessDays(new Date(p.requestedAt), 2).toISOString(),
    }));
}

/**
 * Get payout by ID
 */
export function getPayout(payoutId, partnerId) {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '{}');
  const partnerPayouts = payouts[partnerId] || [];
  
  return partnerPayouts.find(p => p.id === payoutId) || null;
}

/**
 * Process payout (mark as completed)
 */
export function completePayout(payoutId, partnerId, reference = '') {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '{}');
  const partnerPayouts = payouts[partnerId] || [];
  
  const payout = partnerPayouts.find(p => p.id === payoutId);
  if (!payout) throw new Error('Payout not found');
  
  payout.status = 'completed';
  payout.completedAt = new Date().toISOString();
  payout.reference = reference;
  
  // Mark transactions as paid
  markTransactionsAsPaid(partnerId, payout.transactionIds, payoutId);
  
  payouts[partnerId] = partnerPayouts;
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
  
  return payout;
}

/**
 * Fail payout with reason
 */
export function failPayout(payoutId, partnerId, reason = '') {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '{}');
  const partnerPayouts = payouts[partnerId] || [];
  
  const payout = partnerPayouts.find(p => p.id === payoutId);
  if (!payout) throw new Error('Payout not found');
  
  payout.status = 'failed';
  payout.failureReason = reason;
  payout.failedAt = new Date().toISOString();
  
  // Transactions remain as earned, can retry
  
  payouts[partnerId] = partnerPayouts;
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
  
  return payout;
}

/**
 * Get payout summary
 */
export function getPayoutSummary(partnerId) {
  const payouts = getPayoutHistory(partnerId, 100); // All time
  
  const completed = payouts.filter(p => p.status === 'completed');
  const pending = payouts.filter(p => p.status === 'pending');
  const failed = payouts.filter(p => p.status === 'failed');
  
  const totalPaidOut = completed.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    partnerId,
    totalPaidOut: Math.round(totalPaidOut * 100) / 100,
    pendingPayouts: pending.length,
    pendingAmount: Math.round(pendingAmount * 100) / 100,
    completedPayouts: completed.length,
    failedPayouts: failed.length,
    averagePayoutAmount: completed.length > 0 ?
      Math.round((totalPaidOut / completed.length) * 100) / 100 : 0,
    lastPayoutDate: completed.length > 0 ? completed[0].completedAt : null,
  };
}

/**
 * Get payout statistics (admin view)
 */
export function getPayoutStatistics() {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '{}');
  
  let totalPayedOut = 0;
  let totalPending = 0;
  let totalFailed = 0;
  let payoutsCompleted = 0;
  let payoutsPending = 0;
  let payoutsFailed = 0;
  
  for (const partnerPayouts of Object.values(payouts)) {
    for (const p of partnerPayouts) {
      if (p.status === 'completed') {
        totalPayedOut += p.amount;
        payoutsCompleted++;
      } else if (p.status === 'pending') {
        totalPending += p.amount;
        payoutsPending++;
      } else if (p.status === 'failed') {
        totalFailed += p.amount;
        payoutsFailed++;
      }
    }
  }
  
  return {
    totalPaidOut: Math.round(totalPayedOut * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
    totalFailed: Math.round(totalFailed * 100) / 100,
    payoutsCompleted,
    payoutsPending,
    payoutsFailed,
    totalPayouts: payoutsCompleted + payoutsPending + payoutsFailed,
    averagePayoutAmount: (payoutsCompleted > 0) ?
      Math.round((totalPayedOut / payoutsCompleted) * 100) / 100 : 0,
  };
}

/**
 * Generate payout report
 */
export function generatePayoutReport(startDate, endDate) {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '{}');
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filtered = [];
  
  for (const [partnerId, partnerPayouts] of Object.entries(payouts)) {
    for (const payout of partnerPayouts) {
      const payoutDate = new Date(payout.completedAt || payout.requestedAt);
      if (payoutDate >= start && payoutDate <= end) {
        filtered.push({ ...payout, partnerId });
      }
    }
  }
  
  const byStatus = {
    completed: filtered.filter(p => p.status === 'completed'),
    pending: filtered.filter(p => p.status === 'pending'),
    failed: filtered.filter(p => p.status === 'failed'),
  };
  
  const totalAmount = byStatus.completed.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    reportPeriod: { start: startDate, end: endDate },
    totalPayouts: filtered.length,
    totalAmount: Math.round(totalAmount * 100) / 100,
    byStatus: {
      completed: {
        count: byStatus.completed.length,
        amount: Math.round(byStatus.completed.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      },
      pending: {
        count: byStatus.pending.length,
        amount: Math.round(byStatus.pending.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      },
      failed: {
        count: byStatus.failed.length,
        amount: Math.round(byStatus.failed.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      },
    },
    payouts: filtered.sort((a, b) => new Date(b.completedAt || b.requestedAt) - new Date(a.completedAt || a.requestedAt)),
  };
}

// === Helper Functions ===

function addBusinessDays(date, days) {
  const result = new Date(date);
  let count = 0;
  
  while (count < days) {
    result.setDate(result.getDate() + 1);
    // Skip weekends
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      count++;
    }
  }
  
  return result;
}

function getPayoutStatusDisplay(status) {
  const displays = {
    pending: '⏳ Processing',
    processing: '🔄 In Progress',
    completed: '✅ Completed',
    failed: '❌ Failed',
  };
  return displays[status] || status;
}
