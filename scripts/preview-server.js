const http = require('http');
const fs = require('fs');
const path = require('path');

// Accept host/port from env or CLI args. CLI args (--host, --port) override env.
const argv = require('process').argv.slice(2);
function parseArg(name) {
  const idx = argv.findIndex(a => a === `--${name}` || a === `-${name}`);
  if (idx >= 0 && idx + 1 < argv.length) return argv[idx + 1];
  const kv = argv.find(a => a.startsWith(`--${name}=`));
  if (kv) return kv.split('=')[1];
  return undefined;
}
const host = parseArg('host') || process.env.HOST || '127.0.0.1';
const port = Number(parseArg('port') || process.env.PORT || 5173);
const distDir = path.join(__dirname, '..', 'dist');

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mime[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);

  // If the stream errors, log and respond only if headers haven't been sent yet.
  stream.on('error', (err) => {
    console.error('Error streaming file', filePath, err && err.stack);
    if (!res.headersSent) {
      try {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      } catch (e) {
        // best-effort - nothing more we can do
      }
    } else {
      // If headers already sent, just ensure the response is ended.
      try { res.end(); } catch (e) {}
    }
  });

  // If client closes the connection, destroy the file stream to avoid leaks.
  res.on('close', () => {
    try { stream.destroy(); } catch (e) {}
  });

  // Send headers and pipe the file stream to the response.
  res.writeHead(status, { 'Content-Type': type });
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(distDir, urlPath);
    // If path ends with /, serve index.html
    if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
    // If file exists and is a file, serve it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      console.log(`HTTP ${new Date().toISOString()} ${req.socket.remoteAddress} GET ${urlPath}`);
      sendFile(res, filePath);
      return;
    }
    // If the request looks like a static asset with extension but missing, return 404
    if (path.extname(urlPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    // Otherwise, serve index.html for SPA routes
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`HTTP ${new Date().toISOString()} ${req.socket.remoteAddress} GET ${urlPath} -> index.html`);
      sendFile(res, indexPath);
      return;
    }
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('No index');
  } catch (e) {
    console.error('Error serving request', e && e.stack);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Preview server listening on http://${host}:${port}`);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception', err);
  process.exit(1);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection', err);
  process.exit(1);
});
