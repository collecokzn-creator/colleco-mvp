Puppeteer verification and local runner

Purpose
- Run a headless Chromium session to import the built `pdfGenerators` bundle, call the quote PDF exporter, write a sample PDF to `tmp/puppeteer-quote.pdf`, and print a Nodemailer preview URL for inspection.

Prerequisites
- Node.js >= 18
- npm install completed (devDependencies include `puppeteer`)
- A local build present (`dist/`) — run `npm run build` before the verification step.

Windows PowerShell (exact commands)
1. Build the app (produces `dist/`):

```powershell
npm run build
```

2. (Optional) Start the simple static server (the Puppeteer script can start an in-process server too):

```powershell
node scripts/simple_static_server.mjs
```

3. Run the Puppeteer verification:

```powershell
node scripts/puppeteer_verify.mjs
```

Expected outcome
- The script writes `tmp/puppeteer-quote.pdf` with a sample quote PDF (based on `exportQuotePdfData` behavior).
- The script will attempt to send the PDF via Nodemailer test account and will print a Preview URL (opens at https://ethereal.email) in the terminal.

Troubleshooting
- If Puppeteer cannot reach the local server (ERR_CONNECTION_REFUSED):
  - Ensure no firewall is blocking local HTTP on 127.0.0.1.
  - Try running the static server separately (step 2) and then run the verification script.
- If you see CORS or file:// blocked errors when running inline file:// pages, prefer to run the static server and let the verification script talk to `http://127.0.0.1:5174`.
- If the script fails with "runner did not initialise": double-check the `dist` build exists and contains `dist/assets/pdfGenerators-*.js`.

Notes
- The verification script was made robust to different export names (`exportQuotePdfData`, `generateQuotePdf`, or the minified/mangled exports) and will attempt to normalize different return types (data URI, ArrayBuffer, base64 fields).
- The PDF layout fixes live in `src/utils/pdfGenerators.js` and were rebuilt into `dist/` by `npm run build`.

If you'd like, I can open a PR with these changes and a short description. Let me know and I'll prepare the branch and commit metadata.