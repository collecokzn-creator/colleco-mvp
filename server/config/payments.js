const fs = require('fs');
const path = require('path');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Payment config] Failed to parse', filePath, err.message);
    return null;
  }
}

function getPaymentConfig() {
  const explicit = path.join(__dirname, 'payments.json');
  const example = path.join(__dirname, 'payments.example.json');
  const config = loadJson(explicit) || loadJson(example) || {};

  // Merge with env vars (env takes precedence)
  return {
    payfast: {
      merchantId: process.env.PAYFAST_MERCHANT_ID || config.payfast?.merchantId || '',
      merchantKey: process.env.PAYFAST_MERCHANT_KEY || config.payfast?.merchantKey || '',
      passphrase: process.env.PAYFAST_PASSPHRASE || config.payfast?.passphrase || '',
      sandbox: process.env.PAYFAST_SANDBOX === '1' || config.payfast?.sandbox !== false,
      returnUrl: process.env.PAYFAST_RETURN_URL || config.payfast?.returnUrl || 'https://staging.colleco.travel/pay/success',
      cancelUrl: process.env.PAYFAST_CANCEL_URL || config.payfast?.cancelUrl || 'https://staging.colleco.travel/pay/cancel',
      notifyUrl: process.env.PAYFAST_NOTIFY_URL || config.payfast?.notifyUrl || 'https://staging.colleco.travel/api/webhooks/payfast',
    },
    yoco: {
      secretKey: process.env.YOCO_SECRET_KEY || config.yoco?.secretKey || '',
      publicKey: process.env.YOCO_PUBLIC_KEY || config.yoco?.publicKey || '',
      testMode: process.env.YOCO_TEST_MODE === '1' || config.yoco?.testMode !== false,
      webhookSecret: process.env.YOCO_WEBHOOK_SECRET || config.yoco?.webhookSecret || '',
      successUrl: process.env.YOCO_SUCCESS_URL || config.yoco?.successUrl || 'https://staging.colleco.travel/pay/success',
      cancelUrl: process.env.YOCO_CANCEL_URL || config.yoco?.cancelUrl || 'https://staging.colleco.travel/pay/cancel',
    },
    defaultProcessor: config.defaultProcessor || 'payfast', // fallback if customer doesn't choose
  };
}

module.exports = { getPaymentConfig };
