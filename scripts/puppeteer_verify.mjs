import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import http from 'http';
import url from 'url';

async function run() {
  const assetsDir = path.resolve('./dist/assets');
  if (!fs.existsSync(assetsDir)) throw new Error('dist/assets not found — run npm run build first');
  const files = fs.readdirSync(assetsDir);
  const pdfGenFile = files.find(f => f.startsWith('pdfGenerators') && f.endsWith('.js'));
  if (!pdfGenFile) throw new Error('pdfGenerators bundle not found in dist/assets');

  // Use a file:// URL to load the built index (avoids needing a local HTTP server)
  const distIndex = path.resolve('./dist/index.html');
  const serverUrl = 'file:///' + distIndex.replace(/\\\\/g, '/');
  // Use a relative import path so the module resolves relative to the loaded index.html
  const modulePath = `./assets/${pdfGenFile}`;

  console.log('Using pdfGenerators module:', modulePath);
  console.log('Launching headless Chrome...');
  // Start an in-process static server to serve ./dist on 127.0.0.1:5174 so module imports over HTTP work
  const port = process.env.PUPPETEER_PORT ? Number(process.env.PUPPETEER_PORT) : 5174;
  const dist = path.resolve('./dist');
  const mime = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2'
  };
  const server = http.createServer((req, res) => {
    try {
      const parsed = url.parse(req.url);
      let safe = decodeURIComponent(parsed.pathname);
      if (safe === '/' || safe.endsWith('/')) safe = '/index.html';
      const file = path.join(dist, safe.replace(/^\//, ''));
      if (!file.startsWith(dist)) { res.statusCode = 400; res.end('Bad request'); return; }
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const ext = path.extname(file).toLowerCase();
        res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      } else {
        const index = path.join(dist, 'index.html');
        if (fs.existsSync(index)) {
          res.setHeader('Content-Type', 'text/html');
          fs.createReadStream(index).pipe(res);
        } else { res.statusCode = 404; res.end('Not found'); }
      }
    } catch (e) { res.statusCode = 500; res.end('Server error'); }
  });
  await new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', (err) => err ? reject(err) : resolve());
  });
  console.log(`In-process static server listening on http://127.0.0.1:${port}`);
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  // forward browser console and errors to the node console for debugging
  page.on('console', msg => {
    try { console.log('PAGE LOG>', msg.text()); } catch (e) {}
  });
  page.on('pageerror', err => {
    try { console.log('PAGE ERROR>', err && err.message ? err.message : String(err)); } catch (e) {}
  });
  // navigate to root so static server's base resolves
  await page.goto(serverUrl, { waitUntil: 'load', timeout: 60000 });

  // Create a small runner HTML that imports the built bundle as a module and exposes
  // a stable window._exportQuote function we can call from evaluate. We write it into tmp/.
  const runnerDir = path.resolve('./dist');
  fs.mkdirSync(runnerDir, { recursive: true });
  const runnerPath = path.join(runnerDir, 'puppeteer-runner.html');
  const runnerRelModule = `./assets/${pdfGenFile}`;
  const runnerHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Puppeteer PDF Runner</title>
  </head>
  <body>
    <script type="module">
      import * as mod from '${runnerRelModule}';
      // prefer named export exportQuotePdfData, fallbacks to common mangled names
      window._exportQuote = mod.exportQuotePdfData || mod.generateQuotePdf || mod.e || mod.a || (mod.default && (mod.default.exportQuotePdfData || mod.default.generateQuotePdf));
      window._ready = true;
    </script>
    <div id="status">ready</div>
  </body>
</html>`;
  fs.writeFileSync(runnerPath, runnerHtml, 'utf8');

  // Pre-patch the page to prevent module code from triggering a navigation/download
  // (some bundled functions call jsPDF.save which can trigger an anchor click/navigation)
  await page.evaluate(() => {
    try { HTMLAnchorElement.prototype.click = function() {}; } catch (e) {}
    try { window.open = () => {}; } catch (e) {}
    try { URL.createObjectURL = () => 'about:blank'; } catch (e) {}
    try { window._origLocationAssign = window.location.assign; window.location.assign = () => {}; } catch (e) {}
  });

  // Intercept file:// requests that the module may perform and serve them from disk
  await page.setRequestInterception(true);
  page.on('request', req => {
    try {
      const u = req.url();
      if (u.startsWith('file:///')) {
        // map file:///C:/.../dist/... -> ./dist/...
        const filePath = decodeURIComponent(u.replace('file:///', ''));
        // On Windows the path may start with C:/ so ensure absolute
        if (fs.existsSync(filePath)) {
          const body = fs.readFileSync(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const ct = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.json':'application/json' }[ext] || 'application/octet-stream';
          req.respond({ status: 200, headers: { 'Content-Type': ct }, body });
          return;
        }
      }
    } catch (e) {
      // fallthrough to continue
    }
    req.continue();
  });

  // Evaluate in page: load the runner HTML (file://) so it imports the module via a module script
  const sample = {
    clientName: 'Headless Tester',
    clientEmail: 'headless@example.com',
    clientPhone: '+27123456789',
    currency: 'USD',
    taxRate: 0,
    notes: 'Generated by puppeteer verification',
    paymentTerms: '50% deposit',
    items: [ { title: 'Sample Room', description: 'Sea view', quantity: 2, unitPrice: 120 } ]
  };
  console.log('Loading runner page and calling exportQuotePdfData...');
  const runnerHttpUrl = `http://127.0.0.1:${port}/puppeteer-runner.html`;
  await page.goto(runnerHttpUrl, { waitUntil: 'load', timeout: 60000 });

  const dataUri = await page.evaluate(async (sample) => {
    try {
      // wait until runner sets window._exportQuote
      const start = Date.now();
      while (!window._exportQuote) {
        if (Date.now() - start > 10000) throw new Error('runner did not initialise');
        await new Promise(r => setTimeout(r, 50));
      }
      const fn = window._exportQuote;
      if (!fn) throw new Error('export function not found in runner');
      const res = await fn(sample);
      return res || null;
    } catch (e) {
      return { __error: String(e && e.message ? e.message : e) };
    }
  }, sample);

  if (!dataUri) throw new Error('Module returned no data URI');
  if (dataUri && dataUri.__error) throw new Error('Browser evaluation error: ' + dataUri.__error);

  // normalize in case a Uint8Array was returned
  let finalDataUri = dataUri;
  console.log('DEBUG: raw dataUri from page.evaluate ->', typeof dataUri === 'string' ? (dataUri.slice(0,80) + (dataUri.length>80? '...':'') ) : JSON.stringify(dataUri));
  if (dataUri instanceof Object && !(typeof dataUri === 'string')) {
    // attempt convert
    try {
      const b = Buffer.from(await (async () => dataUri)());
      finalDataUri = 'data:application/pdf;base64,' + b.toString('base64');
    } catch (e) {}
  }

  // Save PDF locally
  const m = finalDataUri.match(/^data:application\/pdf[^,]*;base64,(.+)$/);
  if (!m) {
    await browser.close();
    throw new Error('Returned data is not a PDF data URI');
  }
  const b64 = m[1];
  const out = path.resolve('./tmp/puppeteer-quote.pdf');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('Wrote PDF to', out);

  // Send via nodemailer test account
  const test = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({ host: test.smtp.host, port: test.smtp.port, secure: test.smtp.secure, auth: { user: test.user, pass: test.pass }});
  const info = await transporter.sendMail({ from: 'no-reply@example.com', to: 'recipient@example.com', subject: 'Puppeteer Verify Quote', text: 'Attached', attachments: [{ filename: 'puppeteer-quote.pdf', path: out }] });
  console.log('Message sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  await browser.close();
}

run().catch(err => { console.error(err); process.exit(1); });
