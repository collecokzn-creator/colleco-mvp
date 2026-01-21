/**
 * Payment Routes
 * 
 * Handles payment URL generation for PayFast and Yoco.
 * Routes:
 * - POST /api/payments/generate-url: Generate payment checkout URL
 * - POST /api/payments/complete-manual: Manually mark payment as complete (testing only)
 */

const express = require('express');
const router = express.Router();
const { generatePaymentUrl } = require('../utils/payments');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

function loadBookings() {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8')) || {};
    }
  } catch (e) {
    console.error('[payments] Failed to load bookings:', e.message);
  }
  return {};
}

function saveBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (e) {
    console.error('[payments] Failed to save bookings:', e.message);
  }
}

/**
 * POST /api/payments/generate-url
 * Generate a payment checkout URL for a booking
 * 
 * Body:
 * - bookingId: Booking ID
 * - processor: 'payfast' or 'yoco'
 * - amount: Payment amount
 * - returnUrl: Success redirect URL
 * - cancelUrl: Cancel redirect URL
 * - notifyUrl: Webhook notification URL
 */
router.post('/generate-url', async (req, res) => {
  try {
    const { bookingId, processor, amount, returnUrl, cancelUrl, notifyUrl } = req.body;

    // Validate required fields
    if (!bookingId || !processor || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: bookingId, processor, amount'
      });
    }

    if (!['payfast', 'yoco', 'paystack'].includes(processor)) {
      return res.status(400).json({
        error: 'Invalid processor. Must be "payfast", "yoco" or "paystack"'
      });
    }

    // Generate payment URL
    const paymentUrl = await generatePaymentUrl({
      bookingId,
      processor,
      amount,
      returnUrl: returnUrl || `${req.protocol}://${req.get('host')}/pay/success`,
      cancelUrl: cancelUrl || `${req.protocol}://${req.get('host')}/pay/cancel`,
      notifyUrl: notifyUrl || `${req.protocol}://${req.get('host')}/api/webhooks/${processor}`
    });

    res.json({ paymentUrl });
  } catch (error) {
    console.error('Payment URL generation error:', error);
    res.status(500).json({
      error: 'Failed to generate payment URL',
      message: error.message
    });
  }
});

/**
 * POST /api/payments/complete-manual
 * Manually mark a payment as complete (for local testing without webhooks)
 * 
 * Body:
 * - bookingId: Booking ID
 * - processor: 'payfast', 'yoco', or 'paystack'
 * - transactionId: Optional transaction ID
 */
router.post('/complete-manual', (req, res) => {
  try {
    const { bookingId, processor, transactionId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const bookings = loadBookings();
    const booking = bookings[bookingId];

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking to paid status
    booking.paymentStatus = 'paid';
    booking.paymentProcessor = processor || 'manual';
    booking.paymentId = transactionId || `TEST-${Date.now()}`;
    booking.paidAt = new Date().toISOString();
    booking.lastPaymentUpdate = new Date().toISOString();

    saveBookings(bookings);

    console.log('[payments] Manually marked booking as paid:', bookingId);

    res.json({
      success: true,
      booking: {
        bookingId,
        paymentStatus: booking.paymentStatus,
        paidAt: booking.paidAt
      }
    });
  } catch (error) {
    console.error('Manual payment completion error:', error);
    res.status(500).json({
      error: 'Failed to complete payment',
      message: error.message
    });
  }
});

module.exports = router;
