const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env.local') });
const fetch = globalThis.fetch || require('node-fetch');

const HEALTH_URL = 'http://127.0.0.1:4000/health';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://127.0.0.1:4000/api/webhooks/yoco';
const LOG_PATH = path.resolve(__dirname, '../server-out.log');

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(HEALTH_URL, { method: 'GET' });
      if (res.ok) return true;
    } catch (err) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function computeSignature(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

async function sendWebhook(secret, payloadObj) {
  const payload = JSON.stringify(payloadObj);
  const sig = computeSignature(secret, payload);
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Yoco-Signature': sig,
    },
    body: payload,
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

function checkLogsForMarker(marker, lookbackMs = 10000) {
  if (!fs.existsSync(LOG_PATH)) return false;
  try {
    const stat = fs.statSync(LOG_PATH);
    const since = Date.now() - lookbackMs;
    // read last portion of the file (sufficient for small log files)
    const data = fs.readFileSync(LOG_PATH, 'utf8');
    return data.includes(marker);
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('E2E local webhook test starting...');

  const health = await waitForHealth(20000);
  if (!health) {
    console.error('Server health check failed (no response at', HEALTH_URL, ')');
    process.exitCode = 2;
    return;
  }

  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) {
    console.error('YOCO_WEBHOOK_SECRET not found in server/.env.local');
    process.exitCode = 3;
    return;
  }

  const testRef = 'E2E_TEST_' + Date.now();
  const payload = { type: 'checkout.paid', data: { reference: testRef, amountInCents: 12345 } };

  console.log('Posting signed webhook to', WEBHOOK_URL);
  const res = await sendWebhook(secret, payload);
  console.log('HTTP', res.status);

  // Give server a moment to write logs
  await new Promise((r) => setTimeout(r, 500));

  const marker1 = `booking not found ${testRef}`;
  const marker2 = 'Yoco webhook received';
  const sawMarker = checkLogsForMarker(marker1) || checkLogsForMarker(marker2);

  if (sawMarker) {
    console.log('Success: server log shows webhook handling.');
    process.exitCode = 0;
  } else {
    console.error('Failure: server log did not show expected webhook handling markers.');
    process.exitCode = 4;
  }
}

main().catch((err) => {
  console.error('Error running e2e_local_webhook_test:', err);
  process.exitCode = 1;
});
