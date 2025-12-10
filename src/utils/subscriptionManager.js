/**
 * Subscription Lifecycle Manager
 * Handles all subscription state transitions, billing cycles, and persistence
 * Core of the revenue generation system
 */

import { getPlan, SUBSCRIPTION_PLANS as _SUBSCRIPTION_PLANS } from './subscriptionPlans.js';

const STORAGE_KEY = 'colleco.subscriptions';
const INVOICES_KEY = 'colleco.invoices';
const _BILLING_CYCLES_KEY = 'colleco.billing_cycles';

/**
 * Get or initialize partner subscription
 */
export function getPartnerSubscription(partnerId) {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  
  if (!subscriptions[partnerId]) {
    // Initialize with free tier
    subscriptions[partnerId] = {
      partnerId,
      planId: 'free',
      planName: 'Free',
      status: 'active',
      startDate: new Date().toISOString(),
      renewalDate: addMonths(new Date(), 1).toISOString(),
      cancelledAt: null,
      pausedAt: null,
      features: getPlan('free').features,
      commission: getPlan('free').commission,
      history: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  }
  
  return subscriptions[partnerId];
}

/**
 * Upgrade or downgrade subscription
 */
export function updateSubscription(partnerId, newPlanId, options = {}) {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const currentSub = subscriptions[partnerId] || getPartnerSubscription(partnerId);
  const newPlan = getPlan(newPlanId);
  
  if (!newPlan) throw new Error(`Invalid plan: ${newPlanId}`);
  
  const oldPlanId = currentSub.planId;
  const now = new Date();
  
  // Create transition record
  const transition = {
    from: oldPlanId,
    to: newPlanId,
    timestamp: now.toISOString(),
    reason: options.reason || 'manual_upgrade',
    prorationCredits: calculateProration(currentSub, newPlan),
  };
  
  // Update subscription
  currentSub.planId = newPlanId;
  currentSub.planName = newPlan.name;
  currentSub.features = newPlan.features;
  currentSub.commission = newPlan.commission;
  currentSub.status = 'active';
  currentSub.startDate = now.toISOString();
  currentSub.renewalDate = addMonths(now, 1).toISOString();
  currentSub.history = (currentSub.history || []).concat(transition);
  
  // If transitioning from free to paid, create first invoice
  if (oldPlanId === 'free' && typeof newPlan.monthlyPrice === 'number') {
    createInvoice(partnerId, newPlanId, newPlan.monthlyPrice, 'subscription_upgrade');
  }
  
  subscriptions[partnerId] = currentSub;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  
  return {
    success: true,
    subscription: currentSub,
    transition,
    nextBillingDate: currentSub.renewalDate,
  };
}

/**
 * Pause subscription (keep access, skip billing)
 */
export function pauseSubscription(partnerId) {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const sub = subscriptions[partnerId];
  
  if (!sub) throw new Error('Subscription not found');
  
  sub.status = 'paused';
  sub.pausedAt = new Date().toISOString();
  sub.history.push({
    event: 'paused',
    timestamp: new Date().toISOString(),
  });
  
  subscriptions[partnerId] = sub;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  
  return {
    success: true,
    message: 'Subscription paused. You can resume anytime.',
    subscription: sub,
  };
}

/**
 * Resume paused subscription
 */
export function resumeSubscription(partnerId) {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const sub = subscriptions[partnerId];
  
  if (!sub) throw new Error('Subscription not found');
  if (sub.status !== 'paused') throw new Error('Subscription is not paused');
  
  sub.status = 'active';
  sub.pausedAt = null;
  sub.renewalDate = addMonths(new Date(), 1).toISOString();
  sub.history.push({
    event: 'resumed',
    timestamp: new Date().toISOString(),
  });
  
  subscriptions[partnerId] = sub;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  
  return {
    success: true,
    message: 'Subscription resumed.',
    subscription: sub,
  };
}

/**
 * Cancel subscription
 */
export function cancelSubscription(partnerId, reason = '') {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const sub = subscriptions[partnerId];
  
  if (!sub) throw new Error('Subscription not found');
  
  sub.status = 'cancelled';
  sub.cancelledAt = new Date().toISOString();
  sub.cancelReason = reason;
  
  // Downgrade to free tier
  const freePlan = getPlan('free');
  sub.planId = 'free';
  sub.planName = freePlan.name;
  sub.features = freePlan.features;
  sub.commission = freePlan.commission;
  
  sub.history.push({
    event: 'cancelled',
    timestamp: new Date().toISOString(),
    reason,
  });
  
  subscriptions[partnerId] = sub;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  
  return {
    success: true,
    message: 'Subscription cancelled. You have been downgraded to Free tier.',
    subscription: sub,
  };
}

/**
 * Get commission rate for partner
 */
export function getCommissionRate(partnerId) {
  const sub = getPartnerSubscription(partnerId);
  return sub.commission.base;
}

/**
 * Apply commission bonus (for performance tiers)
 */
export function getEffectiveCommissionRate(partnerId, performanceMetrics = {}) {
  const sub = getPartnerSubscription(partnerId);
  let rate = sub.commission.base;
  
  // Apply bonus if metrics qualify
  if (performanceMetrics.occupancyRate > 80) {
    rate = Math.min(rate + sub.commission.bonusPercentage, sub.commission.maxCommission);
  }
  
  return rate;
}

/**
 * Create invoice
 */
export function createInvoice(partnerId, planId, amount, type = 'monthly_subscription') {
  const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || '{}');
  if (!invoices[partnerId]) invoices[partnerId] = [];
  
  const plan = getPlan(planId);
  const invoice = {
    id: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    partnerId,
    planId,
    planName: plan.name,
    amount,
    type,
    status: 'pending', // pending, paid, failed, refunded
    issuedAt: new Date().toISOString(),
    dueDate: addDays(new Date(), 14).toISOString(),
    paidAt: null,
    items: [
      {
        description: `${plan.name} Subscription`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ],
  };
  
  invoices[partnerId].push(invoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  
  return invoice;
}

/**
 * Mark invoice as paid
 */
export function markInvoicePaid(invoiceId, partnerId, paymentMethod = 'stripe') {
  const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || '{}');
  const partnerInvoices = invoices[partnerId] || [];
  const invoice = partnerInvoices.find(i => i.id === invoiceId);
  
  if (!invoice) throw new Error('Invoice not found');
  
  invoice.status = 'paid';
  invoice.paidAt = new Date().toISOString();
  invoice.paymentMethod = paymentMethod;
  
  invoices[partnerId] = partnerInvoices;
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  
  return invoice;
}

/**
 * Get billing history
 */
export function getBillingHistory(partnerId, limit = 12) {
  const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || '{}');
  const partnerInvoices = invoices[partnerId] || [];
  
  return partnerInvoices
    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
    .slice(0, limit)
    .map(inv => ({
      ...inv,
      daysOverdue: inv.status === 'pending' ? 
        Math.max(0, Math.floor((Date.now() - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24))) : 0,
    }));
}

/**
 * Check if subscription renewal is due
 */
export function isRenewalDue(partnerId) {
  const sub = getPartnerSubscription(partnerId);
  const renewalDate = new Date(sub.renewalDate);
  const today = new Date();
  
  return today >= renewalDate && sub.status === 'active' && sub.planId !== 'free';
}

/**
 * Process subscription renewal
 */
export function processRenewal(partnerId) {
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  
  if (plan.monthlyPrice === 0 || plan.monthlyPrice === 'custom') {
    // Free/Enterprise don't auto-renew
    return { success: false, reason: 'Plan does not require renewal' };
  }
  
  // Create invoice for next month
  const invoice = createInvoice(partnerId, sub.planId, plan.monthlyPrice, 'monthly_renewal');
  
  // Update renewal date
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  sub.renewalDate = addMonths(new Date(), 1).toISOString();
  subscriptions[partnerId] = sub;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  
  return {
    success: true,
    invoice,
    nextRenewalDate: sub.renewalDate,
  };
}

/**
 * Get subscription statistics for partner
 */
export function getSubscriptionStats(partnerId) {
  const sub = getPartnerSubscription(partnerId);
  const invoices = getBillingHistory(partnerId, 12);
  
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
  
  const daysSinceStart = Math.floor((Date.now() - new Date(sub.startDate)) / (1000 * 60 * 60 * 24));
  const monthsSinceStart = Math.floor(daysSinceStart / 30);
  
  return {
    partnerId,
    currentPlan: sub.planId,
    planName: sub.planName,
    status: sub.status,
    daysSinceStart,
    monthsSinceStart,
    totalPaid,
    totalInvoices: invoices.length,
    paidInvoices: paidInvoices.length,
    pendingInvoices: invoices.filter(i => i.status === 'pending').length,
    failedInvoices: invoices.filter(i => i.status === 'failed').length,
    monthlyRecurringRevenue: typeof getPlan(sub.planId).monthlyPrice === 'number' ? 
      getPlan(sub.planId).monthlyPrice : 0,
    lifetimeValue: totalPaid,
    averageMonthlySpend: totalPaid / Math.max(1, monthsSinceStart),
  };
}

/**
 * Get all subscriptions (admin view)
 */
export function getAllSubscriptions() {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return Object.values(subscriptions).map(sub => ({
    ...sub,
    stats: getSubscriptionStats(sub.partnerId),
  }));
}

/**
 * Get subscription analytics
 */
export function getSubscriptionAnalytics() {
  const allSubs = getAllSubscriptions();
  
  const byPlan = {};
  let totalMRR = 0;
  let totalLifetimeValue = 0;
  
  for (const sub of allSubs) {
    if (!byPlan[sub.planId]) {
      byPlan[sub.planId] = { count: 0, totalMRR: 0, totalLTV: 0 };
    }
    
    byPlan[sub.planId].count++;
    byPlan[sub.planId].totalMRR += sub.stats.monthlyRecurringRevenue;
    byPlan[sub.planId].totalLTV += sub.stats.lifetimeValue;
    
    totalMRR += sub.stats.monthlyRecurringRevenue;
    totalLifetimeValue += sub.stats.lifetimeValue;
  }
  
  const statusCounts = {
    active: allSubs.filter(s => s.status === 'active').length,
    paused: allSubs.filter(s => s.status === 'paused').length,
    cancelled: allSubs.filter(s => s.status === 'cancelled').length,
  };
  
  const churnRate = statusCounts.cancelled / allSubs.length || 0;
  
  return {
    totalPartners: allSubs.length,
    activePartners: statusCounts.active,
    pausedPartners: statusCounts.paused,
    cancelledPartners: statusCounts.cancelled,
    byPlan,
    totalMRR,
    totalLifetimeValue,
    averageLTV: totalLifetimeValue / allSubs.length || 0,
    churnRate,
    adoptionByPlan: Object.entries(byPlan).map(([planId, data]) => ({
      plan: getPlan(planId).name,
      count: data.count,
      percentage: (data.count / allSubs.length * 100).toFixed(1),
      mrr: data.totalMRR,
      ltv: data.totalLTV,
    })),
  };
}

// === Helper Functions ===

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateProration(currentSub, newPlan) {
  // Prorated credits for mid-month changes
  const currentPlan = getPlan(currentSub.planId);
  if (currentPlan.monthlyPrice === 0 || typeof currentPlan.monthlyPrice !== 'number') {
    return 0; // No proration for free tier
  }
  
  const renewalDate = new Date(currentSub.renewalDate);
  const today = new Date();
  const daysRemaining = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
  const daysInMonth = 30;
  
  const dailyRate = currentPlan.monthlyPrice / daysInMonth;
  const credit = dailyRate * daysRemaining;
  
  // Apply as credit toward new plan
  const newCost = newPlan.monthlyPrice - credit;
  
  return {
    oldPlanDailyRate: dailyRate,
    daysRemaining,
    creditAmount: credit,
    newPlanCost: newPlan.monthlyPrice,
    adjustedCost: Math.max(0, newCost),
  };
}
