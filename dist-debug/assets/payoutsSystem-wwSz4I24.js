import { g as getPlan } from "./subscriptionPlans-rkZPWK28.js";
const STORAGE_KEY = "colleco.subscriptions";
const INVOICES_KEY = "colleco.invoices";
function getPartnerSubscription(partnerId) {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!subscriptions[partnerId]) {
    subscriptions[partnerId] = {
      partnerId,
      planId: "free",
      planName: "Free",
      status: "active",
      startDate: (/* @__PURE__ */ new Date()).toISOString(),
      renewalDate: addMonths(/* @__PURE__ */ new Date(), 1).toISOString(),
      cancelledAt: null,
      pausedAt: null,
      features: getPlan("free").features,
      commission: getPlan("free").commission,
      history: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  }
  return subscriptions[partnerId];
}
function getBillingHistory(partnerId, limit = 12) {
  const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || "{}");
  const partnerInvoices = invoices[partnerId] || [];
  return partnerInvoices.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)).slice(0, limit).map((inv) => ({
    ...inv,
    daysOverdue: inv.status === "pending" ? Math.max(0, Math.floor((Date.now() - new Date(inv.dueDate)) / (1e3 * 60 * 60 * 24))) : 0
  }));
}
function getSubscriptionStats(partnerId) {
  const sub = getPartnerSubscription(partnerId);
  const invoices = getBillingHistory(partnerId, 12);
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
  const daysSinceStart = Math.floor((Date.now() - new Date(sub.startDate)) / (1e3 * 60 * 60 * 24));
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
    pendingInvoices: invoices.filter((i) => i.status === "pending").length,
    failedInvoices: invoices.filter((i) => i.status === "failed").length,
    monthlyRecurringRevenue: typeof getPlan(sub.planId).monthlyPrice === "number" ? getPlan(sub.planId).monthlyPrice : 0,
    lifetimeValue: totalPaid,
    averageMonthlySpend: totalPaid / Math.max(1, monthsSinceStart)
  };
}
function getAllSubscriptions() {
  const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return Object.values(subscriptions).map((sub) => ({
    ...sub,
    stats: getSubscriptionStats(sub.partnerId)
  }));
}
function getSubscriptionAnalytics() {
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
    active: allSubs.filter((s) => s.status === "active").length,
    paused: allSubs.filter((s) => s.status === "paused").length,
    cancelled: allSubs.filter((s) => s.status === "cancelled").length
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
      ltv: data.totalLTV
    }))
  };
}
function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
const EARNINGS_KEY = "colleco.partner_earnings";
const TRANSACTIONS_KEY = "colleco.partner_transactions";
function getEarningsSummary(partnerId) {
  const earnings = JSON.parse(localStorage.getItem(EARNINGS_KEY) || "{}");
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  const summary = earnings[partnerId] || {
    partnerId,
    totalEarned: 0,
    thisMonthEarned: 0,
    thisMonthTransactions: 0
  };
  const subscriptionCost = typeof plan.monthlyPrice === "number" ? plan.monthlyPrice : 0;
  const netEarnings = summary.thisMonthEarned - subscriptionCost;
  return {
    ...summary,
    subscriptionCost,
    netEarnings: Math.max(0, netEarnings),
    commissionRate: `${(plan.commission.base * 100).toFixed(1)}%`,
    tier: plan.name
  };
}
function getPartnerTransactions(partnerId, limit = 50) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "{}");
  const partnerTransactions = transactions[partnerId] || [];
  return partnerTransactions.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).slice(0, limit).map((txn) => ({
    ...txn,
    date: new Date(txn.recordedAt).toLocaleDateString(),
    displayCommission: `R${txn.commission.toLocaleString()}`,
    rateDisplay: `${(txn.effectiveRate * 100).toFixed(1)}%`
  }));
}
function getMonthlyEarningsReport(partnerId, monthOffset = 0) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "{}");
  const partnerTransactions = transactions[partnerId] || [];
  const now = /* @__PURE__ */ new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const monthStart = targetMonth.toISOString().split("T")[0].substring(0, 7);
  const monthTransactions = partnerTransactions.filter((txn) => {
    const txnMonth = txn.recordedAt.substring(0, 7);
    return txnMonth === monthStart;
  });
  const totalBookingAmount = monthTransactions.reduce((sum, t) => sum + t.bookingAmount, 0);
  const totalCommission = monthTransactions.reduce((sum, t) => sum + t.commission, 0);
  const byType = {};
  for (const txn of monthTransactions) {
    if (!byType[txn.bookingType]) {
      byType[txn.bookingType] = { count: 0, amount: 0, commission: 0 };
    }
    byType[txn.bookingType].count++;
    byType[txn.bookingType].amount += txn.bookingAmount;
    byType[txn.bookingType].commission += txn.commission;
  }
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  const subscriptionCost = typeof plan.monthlyPrice === "number" ? plan.monthlyPrice : 0;
  return {
    month: monthStart,
    year: targetMonth.getFullYear(),
    monthName: targetMonth.toLocaleString("default", { month: "long", year: "numeric" }),
    transactions: monthTransactions.length,
    totalBookingAmount: Math.round(totalBookingAmount * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    byType: Object.entries(byType).map(([type, data]) => ({
      type,
      ...data,
      average: Math.round(data.amount / data.count * 100) / 100
    })),
    subscriptionCost,
    netEarnings: Math.round((totalCommission - subscriptionCost) * 100) / 100,
    averageCommissionRate: monthTransactions.length > 0 ? (monthTransactions.reduce((sum, t) => sum + t.effectiveRate, 0) / monthTransactions.length * 100).toFixed(1) : "0"
  };
}
function getUpcomingPayoutAmount(partnerId) {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "{}");
  const partnerTransactions = transactions[partnerId] || [];
  const unpaidTransactions = partnerTransactions.filter((t) => t.status === "earned");
  const totalEarned = unpaidTransactions.reduce((sum, t) => sum + t.commission, 0);
  const sub = getPartnerSubscription(partnerId);
  const plan = getPlan(sub.planId);
  const pendingSubscriptionCharge = typeof plan.monthlyPrice === "number" ? plan.monthlyPrice : 0;
  const payoutAmount = Math.max(0, totalEarned - pendingSubscriptionCharge);
  return {
    totalEarned: Math.round(totalEarned * 100) / 100,
    pendingCharges: pendingSubscriptionCharge,
    payoutAmount: Math.round(payoutAmount * 100) / 100,
    transactions: unpaidTransactions.length,
    minimumPayoutThreshold: 100,
    // Minimum R100 payout
    isReadyForPayout: payoutAmount >= 100
  };
}
function getCommissionAnalytics() {
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "{}");
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
      averageCommissionPerBooking: Math.round(partnerTotal / txns.length * 100) / 100
    });
  }
  topPartners.sort((a, b) => b.totalCommission - a.totalCommission);
  return {
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalBookings,
    totalBookingAmount: Math.round(totalBookingAmount * 100) / 100,
    averageCommissionPerBooking: totalBookings > 0 ? Math.round(totalCommission / totalBookings * 100) / 100 : 0,
    activePartners: Object.keys(transactions).length,
    topPartners: topPartners.slice(0, 10)
  };
}
const PAYOUTS_KEY = "colleco.payouts";
const PAYOUT_METHODS_KEY = "colleco.payout_methods";
function getPayoutMethods(partnerId) {
  const methods = JSON.parse(localStorage.getItem(PAYOUT_METHODS_KEY) || "{}");
  return methods[partnerId] || [];
}
function getDefaultPayoutMethod(partnerId) {
  const methods = getPayoutMethods(partnerId);
  return methods.find((m) => m.isDefault) || methods[0] || null;
}
function initiatePayout(partnerId, options = {}) {
  const payoutData = getUpcomingPayoutAmount(partnerId);
  if (payoutData.payoutAmount < payoutData.minimumPayoutThreshold) {
    return {
      success: false,
      reason: `Minimum payout threshold is R${payoutData.minimumPayoutThreshold}. Current amount: R${payoutData.payoutAmount}`,
      current: payoutData.payoutAmount,
      threshold: payoutData.minimumPayoutThreshold
    };
  }
  const payoutMethod = options.methodId ? getPayoutMethods(partnerId).find((m) => m.id === options.methodId) : getDefaultPayoutMethod(partnerId);
  if (!payoutMethod) {
    return {
      success: false,
      reason: "No payout method configured. Please add a bank account or payment method."
    };
  }
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || "{}");
  if (!payouts[partnerId]) payouts[partnerId] = [];
  const transactions = JSON.parse(localStorage.getItem("colleco.partner_transactions") || "{}");
  const unpaidTransactionIds = (transactions[partnerId] || []).filter((t) => t.status === "earned").map((t) => t.id);
  const payout = {
    id: `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    partnerId,
    amount: payoutData.payoutAmount,
    grossAmount: payoutData.totalEarned,
    subscriptionDeduction: payoutData.pendingCharges,
    transactionCount: unpaidTransactionIds.length,
    transactionIds: unpaidTransactionIds,
    payoutMethod,
    status: "pending",
    // pending, processing, completed, failed
    requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
    processedAt: null,
    completedAt: null,
    reference: null
  };
  payouts[partnerId].push(payout);
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
  return {
    success: true,
    payout,
    estimatedDelivery: addBusinessDays(/* @__PURE__ */ new Date(), 2).toISOString()
  };
}
function getPayoutHistory(partnerId, limit = 12) {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || "{}");
  const partnerPayouts = payouts[partnerId] || [];
  return partnerPayouts.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)).slice(0, limit).map((p) => ({
    ...p,
    statusDisplay: getPayoutStatusDisplay(p.status),
    estimatedDelivery: p.status === "completed" ? p.completedAt : addBusinessDays(new Date(p.requestedAt), 2).toISOString()
  }));
}
function getPayoutStatistics() {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || "{}");
  let totalPayedOut = 0;
  let totalPending = 0;
  let totalFailed = 0;
  let payoutsCompleted = 0;
  let payoutsPending = 0;
  let payoutsFailed = 0;
  for (const partnerPayouts of Object.values(payouts)) {
    for (const p of partnerPayouts) {
      if (p.status === "completed") {
        totalPayedOut += p.amount;
        payoutsCompleted++;
      } else if (p.status === "pending") {
        totalPending += p.amount;
        payoutsPending++;
      } else if (p.status === "failed") {
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
    averagePayoutAmount: payoutsCompleted > 0 ? Math.round(totalPayedOut / payoutsCompleted * 100) / 100 : 0
  };
}
function addBusinessDays(date, days) {
  const result = new Date(date);
  let count = 0;
  while (count < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      count++;
    }
  }
  return result;
}
function getPayoutStatusDisplay(status) {
  const displays = {
    pending: "⏳ Processing",
    processing: "🔄 In Progress",
    completed: "✅ Completed",
    failed: "❌ Failed"
  };
  return displays[status] || status;
}
export {
  getPartnerSubscription as a,
  getPartnerTransactions as b,
  getUpcomingPayoutAmount as c,
  getPayoutMethods as d,
  getPayoutHistory as e,
  getMonthlyEarningsReport as f,
  getEarningsSummary as g,
  getSubscriptionAnalytics as h,
  initiatePayout as i,
  getCommissionAnalytics as j,
  getPayoutStatistics as k,
  getAllSubscriptions as l
};
//# sourceMappingURL=payoutsSystem-wwSz4I24.js.map
