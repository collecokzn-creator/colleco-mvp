const express = require('express');
const {
  createBooking,
  getBooking,
  updateBooking,
  cancelBooking,
  getBookingsByUserId,
  getBookingsBySupplierId,
  calculateRefund,
} = require('../utils/bookings');

const router = express.Router();

/**
 * POST /api/bookings
 * Create a new booking with supplier-specific terms
 */
router.post('/', (req, res) => {
  try {
    const booking = createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    console.error('[bookings API] POST error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/bookings/:bookingId
 * Retrieve a booking by ID
 */
router.get('/:bookingId', (req, res) => {
  try {
    const booking = getBooking(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/bookings/:bookingId
 * Update a booking (e.g., payment status)
 */
router.put('/:bookingId', (req, res) => {
  try {
    const booking = updateBooking(req.params.bookingId, req.body);
    res.json({ ok: true, booking });
  } catch (err) {
    console.error('[bookings API] PUT error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/bookings/:bookingId/cancel
 * Cancel a booking and calculate refund
 */
router.post('/:bookingId/cancel', (req, res) => {
  try {
    const { reason } = req.body || {};
    const booking = cancelBooking(req.params.bookingId, reason || 'Customer requested cancellation');
    res.json({ ok: true, booking });
  } catch (err) {
    console.error('[bookings API] Cancel error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/bookings/:bookingId/refund
 * Calculate refund amount based on supplier's cancellation policy
 */
router.get('/:bookingId/refund', (req, res) => {
  try {
    const refund = calculateRefund(req.params.bookingId);
    res.json({ ok: true, refund });
  } catch (err) {
    console.error('[bookings API] Refund calculation error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/bookings/user/:userId
 * Get all bookings for a user
 */
router.get('/user/:userId', (req, res) => {
  try {
    const bookings = getBookingsByUserId(req.params.userId);
    res.json({ ok: true, bookings, count: bookings.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/bookings/supplier/:supplierId
 * Get all bookings for a supplier
 */
router.get('/supplier/:supplierId', (req, res) => {
  try {
    const bookings = getBookingsBySupplierId(req.params.supplierId);
    res.json({ ok: true, bookings, count: bookings.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
