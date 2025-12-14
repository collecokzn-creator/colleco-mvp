const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyPayFastSignature, verifyYocoSignature } = require('../utils/payments');
const { sendBookingConfirmation, sendPaymentReceipt } = require('../utils/emailService');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PAYMENT_LOG = path.join(DATA_DIR, 'payment_notifications.jsonl');

// Load/save bookings
function loadBookings() {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8')) || {};
    }
  } catch (e) {
    console.error('[webhooks] Failed to load bookings:', e.message);
  }
  return {};
}

function saveBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (e) {
    console.error('[webhooks] Failed to save bookings:', e.message);
  }
}

function logPaymentEvent(event) {
  try {
    fs.appendFileSync(PAYMENT_LOG, JSON.stringify(event) + '\n', 'utf8');
  } catch (e) {
    console.error('[webhooks] Failed to log payment event:', e.message);
  }
}

/**
 * PayFast ITN (Instant Transaction Notification)
 * POST /api/webhooks/payfast
 * Payload: application/x-www-form-urlencoded
 * https://www.payfast.co.za/documentation/integration-guides/pdt-guide
 */
router.post('/payfast', express.urlencoded({ extended: false }), async (req, res) => {
  const data = req.body || {};
  const ip = req.ip || 'unknown';

  console.log('[webhook] PayFast ITN received:', {
    mPaymentId: data.m_payment_id,
    paymentStatus: data.payment_status,
    ip,
  });

  // Build param string for signature verification (same order as docs)
  const paramString = Object.keys(data)
    .filter(k => k !== 'signature')
    .sort()
    .map(k => `${k}=${encodeURIComponent(data[k]).replace(/%20/g, '+')}`)
    .join('&');

  // Verify signature
  if (!verifyPayFastSignature(data, paramString)) {
    console.warn('[webhook] PayFast signature verification failed');
    logPaymentEvent({
      ts: Date.now(),
      processor: 'payfast',
      type: 'signature_failed',
      bookingId: data.m_payment_id,
      ip,
    });
    return res.status(400).json({ error: 'signature_mismatch' });
  }

  // Verify amount (security check)
  const bookingId = data.m_payment_id;
  const paidAmount = parseFloat(data.amount_gross);
  const bookings = loadBookings();
  const booking = bookings[bookingId];

  if (!booking) {
    console.warn('[webhook] PayFast: booking not found', bookingId);
    logPaymentEvent({
      ts: Date.now(),
      processor: 'payfast',
      type: 'booking_not_found',
      bookingId,
      ip,
    });
    // Still respond 200 so PayFast doesn't retry
    return res.status(200).json({ ok: true });
  }

  if (Math.abs(paidAmount - booking.amount) > 0.01) {
    console.warn('[webhook] PayFast: amount mismatch', {
      expected: booking.amount,
      received: paidAmount,
    });
    logPaymentEvent({
      ts: Date.now(),
      processor: 'payfast',
      type: 'amount_mismatch',
      bookingId,
      expected: booking.amount,
      received: paidAmount,
      ip,
    });
    return res.status(200).json({ ok: true }); // Acknowledge but log discrepancy
  }

  // Handle payment status
  const status = data.payment_status || 'unknown';
  let bookingStatus = 'failed';

  if (status === 'COMPLETE') {
    bookingStatus = 'paid';
  } else if (status === 'PENDING' || status === 'PROCESSING') {
    bookingStatus = 'pending';
  } else if (status === 'FAILED' || status === 'CANCELLED') {
    bookingStatus = 'failed';
  }

  // Update booking
  booking.paymentStatus = bookingStatus;
  booking.paymentId = data.pf_payment_id || null;
  booking.lastPaymentUpdate = new Date().toISOString();
  booking.paymentProcessor = 'payfast';

  if (bookingStatus === 'paid') {
    booking.paidAt = new Date().toISOString();
    console.log('[webhook] PayFast payment successful:', bookingId);

    // Send confirmation and receipt emails
    try {
      const customerEmail = booking.metadata?.customerEmail || booking.email;
      if (customerEmail) {
        // Send booking confirmation
        await sendBookingConfirmation(booking, customerEmail);

        // Send payment receipt
        await sendPaymentReceipt(booking, customerEmail, {
          processor: 'payfast',
          amount: paidAmount,
          transactionId: data.pf_payment_id,
          paidAt: new Date().toISOString(),
        });

        console.log('[webhook] Confirmation and receipt emails sent:', bookingId);
      } else {
        console.warn('[webhook] No customer email for booking:', bookingId);
      }
    } catch (emailError) {
      console.error('[webhook] Failed to send confirmation emails:', emailError.message);
      // Don't fail the webhook if email fails
    }
  } else {
    console.log('[webhook] PayFast payment failed:', { bookingId, status });
  }

  saveBookings(bookings);

  logPaymentEvent({
    ts: Date.now(),
    processor: 'payfast',
    type: 'notification_received',
    bookingId,
    status: bookingStatus,
    paymentId: data.pf_payment_id,
    ip,
  });

  // Respond 200 to confirm receipt (PayFast will retry if not 200)
  res.status(200).json({ ok: true });
});

/**
 * Yoco Webhook
 * POST /api/webhooks/yoco
 * Payload: application/json
 * Headers: X-Yoco-Signature
 * https://yoco.com/en/documentation/
 */
router.post('/yoco', express.json(), async (req, res) => {
  const payload = JSON.stringify(req.body);
  const signature = req.headers['x-yoco-signature'] || '';
  const ip = req.ip || 'unknown';

  const data = req.body || {};

  console.log('[webhook] Yoco webhook received:', {
    eventType: data.type,
    checkoutId: data.data?.id,
    ip,
  });

  // Verify signature
  if (!verifyYocoSignature(payload, signature)) {
    console.warn('[webhook] Yoco signature verification failed');
    logPaymentEvent({
      ts: Date.now(),
      processor: 'yoco',
      type: 'signature_failed',
      eventType: data.type,
      ip,
    });
    return res.status(400).json({ error: 'signature_mismatch' });
  }

  // Handle event types
  const eventType = data.type || '';
  if (!['checkout.completed', 'checkout.paid', 'charge.succeeded', 'charge.failed'].includes(eventType)) {
    // Ignore unknown event types
    return res.status(200).json({ ok: true });
  }

  // Extract booking ID and payment info from Yoco data
  const checkoutData = data.data || {};
  const bookingId = checkoutData.metadata?.bookingId || checkoutData.reference;
  const paidAmount = checkoutData.amount ? checkoutData.amount / 100 : 0; // Yoco uses cents
  const checkoutId = checkoutData.id;
  const chargeId = checkoutData.chargeId || null;

  if (!bookingId) {
    console.warn('[webhook] Yoco: no booking ID in metadata');
    logPaymentEvent({
      ts: Date.now(),
      processor: 'yoco',
      type: 'no_booking_id',
      eventType,
      ip,
    });
    return res.status(200).json({ ok: true });
  }

  const bookings = loadBookings();
  const booking = bookings[bookingId];

  if (!booking) {
    console.warn('[webhook] Yoco: booking not found', bookingId);
    logPaymentEvent({
      ts: Date.now(),
      processor: 'yoco',
      type: 'booking_not_found',
      bookingId,
      eventType,
      ip,
    });
    return res.status(200).json({ ok: true });
  }

  // Determine expected amount: prefer booking.pricing.total, fall back to legacy fields
  const expectedAmount = Number((booking.pricing && booking.pricing.total) || booking.amount || booking.fees?.total || 0);
  if (Math.abs(paidAmount - expectedAmount) > 0.01) {
    console.warn('[webhook] Yoco: amount mismatch', {
      expected: expectedAmount,
      received: paidAmount,
    });
    logPaymentEvent({
      ts: Date.now(),
      processor: 'yoco',
      type: 'amount_mismatch',
      bookingId,
      expected: expectedAmount,
      received: paidAmount,
      eventType,
      ip,
    });
    return res.status(200).json({ ok: true });
  }

  // Map event types to bookingStatus
  let bookingStatus = 'pending';
  if (['checkout.completed', 'checkout.paid', 'charge.succeeded'].includes(eventType)) bookingStatus = 'paid';
  if (eventType === 'charge.failed') bookingStatus = 'failed';

  if (bookingStatus === 'paid') {
    booking.paidAt = new Date().toISOString();
    console.log('[webhook] Yoco payment successful:', bookingId);

    // Send confirmation and receipt emails
    try {
      const customerEmail = booking.metadata?.customerEmail || booking.email;
      if (customerEmail) {
        // Send booking confirmation
        await sendBookingConfirmation(booking, customerEmail);

        // Send payment receipt
        await sendPaymentReceipt(booking, customerEmail, {
          processor: 'yoco',
          amount: paidAmount,
          transactionId: chargeId || checkoutId,
          paidAt: new Date().toISOString(),
        });

        console.log('[webhook] Confirmation and receipt emails sent:', bookingId);
      } else {
        console.warn('[webhook] No customer email for booking:', bookingId);
      }
    } catch (emailError) {
      console.error('[webhook] Failed to send confirmation emails:', emailError.message);
      // Don't fail the webhook if email fails
    }
  } else if (bookingStatus === 'failed') {
    console.log('[webhook] Yoco payment failed:', bookingId);
  }

  // Update booking
  booking.paymentStatus = bookingStatus === 'paid' ? 'paid' : bookingStatus === 'failed' ? 'failed' : 'pending';
  booking.paymentId = chargeId || checkoutId;
  booking.lastPaymentUpdate = new Date().toISOString();
  booking.paymentProcessor = 'yoco';

  if (bookingStatus === 'paid') {
    booking.paidAt = new Date().toISOString();
  }

  saveBookings(bookings);

  logPaymentEvent({
    ts: Date.now(),
    processor: 'yoco',
    type: 'notification_received',
    bookingId,
    eventType,
    status: bookingStatus,
    checkoutId,
    chargeId,
    ip,
  });

  res.status(200).json({ ok: true });
});

module.exports = router;
