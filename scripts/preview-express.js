#!/usr/bin/env node
/* Lightweight stable preview server for `dist` built by Vite.
   - Serves static files from ./dist
   - Exposes GET /health -> 200 (used by E2E orchestration)
   - Listens on 0.0.0.0 to be reachable via localhost and 127.0.0.1
   - Keeps process alive and logs errors to stdout/stderr
*/
const express = require('express');
const path = require('path');

const port = Number(process.env.PORT || process.argv[2] || 5173);
const app = express();

// Health endpoint used by CI/local orchestration
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Serve static assets from dist
const distDir = path.join(process.cwd(), 'dist');
app.use(express.static(distDir, { index: false }));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html', err);
      res.status(500).end();
    }
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  const addr = server.address();
  console.log(`Preview server listening on http://${addr.address === '0.0.0.0' ? '127.0.0.1' : addr.address}:${addr.port}`);
});

function shutdown() {
  console.log('Preview server shutting down');
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// gracefully handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in preview server', err);
  process.exit(1);
});
