const crypto = require('crypto');
const { getPaymentConfig } = require('../config/payments');

/**
 * Generate PayFast payment URL (hosted checkout)
 * @param {Object} booking - booking details
 * @param {string} booking.id - booking ID (m_payment_id)
 * @param {number} booking.amount - amount in ZAR
 * @param {string} booking.name - item name
 * @param {string} booking.email - customer email
 * @param {string} [processor='payfast'] - 'payfast' or 'yoco'
 * @returns {string} - hosted checkout URL
 */
function generatePaymentUrl(booking, processor = 'payfast') {
  const config = getPaymentConfig();

  if (processor === 'payfast') {
    const pf = config.payfast;
    if (!pf.merchantId || !pf.merchantKey) {
      throw new Error('PayFast merchant credentials not configured');
    }

    const baseUrl = pf.sandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    const data = {
      merchant_id: pf.merchantId,
      merchant_key: pf.merchantKey,
      return_url: pf.returnUrl,
      cancel_url: pf.cancelUrl,
      notify_url: pf.notifyUrl,
      name_first: booking.firstName || 'Customer',
      name_last: booking.lastName || '',
      email_address: booking.email,
      m_payment_id: booking.id,
      amount: booking.amount.toFixed(2),
      item_name: booking.name || 'Booking',
      item_description: booking.description || `Booking ${booking.id}`,
    };

    // Generate signature
    const pfParamString = Object.keys(data)
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
      .join('&');
    const signature = pf.passphrase
      ? crypto.createHash('md5').update(pfParamString + `&passphrase=${encodeURIComponent(pf.passphrase)}`).digest('hex')
      : crypto.createHash('md5').update(pfParamString).digest('hex');

    const query = `${pfParamString}&signature=${signature}`;
    return `${baseUrl}?${query}`;
  }

  if (processor === 'yoco') {
    const yoco = config.yoco;
    if (!yoco.secretKey || !yoco.publicKey) {
      throw new Error('Yoco credentials not configured');
    }

    // Yoco uses a different flow: create checkout session via API, return redirect URL
    // For now, return placeholder (full Yoco integration requires API call to create session)
    // TODO: call Yoco API POST /checkouts with booking details, return session.redirectUrl
    throw new Error('Yoco checkout session creation not yet implemented (requires API call)');
  }

  throw new Error(`Unknown payment processor: ${processor}`);
}

/**
 * Verify PayFast payment notification signature
 * @param {Object} pfData - POST data from PayFast ITN
 * @param {string} pfParamString - concatenated param string
 * @returns {boolean} - true if signature valid
 */
function verifyPayFastSignature(pfData, pfParamString) {
  const config = getPaymentConfig();
  const pf = config.payfast;

  const signature = pfData.signature;
  delete pfData.signature; // remove signature from data object

  const generatedSignature = pf.passphrase
    ? crypto.createHash('md5').update(pfParamString + `&passphrase=${encodeURIComponent(pf.passphrase)}`).digest('hex')
    : crypto.createHash('md5').update(pfParamString).digest('hex');

  return signature === generatedSignature;
}

/**
 * Verify Yoco webhook signature
 * @param {string} payload - raw request body
 * @param {string} signature - X-Yoco-Signature header
 * @returns {boolean} - true if signature valid
 */
function verifyYocoSignature(payload, signature) {
  const config = getPaymentConfig();
  const yoco = config.yoco;

  if (!yoco.webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', yoco.webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

module.exports = {
  generatePaymentUrl,
  verifyPayFastSignature,
  verifyYocoSignature,
};
