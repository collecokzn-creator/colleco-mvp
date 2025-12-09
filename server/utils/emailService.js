/**
 * Email Service - SMTP-based email sending
 * 
 * Handles:
 * - Booking confirmation emails
 * - Invoice emails
 * - Payment receipts
 * - Password resets
 * - General transactional emails
 * 
 * Supports both Gmail (via app password) and custom SMTP servers
 */

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Load configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@colleco.com';
const FROM_NAME = process.env.FROM_NAME || 'CollEco Travel';

// Log configuration (without sensitive data)
if (SMTP_USER) {
  console.log(`[email] Configured SMTP: ${SMTP_HOST}:${SMTP_PORT} from ${SMTP_USER}`);
} else {
  console.warn('[email] SMTP not configured - email sending will be disabled');
}

/**
 * Create and cache transporter
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[email] SMTP credentials not configured');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // Use TLS for 587, SSL for 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 * @param {string} [options.replyTo] - Reply-to address
 * @returns {Promise<Object>} Send result with messageId
 */
async function sendEmail({ to, subject, html, text, replyTo = FROM_EMAIL }) {
  const transport = getTransporter();

  if (!transport) {
    console.warn(`[email] SMTP not configured - email would be sent to ${to} (subject: ${subject})`);
    return {
      success: false,
      error: 'SMTP not configured',
      to,
      subject
    };
  }

  try {
    const info = await transport.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
      replyTo
    });

    console.log(`[email] Sent to ${to}: ${subject} (${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
      to,
      subject,
      sentAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[email] Failed to send to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      to,
      subject
    };
  }
}

/**
 * Send booking confirmation email
 * @param {Object} booking - Booking object from API
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<Object>} Send result
 */
async function sendBookingConfirmation(booking, customerEmail) {
  const {
    id: bookingId,
    checkInDate,
    checkOutDate,
    pricing,
    metadata = {},
    paymentStatus
  } = booking;

  const nights = metadata.nights || 1;
  const propertyName = metadata.propertyName || 'Your Property';
  const location = metadata.location || '';
  const guests = metadata.guests || 1;

  const checkIn = new Date(checkInDate).toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const checkOut = new Date(checkOutDate).toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #F47C20 0%, #ff9a4d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: bold; color: #3A2C1A; border-bottom: 2px solid #F47C20; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
    .info-item { background: white; padding: 10px; border-radius: 4px; }
    .info-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .info-value { font-size: 14px; font-weight: bold; color: #3A2C1A; }
    .pricing-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .pricing-table td { padding: 8px; border-bottom: 1px solid #ddd; }
    .pricing-table .label { font-weight: bold; }
    .pricing-table .amount { text-align: right; }
    .pricing-table .total-row { background: #F47C20; color: white; font-weight: bold; }
    .pricing-table .total-row td { border: none; }
    .highlight { background: #fff3cd; border-left: 4px solid #F47C20; padding: 10px; margin: 15px 0; border-radius: 4px; }
    .cta-button { display: inline-block; background: #F47C20; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 15px; font-weight: bold; }
    .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
    .footer-link { color: #F47C20; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Booking Confirmed!</h1>
      <p>Confirmation ID: ${bookingId}</p>
    </div>

    <div class="content">
      <!-- Booking Summary -->
      <div class="section">
        <div class="section-title">📍 Your Accommodation</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Property</div>
            <div class="info-value">${propertyName}</div>
            <div style="font-size: 12px; color: #999; margin-top: 4px;">${location}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Guests</div>
            <div class="info-value">${guests} ${guests === 1 ? 'guest' : 'guests'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Check-in</div>
            <div class="info-value">${checkIn}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Check-out</div>
            <div class="info-value">${checkOut}</div>
          </div>
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="section">
        <div class="section-title">💰 Price Breakdown</div>
        <table class="pricing-table">
          <tr>
            <td class="label">Subtotal (excl. VAT)</td>
            <td class="amount">ZAR ${pricing.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td class="label">VAT (15%)</td>
            <td class="amount">ZAR ${pricing.vat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr class="total-row">
            <td class="label">Total Amount</td>
            <td class="amount">ZAR ${pricing.total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <!-- Payment Status -->
      <div class="section">
        <div class="section-title">💳 Payment Status</div>
        <div class="highlight">
          ${paymentStatus === 'paid' ? '✅ Payment received - Thank you!' : '⏳ Payment pending - Complete payment to confirm your booking'}
        </div>
      </div>

      <!-- What's Included -->
      <div class="section">
        <div class="section-title">✓ What's Included</div>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Accommodation for ${nights} ${nights === 1 ? 'night' : 'nights'}</li>
          <li>All taxes and VAT</li>
          <li>24/7 customer support</li>
          <li>Free cancellation up to 7 days before check-in</li>
        </ul>
      </div>

      <!-- Important Information -->
      <div class="section">
        <div class="section-title">ℹ️ Important Information</div>
        <div class="highlight">
          <strong>Check-in:</strong> Usually from 2:00 PM<br>
          <strong>Check-out:</strong> Usually before 11:00 AM<br>
          <strong>Contact:</strong> We'll send property details via email 24 hours before arrival
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
        <a href="https://colleco.com/bookings/${bookingId}" class="cta-button">View Booking Details</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        Questions? Contact us at <a href="mailto:support@colleco.com" class="footer-link">support@colleco.com</a> or call +27 (0) 21 555 0100
      </p>
      <p style="margin: 0;">
        © 2025 CollEco Travel. All rights reserved.<br>
        <a href="https://colleco.com/terms" class="footer-link">Terms & Conditions</a> | <a href="https://colleco.com/privacy" class="footer-link">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `✅ Booking Confirmed - ${bookingId}`,
    html,
    replyTo: 'support@colleco.com'
  });
}

/**
 * Send payment receipt email
 * @param {Object} booking - Booking object
 * @param {string} customerEmail - Customer email
 * @param {Object} payment - Payment object with processor, amount, date
 * @returns {Promise<Object>} Send result
 */
async function sendPaymentReceipt(booking, customerEmail, payment) {
  const { processor = 'PayFast', amount, transactionId, paidAt } = payment;
  const { id: bookingId, pricing, metadata = {} } = booking;

  const paidDate = new Date(paidAt || Date.now()).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin: 15px 0; }
    .receipt-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
    .receipt-item.total { border-bottom: 2px solid #28a745; font-weight: bold; font-size: 16px; color: #28a745; }
    .info-box { background: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
    .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payment Receipt</h1>
      <p>Transaction ID: ${transactionId || 'N/A'}</p>
    </div>

    <div class="content">
      <div class="section">
        <h2 style="color: #28a745; margin-top: 0;">Payment Successful</h2>
        <p>Thank you! Your payment has been received and processed.</p>
      </div>

      <div class="info-box">
        <div style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px;">Payment Details</div>
        <div class="receipt-item">
          <span>Date & Time</span>
          <span>${paidDate}</span>
        </div>
        <div class="receipt-item">
          <span>Booking ID</span>
          <span>${bookingId}</span>
        </div>
        <div class="receipt-item">
          <span>Payment Processor</span>
          <span>${processor}</span>
        </div>
        <div class="receipt-item total">
          <span>Amount Paid</span>
          <span>ZAR ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div class="section">
        <h3>What's Next?</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Check your email for booking confirmation details</li>
          <li>You'll receive the property address 24 hours before check-in</li>
          <li>Keep your booking ID (${bookingId}) for reference</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>Need help? Contact <a href="mailto:support@colleco.com" style="color: #28a745; text-decoration: none;">support@colleco.com</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `💰 Payment Receipt - ${bookingId}`,
    html
  });
}

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  getTransporter
};
