import { describe, it, expect } from 'vitest';
const http = require('http');
import getPort from 'get-port';

// helper to clear module cache
function freshRequire(p) {
  delete require.cache[require.resolve(p)];
  return require(p);
}

describe('siteminder wrapper retry/backoff', () => {
  it('retries on 429 and succeeds', async () => {
    const port = await getPort();
    let calls = 0;

    const server = http.createServer(async (req, res) => {
      if (req.url === '/bookings' && req.method === 'POST') {
        calls++;
        if (calls === 1) {
          // first call: 429 with Retry-After 1s
          res.writeHead(429, { 'Retry-After': '1', 'content-type': 'application/json' });
          return res.end(JSON.stringify({ error: 'rate_limited' }));
        }
        // subsequent: success
        let _body = '';
        for await (const chunk of req) _body += chunk;
        res.writeHead(201, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ id: 'real-1', status: 'confirmed', createdAt: new Date().toISOString() }));
      }
      res.writeHead(404); res.end();
    });

  await new Promise((r) => server.listen(port, r));

    process.env.SITEMINDER_USE_MOCK = '0';
    process.env.SITEMINDER_API_URL = `http://127.0.0.1:${port}`;
    // ensure fresh load
    const s = freshRequire('../src/api/siteminder');

    const booking = await s.createBooking({ propertyId: 'P1', guest: { firstName: 'T' } });
    expect(booking).toHaveProperty('providerBookingId');
    expect(calls).toBeGreaterThanOrEqual(2);
    await new Promise((r, rej) => server.close(err => err ? rej(err) : r()));
  }, 10000);

  it('retries on 5xx and then fails after retries exhausted', async () => {
    const port = await getPort();
    let calls = 0;

    const server = http.createServer(async (req, res) => {
      if (req.url === '/bookings' && req.method === 'POST') {
        calls++;
        // Always return 500
        res.writeHead(500, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ error: 'server_error' }));
      }
      res.writeHead(404); res.end();
    });

  await new Promise((r) => server.listen(port, r));

    process.env.SITEMINDER_USE_MOCK = '0';
    process.env.SITEMINDER_API_URL = `http://127.0.0.1:${port}`;
    const s = freshRequire('../src/api/siteminder');

    let threw = false;
    try {
      await s.createBooking({ propertyId: 'P1' });
    } catch (e) {
      threw = true;
      expect(e).toBeDefined();
    }
    expect(threw).toBe(true);
    expect(calls).toBeGreaterThanOrEqual(1);
    await new Promise((r, rej) => server.close(err => err ? rej(err) : r()));
  }, 10000);
});
