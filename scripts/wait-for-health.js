/* eslint-disable no-console */
const http = require('http');
function waitFor(host, port, tries = 24) {
  return new Promise((resolve, reject) => {
    let i = 0;
    const tryOnce = () => {
      i++;
      const opt = { hostname: host, port: port, path: '/health', timeout: 2500 };
      const req = http.get(opt, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          console.log(`${host}:${port} ->`, res.statusCode, d);
          resolve(true);
        });
      });
      req.on('error', (e) => {
        if (i < tries) return setTimeout(tryOnce, 1000);
        console.error(`${host}:${port} ->`, e.message);
        reject(e);
      });
      req.on('timeout', () => {
        req.destroy();
        if (i < tries) return setTimeout(tryOnce, 1000);
        console.error(`${host}:${port} -> timeout`);
        reject(new Error('timeout'));
      });
    };
    tryOnce();
  });
}

(async () => {
  try {
  await waitFor('127.0.0.1', 4000);
  await waitFor('127.0.0.1', 5173);
    console.log('Both healthy');
    process.exit(0);
  } catch (e) {
    console.error('Health check failed', e && e.message);
    process.exit(2);
  }
})();
