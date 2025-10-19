const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const COMMISSION_FILE = path.join(DATA_DIR, 'commission_tiers.json');

function loadCommissionTiers() {
  try {
    const raw = fs.readFileSync(COMMISSION_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // fallback default
    return [
      { name: 'Bronze', minBookings: 0, maxBookings: 9, commission: 0.15 },
      { name: 'Silver', minBookings: 10, maxBookings: 24, commission: 0.12 },
      { name: 'Gold', minBookings: 25, maxBookings: 49, commission: 0.10 },
      { name: 'Platinum', minBookings: 50, maxBookings: 999999, commission: 0.08 }
    ];
  }
}

function findTierForCount(count) {
  const tiers = loadCommissionTiers();
  for (const t of tiers) {
    if (count >= t.minBookings && count <= t.maxBookings) return t;
  }
  return tiers[0];
}

function computeServiceFee(item, opts = {}) {
  // item: { type: 'accommodation'|'tours'|'flight'|'car'|'package', netRate }
  const type = (item.type || '').toLowerCase();
  const net = Number(item.netRate || item.amount || item.price || 0);
  if (net <= 0) return { fee: 0, total: 0, currency: opts.currency || 'ZAR' };
  switch (type) {
    case 'accommodation': {
      // sliding: short stays higher (assume nights count in item.nights)
      const nights = Number(item.nights || 1);
      const pct = nights <= 3 ? 0.08 : 0.05; // 8% for short stays, 5% for longer
      const fee = +(net * pct).toFixed(2);
      return { fee, total: +(net + fee).toFixed(2), currency: opts.currency || 'ZAR' };
    }
    case 'tours': {
      const pct = 0.11; // mid 10-12
      const fee = +(net * pct).toFixed(2);
      return { fee, total: +(net + fee).toFixed(2), currency: opts.currency || 'ZAR' };
    }
    case 'flight': {
      const fee = +(250 + net * 0.03).toFixed(2); // R250 + 3%
      return { fee, total: +(net + fee).toFixed(2), currency: opts.currency || 'ZAR' };
    }
    case 'car': {
      const fee = +(net * 0.07).toFixed(2);
      return { fee, total: +(net + fee).toFixed(2), currency: opts.currency || 'ZAR' };
    }
    case 'package': {
      const pct = 0.12; // 10-15 middle choice
      const fee = +(net * pct).toFixed(2);
      return { fee, total: +(net + fee).toFixed(2), currency: opts.currency || 'ZAR' };
    }
    default: {
      // generic percentage
      const fee = +(net * 0.1).toFixed(2);
      return { fee, total: +(net + fee).toFixed(2), currency: opts.currency || 'ZAR' };
    }
  }
}

function computeCommissionForPartner(netAmount, partnerBookingCount) {
  const tier = findTierForCount(partnerBookingCount || 0);
  const commission = +(netAmount * (tier.commission || 0)).toFixed(2);
  return { commission, tier: tier.name || 'Bronze', rate: tier.commission || 0 };
}

/**
 * computeTotals(items, partnerBookingCount)
 * items: array of { type, netRate }
 * returns: { items: [...], subtotal, totalServiceFees, totalCommission, collEcoEarns, partnerReceives }
 */
function computeTotals(items = [], partnerBookingCount = 0, opts = {}) {
  const currency = opts.currency || 'ZAR';
  const detailed = [];
  let subtotal = 0;
  let totalFees = 0;
  for (const it of items) {
    const net = Number(it.netRate || it.amount || it.price || 0) || 0;
    const feeInfo = computeServiceFee(it, { currency });
    detailed.push({ ...it, net, serviceFee: feeInfo.fee, totalWithFee: feeInfo.total, currency });
    subtotal += net;
    totalFees += feeInfo.fee;
  }
  const commissionInfo = computeCommissionForPartner(subtotal, partnerBookingCount);
  const partnerReceives = +(subtotal - commissionInfo.commission).toFixed(2);
  const collEcoEarns = +(commissionInfo.commission + totalFees).toFixed(2);
  const total = +(subtotal + totalFees).toFixed(2);
  return { items: detailed, subtotal: +subtotal.toFixed(2), totalServiceFees: +totalFees.toFixed(2), commission: commissionInfo.commission, commissionRate: commissionInfo.rate, commissionTier: commissionInfo.tier, collEcoEarns, partnerReceives, total };
}

module.exports = { loadCommissionTiers, findTierForCount, computeServiceFee, computeCommissionForPartner, computeTotals };
