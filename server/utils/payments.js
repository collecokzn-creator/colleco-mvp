const crypto = require('crypto');
const { getPaymentConfig } = require('../config/payments');

/**
 * Generate PayFast or Yoco payment URL (hosted checkout)
 * @param {Object} params - Payment parameters
 * @param {string} params.bookingId - booking ID (m_payment_id)
 * @param {string} params.processor - 'payfast', 'yoco' or 'paystack'
 * @param {number} params.amount - amount in ZAR
 * @param {string} [params.returnUrl] - success redirect URL
 * @param {string} [params.cancelUrl] - cancel redirect URL
 * @param {string} [params.notifyUrl] - webhook notification URL
 * @param {string} [params.email] - customer email (optional)
 * @param {string} [params.firstName] - customer first name (optional)
 * @param {string} [params.lastName] - customer last name (optional)
 * @param {string} [params.itemName] - item name (optional)
 * @returns {string} - hosted checkout URL
 */
async function generatePaymentUrl(params) {
  const config = getPaymentConfig();
  const {
    bookingId,
    processor = 'payfast',
    amount,
    returnUrl,
    cancelUrl,
    notifyUrl,
    email = 'customer@example.com',
    firstName = 'Customer',
    lastName = '',
    itemName = `Booking ${bookingId}`
  } = params;

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
      return_url: returnUrl || pf.returnUrl,
      cancel_url: cancelUrl || pf.cancelUrl,
      notify_url: notifyUrl || pf.notifyUrl,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: bookingId,
      amount: amount.toFixed(2),
      item_name: itemName,
      item_description: `Booking ${bookingId}`,
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

    // Create a Yoco hosted checkout session via Yoco API and return the redirect URL
    const apiBase = (yoco.apiUrl || '').replace(/\/$/, '') || 'https://online.yoco.com/api/v1';
    const endpoint = `${apiBase}/checkouts`;
    const amountInCents = Math.round(Number(amount) * 100);

    const payload = {
      amountInCents,
      reference: bookingId,
      success_url: returnUrl || yoco.successUrl,
      cancel_url: cancelUrl || yoco.cancelUrl,
      metadata: { bookingId },
      name: itemName,
    };

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${yoco.secretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await resp.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

      if (!resp.ok) {
        throw new Error(`Yoco API error: ${resp.status} ${resp.statusText} - ${text}`);
      }

      // Flexible extraction of redirect URL from common response shapes
      const redirectUrl = data?.redirectUrl || data?.redirect_url || data?.checkout?.redirectUrl || data?.checkout?.redirect_url || data?.checkout_url || data?.data?.redirectUrl || data?.data?.redirect_url || (() => {
        if (!data || typeof data !== 'object') return null;
        for (const k of Object.keys(data)) {
          if (/redirect/i.test(k) && typeof data[k] === 'string') return data[k];
        }
        return null;
      })();

      if (!redirectUrl) {
        throw new Error(`Yoco checkout created but redirect URL not found in response: ${text}`);
      }

      return redirectUrl;
    } catch (err) {
      throw new Error(`Yoco checkout creation error: ${err.message}`);
    }
  }

  if (processor === 'paystack') {
    const ps = config.paystack;
    if (!ps || !ps.secretKey) {
      throw new Error('Paystack credentials not configured');
    }

    // Initialize Paystack transaction (server must have Node >=18 for fetch)
    try {
      const initUrl = `${ps.apiUrl.replace(/\/$/, '')}/transaction/initialize`;
      const body = {
        email,
        amount: Math.round(Number(amount) * 100), // in kobo/cents
        callback_url: returnUrl || ps.successUrl,
        metadata: { bookingId, itemName }
      };

      const resp = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ps.secretKey}`
        },
        body: JSON.stringify(body)
      });

      const data = await resp.json();
      if (!resp.ok || !data || !data.data || !data.data.authorization_url) {
        throw new Error(`Paystack init failed: ${data?.message || 'unknown'}`);
      }

      return data.data.authorization_url;
    } catch (err) {
      throw new Error(`Paystack initialization error: ${err.message}`);
    }
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

  if (!yoco.webhookSecret || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', yoco.webhookSecret)
    .update(payload)
    .digest('hex');

  // Ensure both buffers are same length before timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (err) {
    console.error('[payments] timingSafeEqual error:', err.message);
    return false;
  }
}

module.exports = {
  generatePaymentUrl,
  verifyPayFastSignature,
  verifyYocoSignature,
};
