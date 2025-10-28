#!/usr/bin/env node
const express = require('express');
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));
const port = parseInt(argv.port || argv.p || process.env.PORT || '5174', 10);
const host = argv.host || '::'; // prefer IPv6/dual-stack where available; fall back in code if needed
const dir = argv.dir || argv.d || path.join(process.cwd(), 'dist');

const app = express();

// Health endpoint for orchestration checks
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Serve static build
app.use(express.static(dir, { extensions: ['html'] }));

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
