#!/usr/bin/env node
// Safe public webhook tester: loads server/.env.local for secret, does NOT print secret.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const envPath = path.join(__dirname, '..', 'server', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.error('[public-tester] server/.env.local not found; set YOCO_WEBHOOK_SECRET env or create the file.');
  process.exit(2);
}

const secret = process.env.YOCO_WEBHOOK_SECRET || process.env.YOCO_TEST_SECRET;
if (!secret) {
  console.error('[public-tester] YOCO_WEBHOOK_SECRET not set in server/.env.local');
  process.exit(2);
}

const webhookUrl = process.env.WEBHOOK_URL || process.argv[2] || '';
if (!webhookUrl) {
  console.error('[public-tester] Usage: WEBHOOK_URL="https://..." node send_test_webhook_public.js');
  process.exit(2);
}

const payloadObj = { type: 'checkout.paid', data: { reference: 'TESTBOOKING_PUBLIC', amountInCents: 10000 } };
const payload = JSON.stringify(payloadObj);
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

(async () => {
  try {
    console.log('[public-tester] Posting signed webhook to', webhookUrl);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Yoco-Signature': signature,
      },
      body: payload,
    });
    const text = await res.text();
    console.log('[public-tester] HTTP status:', res.status);
    console.log('[public-tester] Response body:', text);
  } catch (err) {
    console.error('[public-tester] Error sending webhook:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
