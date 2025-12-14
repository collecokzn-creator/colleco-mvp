const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  getSupplier,
  calculateCommission,
  getPaymentTerms,
  getCancellationRefund,
  validateRateParity,
} = require('./suppliers');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

/**
 * Load bookings from storage
 */
function loadBookings() {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8')) || {};
    }
  } catch (e) {
    console.error('[bookings] Failed to load bookings:', e.message);
  }
  return {};
}

/**
 * Save bookings to storage
 */
function saveBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (e) {
    console.error('[bookings] Failed to save bookings:', e.message);
  }
}

/**
 * Create a new booking with supplier-specific terms
 * @param {Object} data - Booking data
 * @param {string} data.supplierId - Supplier ID (e.g., 'beekman', 'premier')
 * @param {string} data.userId - User ID
 * @param {string} data.bookingType - FIT or Groups
 * @param {number} data.checkInDate - Check-in timestamp
 * @param {number} data.checkOutDate - Check-out timestamp
 * @param {Array} data.lineItems - Array of service line items (accommodation, conferencing, banqueting, etc.)
 *   Each item: { serviceType, description, basePrice, retailPrice, quantity, nights }
 * @param {Object} [data.metadata] - Additional metadata
 * @returns {Object} Created booking with all terms applied
 */
function createBooking(data) {
  const {
    supplierId,
    userId,
    bookingType = 'FIT',
    checkInDate,
    checkOutDate,
    lineItems = [],
    metadata = {},
  } = data;

  // Support legacy single-item booking format
  if (!lineItems.length && data.serviceType) {
    lineItems.push({
      serviceType: data.serviceType,
      basePrice: data.basePrice,
      retailPrice: data.retailPrice,
      quantity: data.quantity || 1,
      description: data.description || data.serviceType,
    });
  }

  if (!supplierId || !userId || !checkInDate || !checkOutDate || !lineItems.length) {
    throw new Error('Missing required booking fields (supplierId, userId, checkInDate, checkOutDate, lineItems)');
  }

  const supplier = getSupplier(supplierId);
  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found`);
  }

  const bookingId = `BK-${uuidv4().slice(0, 12).toUpperCase()}`;
  const now = Date.now();

  // Process each line item and calculate commissions
  const processedItems = [];
  let totalBasePrice = 0;
  let totalRetailPrice = 0;
  let totalCommission = 0;

  for (const item of lineItems) {
    const { serviceType, basePrice, retailPrice = basePrice, quantity = 1, description = serviceType, nights = 1 } = item;

    if (!serviceType || !basePrice) {
      throw new Error(`Invalid line item: missing serviceType or basePrice`);
    }

    // Calculate commission for this line item (handles both discount and rebate)
    const commission = calculateCommission(supplierId, serviceType, basePrice, quantity);

    // Validate rate parity for this line item
    const rateParity = validateRateParity(supplierId, basePrice, retailPrice);
    if (!rateParity.valid) {
      throw new Error(`Rate parity violation on ${serviceType}: ${rateParity.message}`);
    }

    const itemTotal = {
      ...commission,
      description,
      nights,
      quantity,
      retailPrice: parseFloat(retailPrice),
      totalRetail: parseFloat(commission.finalPrice.toFixed(2)),
      serviceFee: parseFloat(commission.commissionAmount.toFixed(2)),
    };

    processedItems.push(itemTotal);
    totalBasePrice += parseFloat(commission.basePrice) * quantity;
    totalRetailPrice += parseFloat(commission.finalPrice);
    totalCommission += parseFloat(commission.commissionAmount);
  }

  // Get payment terms for this booking type
  const paymentTerms = getPaymentTerms(supplierId, bookingType);

  // Calculate due dates
  const depositDue = new Date(now + paymentTerms.dueDays * 24 * 60 * 60 * 1000);
  let balanceDue = null;
  if (paymentTerms.balanceDueDays) {
    balanceDue = new Date(checkInDate - paymentTerms.balanceDueDays * 24 * 60 * 60 * 1000);
  }

  const depositAmount = totalRetailPrice * paymentTerms.deposit;

  // Compute VAT (included) at 15% for display purposes
  const VAT_RATE = 0.15;
  const vatPortion = totalRetailPrice - totalRetailPrice / (1 + VAT_RATE);
  const subtotalExVat = totalRetailPrice - vatPortion;

  const booking = {
    id: bookingId,
    supplierId,
    userId,
    bookingType,
    checkInDate: new Date(checkInDate).toISOString(),
    checkOutDate: new Date(checkOutDate).toISOString(),
    lineItems: processedItems,
    pricing: {
      baseTotal: parseFloat(totalBasePrice.toFixed(2)),
      retailTotal: parseFloat(totalRetailPrice.toFixed(2)),
      commissionTotal: parseFloat(totalCommission.toFixed(2)),
      subtotal: parseFloat(subtotalExVat.toFixed(2)),
      vat: parseFloat(vatPortion.toFixed(2)),
      serviceFee: parseFloat(totalCommission.toFixed(2)),
      total: parseFloat(totalRetailPrice.toFixed(2)),
      itemCount: lineItems.length,
    },
    paymentTerms: {
      ...paymentTerms,
      depositDueDate: depositDue.toISOString(),
      balanceDueDate: balanceDue ? balanceDue.toISOString() : null,
      depositAmount: parseFloat(depositAmount.toFixed(2)),
      balanceAmount: parseFloat((totalRetailPrice - depositAmount).toFixed(2)),
    },
    paymentStatus: 'pending',
    paymentId: null,
    paidAt: null,
    lastPaymentUpdate: null,
    paymentProcessor: null,
    status: 'pending',
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    metadata,
    suppliersTermsVersion: 1,
  };

  // Save booking
  const bookings = loadBookings();
  bookings[bookingId] = booking;
  saveBookings(bookings);

  try {
    const { sanitizeLog } = require('./safeLog');
    console.log('[bookings] Created booking %s for supplier %s with %d line items', sanitizeLog(bookingId), sanitizeLog(supplierId), Number(lineItems.length));
  } catch (e) {
    console.log('[bookings] Created booking', bookingId);
  }
  return booking;
}

/**
 * Get booking by ID
 */
function getBooking(bookingId) {
  const bookings = loadBookings();
  return bookings[bookingId] || null;
}

/**
 * Update booking (e.g., payment status, cancellation)
 */
function updateBooking(bookingId, updates) {
  const bookings = loadBookings();
  const booking = bookings[bookingId];

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const updated = {
    ...booking,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  bookings[bookingId] = updated;
  saveBookings(bookings);

  return updated;
}

/**
 * Calculate refund for a cancelled booking
 * Uses supplier's cancellation policy based on days before check-in
 */
function calculateRefund(bookingId) {
  const booking = getBooking(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const daysBefore = Math.ceil(
    (new Date(booking.checkInDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const refundRate = getCancellationRefund(
    booking.supplierId,
    booking.bookingType,
    daysBefore
  );

  const totalPaid = parseFloat(booking.pricing.totalRetailPrice);
  const refundAmount = totalPaid * refundRate;

  return {
    bookingId,
    supplierId: booking.supplierId,
    bookingType: booking.bookingType,
    checkInDate: booking.checkInDate,
    daysBefore,
    refundRate: (refundRate * 100).toFixed(1) + '%',
    totalPaid,
    refundAmount: parseFloat(refundAmount.toFixed(2)),
    nonRefundableAmount: parseFloat((totalPaid - refundAmount).toFixed(2)),
  };
}

/**
 * Cancel a booking and update its status
 */
function cancelBooking(bookingId, reason) {
  const booking = getBooking(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  if (booking.status === 'cancelled') {
    throw new Error(`Booking ${bookingId} is already cancelled`);
  }

  const refund = calculateRefund(bookingId);

  return updateBooking(bookingId, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason,
    refund,
  });
}

/**
 * Get all bookings for a user
 */
function getBookingsByUserId(userId) {
  const bookings = loadBookings();
  return Object.values(bookings).filter(b => b.userId === userId);
}

/**
 * Get all bookings for a supplier
 */
function getBookingsBySupplierId(supplierId) {
  const bookings = loadBookings();
  return Object.values(bookings).filter(b => b.supplierId === supplierId);
}

/**
 * Get all bookings (admin only)
 */
function getAllBookings() {
  const bookings = loadBookings();
  return Object.values(bookings);
}

/**
 * Get bookings by date range
 */
function getBookingsByDateRange(dateFrom, dateTo) {
  const bookings = loadBookings();
  return Object.values(bookings).filter(b => {
    const checkIn = new Date(b.checkInDate);
    const from = dateFrom ? new Date(dateFrom) : new Date(0);
    const to = dateTo ? new Date(dateTo) : new Date('2100-01-01');
    return checkIn >= from && checkIn <= to;
  });
}

module.exports = {
  createBooking,
  getBooking,
  updateBooking,
  calculateRefund,
  cancelBooking,
  getBookingsByUserId,
  getBookingsBySupplierId,
  getAllBookings,
  getBookingsByDateRange,
};
