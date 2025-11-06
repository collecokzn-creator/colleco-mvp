import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

const distFile = path.resolve('./dist/assets/pdfGenerators-BApMBaRZ.js');

async function run() {
  if (!fs.existsSync(distFile)) {
    console.error('dist pdfGenerators bundle not found, please run `npm run build` first');
    process.exit(1);
  }

  // Dynamic import of the built bundle
  const mod = await import('file://' + distFile.replace(/\\/g, '/'));
  const exporter = mod.exportQuotePdfData || mod.exportQuotePdfData || mod.default?.exportQuotePdfData;
  if (!exporter) {
    console.error('exportQuotePdfData not found in built module. Available keys:', Object.keys(mod));
    process.exit(1);
  }

  const sample = {
    clientName: 'E2E Tester',
    clientEmail: 'tester@example.com',
    clientPhone: '+27123456789',
    currency: 'USD',
    taxRate: 0,
    notes: 'This is a sample quote generated during verification.',
    paymentTerms: '50% upfront, balance 14 days before travel.',
    items: [
      { title: 'Sample Room', description: 'Sea view', quantity: 2, unitPrice: 120 },
      { title: 'Airport Transfer', description: 'Return', quantity: 1, unitPrice: 40 },
    ]
  };

  console.log('Calling exportQuotePdfData...');
  const dataUri = await exporter(sample);
  if (!dataUri) {
    console.error('exportQuotePdfData returned null');
    process.exit(1);
  }

  // write PDF file
  const m = dataUri.match(/^data:application\/pdf;base64,(.+)$/);
  if (!m) {
    console.error('Unexpected dataUri format (not application/pdf)');
    process.exit(1);
  }
  const b64 = m[1];
  const buf = Buffer.from(b64, 'base64');
  const outPath = path.resolve('./tmp/verify-quote.pdf');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log('Wrote PDF to', outPath, 'size', buf.length);

  console.log('Creating nodemailer test account...');
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });

  console.log('Sending test email with PDF attachment...');
  const info = await transporter.sendMail({
    from: 'no-reply@example.com',
    to: 'recipient@example.com',
    subject: 'Test Quote - verification',
    text: 'Please find attached the test quote PDF.',
    attachments: [{ filename: 'verify-quote.pdf', content: buf }]
  });

  console.log('Message sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

run().catch(err => { console.error(err); process.exit(1); });
