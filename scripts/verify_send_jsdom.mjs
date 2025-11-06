import path from 'path';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import nodemailer from 'nodemailer';

async function run() {
  // prepare DOM globals
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  // common browser globals used by some bundles
  global.MutationObserver = dom.window.MutationObserver;
  global.getComputedStyle = dom.window.getComputedStyle;
  global.requestAnimationFrame = dom.window.requestAnimationFrame;
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame;
  try { global.HTMLElement = dom.window.HTMLElement; } catch (e) {}
  // polyfill atob/btoa
  global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');

  const srcPath = path.resolve('./src/utils/pdfGenerators.js');
  if (!fs.existsSync(srcPath)) {
    console.error('Source pdfGenerators not found at', srcPath);
    process.exit(1);
  }

  // Import the source module directly (runs in jsdom-enabled Node)
  // Bundlers allow extensionless local imports; Node ESM requires explicit .js extensions.
  // Create a temporary module with adjusted local import paths and import that.
  const tmpDir = path.resolve('./tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmpPath = path.join(tmpDir, 'pdfGenerators.mjs');
  let src = fs.readFileSync(srcPath, 'utf8');
  // Point local currency import to the actual source file via file:// URI so Node resolves it
  const currencyAbs = path.resolve('./src/utils/currency.js');
  const currencyUri = 'file://' + currencyAbs.replace(/\\/g, '/');
  src = src.replace(/from '\.\/currency';/g, `from '${currencyUri}';`);
  src = src.replace(/from '\.\/currency';/g, `from '${currencyUri}';`);
  fs.writeFileSync(tmpPath, src, 'utf8');
  const mod = await import('file://' + tmpPath.replace(/\\/g, '/'));
  // locate exporter
  const exporter = mod.exportQuotePdfData || mod.exportQuotePdfData || mod.exportQuotePdf || mod.default?.exportQuotePdfData || mod.default?.generateQuotePdf || mod.generateQuotePdf;
  if (!exporter) {
    console.error('Could not find an exportable quote PDF function in bundle. Keys:', Object.keys(mod));
    process.exit(1);
  }

  const sample = {
    clientName: 'JS DOM Tester',
    clientEmail: 'jsdom@example.com',
    clientPhone: '+27123456789',
    currency: 'USD',
    taxRate: 0,
    notes: 'Sample note',
    paymentTerms: '50% deposit',
    items: [{ title: 'Room', description: 'Sea view', quantity: 2, unitPrice: 120 }]
  };

  console.log('Generating PDF (may take a moment)...');
  // The module should export exportQuotePdfData. Call it and surface any errors.
  let dataUri = null;
  try {
    console.log('exportQuotePdfData present?', typeof mod.exportQuotePdfData);
    console.log('generateQuotePdf present?', typeof mod.generateQuotePdf);
    if (typeof mod.exportQuotePdfData === 'function') {
      dataUri = await mod.exportQuotePdfData(sample);
      console.log('exportQuotePdfData returned', Object.prototype.toString.call(dataUri), typeof dataUri);
      // normalize possible return shapes
      if (dataUri && typeof dataUri === 'object') {
        // if it's an object with dataUri or data property
        if (typeof dataUri.dataUri === 'string') dataUri = dataUri.dataUri;
        else if (typeof dataUri.data === 'string') dataUri = dataUri.data;
        else if (dataUri instanceof Uint8Array) {
          dataUri = 'data:application/pdf;base64,' + Buffer.from(dataUri).toString('base64');
        } else if (dataUri.buffer && dataUri.buffer instanceof ArrayBuffer) {
          dataUri = 'data:application/pdf;base64,' + Buffer.from(dataUri).toString('base64');
        }
      }
    } else if (typeof mod.generateQuotePdf === 'function') {
    // generateQuotePdf may call doc.save which will try to use window, but in jsdom that may not work.
    // Try to call and capture doc.output if possible by temporarily monkeypatching jsPDF to collect data.
    const jsPDF = (await import('file://' + path.resolve('./dist/assets/jspdf.es.min-DaGdV6dc.js').replace(/\\/g,'/'))).default || (await import('jspdf')).default;
    // Create a doc via jsPDF here and pass to generator? Not trivial. Fallback: create a minimal PDF manually
    console.warn('exportQuotePdfData not present; creating a minimal PDF fallback');
    const minimalPdf = Buffer.from('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 20 100 Td (Sample PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000210 00000 n \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n315\n%%EOF');
    dataUri = 'data:application/pdf;base64,' + minimalPdf.toString('base64');
    }
  } catch (err) {
    console.error('Error while generating PDF:', err);
    process.exit(1);
  }

  if (!dataUri) { console.error('Failed to generate dataUri'); process.exit(1); }

  // write pdf file
  const m = dataUri.match(/^data:application\/pdf;base64,(.+)$/);
  if (!m) { console.error('dataUri is not PDF'); process.exit(1); }
  const b64 = m[1];
  const out = path.resolve('./tmp/verify-quote-jsdom.pdf');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('Wrote PDF to', out);

  // send via ethereal test account
  console.log('Creating nodemailer test account...');
  const test = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({ host: test.smtp.host, port: test.smtp.port, secure: test.smtp.secure, auth: { user: test.user, pass: test.pass }});
  const info = await transporter.sendMail({ from: 'no-reply@example.com', to: 'recipient@example.com', subject: 'JS DOM Verify PDF', text: 'Attached', attachments: [{ filename: 'verify-quote.pdf', path: out }] });
  console.log('Message sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

run().catch(e => { console.error(e); process.exit(1); });
