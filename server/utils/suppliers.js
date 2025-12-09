const fs = require('fs');
const path = require('path');

const SUPPLIERS_FILE = path.join(__dirname, '..', 'data', 'suppliers.json');

/**
 * Load suppliers configuration from file
 * @returns {Array} Array of supplier configs
 */
function loadSuppliers() {
  try {
    if (fs.existsSync(SUPPLIERS_FILE)) {
      const raw = fs.readFileSync(SUPPLIERS_FILE, 'utf8');
      return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    }
  } catch (e) {
    console.error('[suppliers] Failed to load suppliers:', e.message);
  }
  return [];
}

/**
 * Get supplier by ID
 * @param {string} supplierId - Supplier ID (e.g., 'beekman', 'premier')
 * @returns {Object|null} Supplier config or null if not found
 */
function getSupplier(supplierId) {
  const suppliers = loadSuppliers();
  return suppliers.find(s => s.id === supplierId) || null;
}

/**
 * Calculate commission and final price for a booking
 * Handles both discount-from-price and rebate scenarios
 * 
 * @param {string} supplierId - Supplier ID
 * @param {string} serviceType - Service type (accommodation, meals, conference, etc.)
 * @param {number} basePrice - Base/wholesale price from supplier
 * @param {number} quantity - Number of units/nights/items
 * @returns {Object} { basePrice, commissionAmount, commissionType, finalPrice, partnerReceives }
 */
function calculateCommission(supplierId, serviceType, basePrice, quantity = 1) {
  const supplier = getSupplier(supplierId);
  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found`);
  }

  const commissionRate = supplier.commission[serviceType] || 0;
  const commissionAmount = basePrice * quantity * commissionRate;

  // Check commission model (discount vs rebate)
  const commissionModel = supplier.commission.model || 'discount'; // default to discount

  let finalPrice, partnerReceives;

  if (commissionModel === 'discount') {
    // Commission is deducted from the price supplier gives us
    // We charge customer: basePrice * quantity
    // Supplier gets: basePrice * quantity - commission
    finalPrice = basePrice * quantity;
    partnerReceives = finalPrice - commissionAmount;
  } else if (commissionModel === 'rebate') {
    // Commission is rebated back to us by supplier
    // We charge customer: basePrice * quantity
    // Supplier gets: basePrice * quantity
    // We receive commission as a rebate after
    finalPrice = basePrice * quantity;
    partnerReceives = finalPrice;
  } else {
    throw new Error(`Unknown commission model: ${commissionModel}`);
  }

  return {
    supplierId,
    serviceType,
    basePrice,
    quantity,
    commissionRate: (commissionRate * 100).toFixed(1) + '%',
    commissionModel,
    commissionAmount: parseFloat(commissionAmount.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    partnerReceives: parseFloat(partnerReceives.toFixed(2)),
  };
}

/**
 * Get payment terms for a supplier
 * @param {string} supplierId - Supplier ID
 * @param {string} bookingType - Booking type (FIT, Groups)
 * @returns {Object} Payment terms { deposit, dueDays, balanceDueDays, methods, etc. }
 */
function getPaymentTerms(supplierId, bookingType = 'FIT') {
  const supplier = getSupplier(supplierId);
  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found`);
  }

  return supplier.paymentTerms[bookingType] || supplier.paymentTerms.FIT;
}

/**
 * Get cancellation policy for a supplier
 * @param {string} supplierId - Supplier ID
 * @param {string} bookingType - Booking type (FIT, Groups)
 * @param {number} daysBefore - Days before check-in
 * @returns {number} Refund percentage (0.0 to 1.0)
 */
function getCancellationRefund(supplierId, bookingType = 'FIT', daysBefore) {
  const supplier = getSupplier(supplierId);
  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found`);
  }

  const policy = supplier.cancellationPolicy[bookingType] || supplier.cancellationPolicy.FIT;
  
  // Find applicable refund tier
  for (const tier of policy) {
    if (daysBefore >= tier.daysBefore) {
      return tier.refund;
    }
  }

  // Default to zero refund if no tier matches
  return 0;
}

/**
 * Validate rate parity: ensure selling price >= supplier's retail rate
 * @param {string} supplierId - Supplier ID
 * @param {number} retailRate - Supplier's published retail rate
 * @param {number} sellingPrice - Price we're selling at (per unit)
 * @returns {Object} { valid, retailRate, sellingPrice, message }
 */
function validateRateParity(supplierId, retailRate, sellingPrice) {
  const supplier = getSupplier(supplierId);
  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found`);
  }

  if (!supplier.rateParity.enforce) {
    return { valid: true, retailRate, sellingPrice, message: 'Rate parity not enforced' };
  }

  const valid = sellingPrice >= retailRate - 0.01; // allow 1c rounding difference

  return {
    valid,
    retailRate,
    sellingPrice,
    message: valid ? 'Rate parity OK' : `Selling price (${sellingPrice}) below retail rate (${retailRate})`,
  };
}

/**
 * Get supplier's data policy (POPIA, retention, etc.)
 * @param {string} supplierId - Supplier ID
 * @returns {Object} Data policy { POPIA, retentionDays, destroyOnTermination }
 */
function getDataPolicy(supplierId) {
  const supplier = getSupplier(supplierId);
  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found`);
  }

  return supplier.dataPolicy || {};
}

/**
 * Get all active suppliers
 * @returns {Array} Array of active supplier configs
 */
function getActiveSuppliers() {
  return loadSuppliers().filter(s => s.status === 'active');
}

module.exports = {
  loadSuppliers,
  getSupplier,
  calculateCommission,
  getPaymentTerms,
  getCancellationRefund,
  validateRateParity,
  getDataPolicy,
  getActiveSuppliers,
};
