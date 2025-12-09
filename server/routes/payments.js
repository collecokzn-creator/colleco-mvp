/**
 * Payment Routes
 * 
 * Handles payment URL generation for PayFast and Yoco.
 * Routes:
 * - POST /api/payments/generate-url: Generate payment checkout URL
 */

const express = require('express');
const router = express.Router();
const { generatePaymentUrl } = require('../utils/payments');

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

    if (!['payfast', 'yoco'].includes(processor)) {
      return res.status(400).json({
        error: 'Invalid processor. Must be "payfast" or "yoco"'
      });
    }

    // Generate payment URL
    const paymentUrl = generatePaymentUrl({
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

module.exports = router;
