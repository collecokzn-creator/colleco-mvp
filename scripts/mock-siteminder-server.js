#!/usr/bin/env node
// Tiny mock server for Siteminder-like endpoints. Run locally during dev:
// node scripts/mock-siteminder-server.js

/* eslint-disable no-console */
const http = require('http');
const url = require('url');
const MOCK_PORT = process.env.SITEMINDER_MOCK_PORT || 4015;
const mock = require('../src/api/__mocks__/siteminder.mock');

function readJson(req) {
  return new Promise((res, rej) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      if (!body) return res(null);
      try { res(JSON.parse(body)); } catch (e) { rej(e); }
    });
  });
}

const crypto = require('crypto');

const WEBHOOK_SECRET = process.env.SITEMINDER_WEBHOOK_SECRET || 'change-me-to-verify-webhooks';

const server = http.createServer(async (req, res) => {
  const p = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization,x-siteminder-signature');
  if (req.method === 'OPTIONS') return res.end();

  try {
    if (p.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'POST' && p.pathname === '/api/bookings') {
      const body = await readJson(req);
      const created = await mock.createBooking(body || {});
      res.writeHead(201, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(created));
    }

    if (req.method === 'PUT' && p.pathname.startsWith('/api/bookings/')) {
      const id = p.pathname.split('/').pop();
      const body = await readJson(req);
      const updated = await mock.updateBooking(id, body || {});
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(updated));
    }

    if (req.method === 'DELETE' && p.pathname.startsWith('/api/bookings/')) {
      const id = p.pathname.split('/').pop();
      const cancelled = await mock.cancelBooking(id);
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(cancelled));
    }

    if (req.method === 'GET' && p.pathname === '/api/availability') {
      // expects query: propertyId,startDate,endDate
      const params = p.query;
      const avail = await mock.getAvailability(params);
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(avail));
    }

    if (req.method === 'POST' && p.pathname === '/api/rates') {
      const body = await readJson(req);
      const resp = await mock.pushRates(body || {});
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(resp));
    }

    // Accept webhook callbacks from the app/CI. Validate HMAC signature if secret is set.
    if (req.method === 'POST' && p.pathname === '/api/webhook') {
      // read raw body for signature validation
      let raw = '';
      req.on('data', c => raw += c);
      await new Promise(r => req.on('end', r));
      const sig = req.headers['x-siteminder-signature'];
      if (WEBHOOK_SECRET) {
        const h = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw || '').digest('hex');
        if (!sig || (sig !== h && sig !== `sha256=${h}`)) {
          res.writeHead(401, { 'content-type': 'application/json' });
          return res.end(JSON.stringify({ ok: false, error: 'invalid_signature' }));
        }
      }
      // parse JSON body for convenience
      let parsed = null;
      try { parsed = raw ? JSON.parse(raw) : null; } catch (e) {/* ignore */}
      // For the mock, just acknowledge and optionally echo
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, received: parsed }));
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  } catch (err) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: (err && err.message) || 'server_error' }));
  }
});

server.listen(MOCK_PORT, () => console.log(`Mock Siteminder server listening on http://localhost:${MOCK_PORT}`));
