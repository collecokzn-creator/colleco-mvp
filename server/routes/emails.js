/**
 * Email API Routes
 * 
 * Handles:
 * - POST /api/emails/booking-confirmation
 * - POST /api/emails/payment-receipt
 * - POST /api/emails/send (generic)
 */

const express = require('express');
const { sendEmail, sendBookingConfirmation, sendPaymentReceipt } = require('../utils/emailService');
const { getBooking } = require('../utils/bookings');

const router = express.Router();

/**
 * POST /api/emails/booking-confirmation
 * Send booking confirmation email
 * 
 * Body:
 * {
 *   bookingId: string,
 *   customerEmail: string
 * }
 */
router.post('/booking-confirmation', async (req, res) => {
  try {
    const { bookingId, customerEmail } = req.body;

    if (!bookingId || !customerEmail) {
      return res.status(400).json({
        error: 'bookingId and customerEmail are required'
      });
    }

    // Get booking from storage
    const booking = getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    // Send email
    const result = await sendBookingConfirmation(booking, customerEmail);

    if (!result.success) {
      return res.status(500).json({
        error: result.error,
        result
      });
    }

    res.json({
      success: true,
      messageId: result.messageId,
      to: result.to,
      sentAt: result.sentAt
    });
  } catch (error) {
    console.error('[emails] Error sending booking confirmation:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * POST /api/emails/payment-receipt
 * Send payment receipt email
 * 
 * Body:
 * {
 *   bookingId: string,
 *   customerEmail: string,
 *   payment: {
 *     processor: string,
 *     amount: number,
 *     transactionId: string,
 *     paidAt: string (ISO)
 *   }
 * }
 */
router.post('/payment-receipt', async (req, res) => {
  try {
    const { bookingId, customerEmail, payment } = req.body;

    if (!bookingId || !customerEmail || !payment) {
      return res.status(400).json({
        error: 'bookingId, customerEmail, and payment are required'
      });
    }

    // Get booking from storage
    const booking = getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    // Send email
    const result = await sendPaymentReceipt(booking, customerEmail, payment);

    if (!result.success) {
      return res.status(500).json({
        error: result.error,
        result
      });
    }

    res.json({
      success: true,
      messageId: result.messageId,
      to: result.to,
      sentAt: result.sentAt
    });
  } catch (error) {
    console.error('[emails] Error sending payment receipt:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * POST /api/emails/send
 * Send generic email
 * 
 * Body:
 * {
 *   to: string,
 *   subject: string,
 *   html: string,
 *   text?: string,
 *   replyTo?: string
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { to, subject, html, text, replyTo } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'to, subject, and html are required'
      });
    }

    const result = await sendEmail({
      to,
      subject,
      html,
      text,
      replyTo
    });

    if (!result.success) {
      return res.status(500).json({
        error: result.error,
        result
      });
    }

    res.json({
      success: true,
      messageId: result.messageId,
      to: result.to,
      sentAt: result.sentAt
    });
  } catch (error) {
    console.error('[emails] Error sending email:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
