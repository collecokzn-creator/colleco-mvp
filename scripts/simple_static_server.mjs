import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const port = process.env.PORT ? Number(process.env.PORT) : 5174;
const dist = path.resolve('./dist');

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url);
    let safe = decodeURIComponent(parsed.pathname);
    if (safe === '/' || safe.endsWith('/')) safe = '/index.html';
    const file = path.join(dist, safe.replace(/^\//, ''));
    if (!file.startsWith(dist)) {
      res.statusCode = 400; res.end('Bad request'); return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      const ext = path.extname(file).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    } else {
      // fallback to index.html for SPA routes
      const index = path.join(dist, 'index.html');
      if (fs.existsSync(index)) {
        res.setHeader('Content-Type', 'text/html');
        fs.createReadStream(index).pipe(res);
      } else {
        res.statusCode = 404; res.end('Not found');
      }
    }
  } catch (e) { res.statusCode = 500; res.end('Server error'); }
});

server.listen(port, '127.0.0.1', () => console.log('Static server listening on http://127.0.0.1:'+port));

process.on('SIGINT', ()=>{ server.close(()=>process.exit(0)); });
