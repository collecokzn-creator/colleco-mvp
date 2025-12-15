#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env.local') });

const YOCO_KEY = process.env.YOCO_SECRET_KEY;
if (!YOCO_KEY) {
  console.error('YOCO_SECRET_KEY not found in server/.env.local. Please add it and re-run.');
  process.exit(2);
}

const webhookUrl = process.env.WEBHOOK_REG_URL || 'https://colleco-mvp-dev.loca.lt/api/webhooks/yoco';
const registerEndpoint = 'https://payments.yoco.com/api/webhooks';

(async () => {
  try {
    console.log('Registering webhook at', registerEndpoint);
    const resp = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'colleco-mvp-webhook', url: webhookUrl })
    });

    const text = await resp.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

    if (!resp.ok) {
      console.error('Yoco API returned error:', resp.status, resp.statusText);
      console.error('Response body:', text);
      process.exit(3);
    }

    // Attempt to find a secret in the response safely without printing it
    let secret = null;
    const searchForSecret = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      for (const k of Object.keys(obj)) {
        if (/secret|webhook_secret|signature/i.test(k) && typeof obj[k] === 'string') return obj[k];
        if (typeof obj[k] === 'object') {
          const found = searchForSecret(obj[k]);
          if (found) return found;
        }
      }
      return null;
    };

    secret = searchForSecret(data) || null;

    if (!secret) {
      console.log('Webhook registered, but no secret was found in response. Response saved to server/.env.local as last_registration_response.');
      // persist the raw response to .env.local for inspection (non-sensitive display)
      const envPath = path.join(__dirname, '..', 'server', '.env.local');
      fs.appendFileSync(envPath, `\n# yoco_last_registration_response=${Buffer.from(JSON.stringify(data)).toString('base64')}\n`);
      console.log('Saved encoded response to server/.env.local as yoco_last_registration_response (base64).');
      process.exit(0);
    }

    // Save secret into server/.env.local, replacing existing YOCO_WEBHOOK_SECRET if present
    const envPath = path.join(__dirname, '..', 'server', '.env.local');
    let env = fs.readFileSync(envPath, 'utf8');
    if (/^YOCO_WEBHOOK_SECRET=/m.test(env)) {
      env = env.replace(/^YOCO_WEBHOOK_SECRET=.*$/m, `YOCO_WEBHOOK_SECRET=${secret}`);
    } else {
      env = env.replace(/(YOCO_API_URL=.*$)/m, `$1\nYOCO_WEBHOOK_SECRET=${secret}`);
      if (!/YOCO_API_URL=/m.test(env)) env += `\nYOCO_WEBHOOK_SECRET=${secret}\n`;
    }
    fs.writeFileSync(envPath, env, { encoding: 'utf8' });

    // Confirm success without printing the secret
    console.log('Webhook registered successfully. Saved webhook secret to server/.env.local (not displayed here).');
  } catch (err) {
    console.error('Error while registering webhook:', err.message || err);
    process.exit(4);
  }
})();
