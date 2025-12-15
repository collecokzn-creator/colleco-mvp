#!/usr/bin/env node
// Simple Yoco webhook management helper.
// Usage:
//   node yoco_manage_webhooks.js list
//   node yoco_manage_webhooks.js delete <webhook_id>

const fetch = globalThis.fetch || require('node-fetch');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', 'server', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const YOCO_SECRET = process.env.YOCO_SECRET_KEY;
const YOCO_API = process.env.YOCO_API_URL || 'https://payments.yoco.com/api';

if (!YOCO_SECRET) {
  console.error('YOCO_SECRET_KEY not found in server/.env.local. Set it before running this script.');
  process.exit(2);
}

async function listWebhooks() {
  const url = `${YOCO_API}/webhooks`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${YOCO_SECRET}` } });
  if (!res.ok) {
    const txt = await res.text();
    console.error('Failed to list webhooks:', res.status, txt);
    process.exit(1);
  }
  const data = await res.json();
  console.log('Existing webhooks:');
  if (!Array.isArray(data) || data.length === 0) {
    console.log('(none)');
    return;
  }
  data.forEach((w) => {
    console.log(`- id: ${w.id}`);
    console.log(`  url: ${w.url}`);
    console.log(`  events: ${w.events && w.events.join(', ')}`);
    console.log(`  created_at: ${w.created_at}`);
  });
}

async function deleteWebhook(id) {
  const url = `${YOCO_API}/webhooks/${id}`;
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${YOCO_SECRET}` } });
  const txt = await res.text();
  if (!res.ok) {
    console.error('Failed to delete webhook:', res.status, txt);
    process.exit(1);
  }
  console.log('Deleted webhook', id);
}

(async function main(){
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.log('Usage: node yoco_manage_webhooks.js list|delete <id>');
    process.exit(0);
  }
  const cmd = argv[0];
  try {
    if (cmd === 'list') {
      await listWebhooks();
    } else if (cmd === 'delete') {
      const id = argv[1];
      if (!id) { console.error('Missing webhook id'); process.exit(2); }
      // confirm
      console.log('About to delete webhook', id, '- run again to confirm');
      console.log('To actually delete, rerun with: node yoco_manage_webhooks.js delete-confirm', id);
    } else if (cmd === 'delete-confirm') {
      const id = argv[1];
      if (!id) { console.error('Missing webhook id'); process.exit(2); }
      await deleteWebhook(id);
    } else {
      console.log('Unknown command', cmd);
    }
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
