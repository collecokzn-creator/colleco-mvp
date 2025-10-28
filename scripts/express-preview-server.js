#!/usr/bin/env node
const express = require('express');
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));
const port = parseInt(argv.port || argv.p || process.env.PORT || '5174', 10);
const host = argv.host || '0.0.0.0';
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

const server = app.listen(port, host, () => {
  console.log(`Preview server listening on http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}`);
});

function shutdown(err) {
  if (err) console.error(err);
  console.log('Preview server shutting down...');
  server.close(() => process.exit(err ? 1 : 0));
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
process.on('uncaughtException', (err) => shutdown(err));
