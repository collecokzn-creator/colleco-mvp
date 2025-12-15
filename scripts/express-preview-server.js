#!/usr/bin/env node
/* eslint-disable no-console */
const express = require('express');
const path = require('path');
const compression = require('compression');

const argv = require('minimist')(process.argv.slice(2));
const port = parseInt(argv.port || argv.p || process.env.PORT || '5173', 10);
const host = argv.host || '::'; // prefer IPv6/dual-stack where available; fall back in code if needed
const dir = argv.dir || argv.d || path.join(process.cwd(), 'dist');

const app = express();

// Enable gzip/deflate compression
app.use(compression({ threshold: 1024 }));

// Simple proxy for API routes to local backend (useful for previewing SPA with backend)
app.use('/api', async (req, res, next) => {
  try {
    const backendBase = process.env.PREVIEW_API_BASE || 'http://127.0.0.1:4000';
    const target = backendBase + req.originalUrl;

    // Build fetch options
    const headers = Object.assign({}, req.headers);
    // Remove host to avoid proxy host mismatch
    delete headers.host;

    const opts = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Collect body
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) opts.body = Buffer.concat(chunks);
    }

    const backendRes = await fetch(target, opts);
    // Copy status and headers
    res.status(backendRes.status);
    backendRes.headers.forEach((v, k) => {
      // Skip hop-by-hop headers
      if (['transfer-encoding', 'connection'].includes(k.toLowerCase())) return;
      res.setHeader(k, v);
    });

    const arrayBuffer = await backendRes.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    res.send(buf);
  } catch (err) {
    console.error('API proxy error:', err && err.message);
    next(err);
  }
});

// Health endpoint for orchestration checks
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Serve static build with sensible cache headers
app.use(express.static(dir, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    const p = String(filePath);
    if (p.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
      return;
    }
    // Long cache for hashed assets (e.g., app.a1b2c3.js)
    if (/\.[a-f0-9]{8,}\.[a-z0-9]+$/i.test(p)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // Short cache for others
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(dir, 'index.html'));
});

// Try to bind to the preferred host. If that fails (platform differences), fall back to 0.0.0.0
let server;
try {
  server = app.listen(port, host, () => {
    const prettyHost = host === '::' ? '::1' : (host === '0.0.0.0' ? '127.0.0.1' : host);
    console.log(`Preview server listening on http://${prettyHost}:${port} (bound to ${host})`);
  });
} catch (e) {
  console.error('Failed to bind preview server to', host, '– falling back to 0.0.0.0', e && e.message);
  server = app.listen(port, '0.0.0.0', () => {
    console.log(`Preview server listening on http://127.0.0.1:${port} (bound to 0.0.0.0)`);
  });
}

function shutdown(err) {
  if (err) console.error(err);
  console.log('Preview server shutting down...');
  server.close(() => process.exit(err ? 1 : 0));
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
process.on('uncaughtException', (err) => shutdown(err));
