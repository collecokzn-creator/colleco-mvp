const http = require('http');
const fs = require('fs');
const path = require('path');

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 5173;
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
  res.writeHead(status, { 'Content-Type': type });
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(500);
    res.end('Server error');
  });
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
