const crypto = require('crypto');
const fetch = globalThis.fetch || require('node-fetch');

const secret = process.env.YOCO_TEST_SECRET || 'test_webhook_secret_local';
// Allow passing the webhook URL as a CLI arg for reliable local testing
const webhookUrl = process.argv[2] || process.env.WEBHOOK_URL || 'https://colleco-mvp-dev.loca.lt/api/webhooks/yoco';
const payloadObj = { type: 'checkout.paid', data: { reference: 'TESTBOOKING123', amountInCents: 10000 } };
const payload = JSON.stringify(payloadObj);
const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

(async () => {
  try {
    console.log('Using secret:', secret);
    console.log('Computed signature:', sig);
    console.log('Posting to URL:', webhookUrl);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Yoco-Signature': sig,
      },
      body: payload,
    });
    const text = await res.text();
    console.log('HTTP status:', res.status);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error sending webhook:', err);
    process.exit(1);
  }
})();
