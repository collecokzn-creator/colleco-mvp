PDF bundle smoke workflow
=========================

This repository includes a lightweight GitHub Actions workflow that runs a Node-only smoke test to ensure the Vite build produced the PDF bundle used by runtime verification (the `pdfGenerators` bundle).

Why this exists
- The full Puppeteer/Playwright E2E smoke is valuable but heavy and can be flaky on PRs. A small Node-only check is fast, deterministic, and fails fast when a build artifact is missing or unexpectedly small.

What it does
- Runs `npm ci` and `npm run build`
- Executes the single vitest test `tests/pdfBundle.test.js` which asserts `dist/assets/pdfGenerators-*.js` exists and is non-trivial in size (or contains a jspdf marker).

How to run locally
-------------------
Run these commands in PowerShell (Windows) or your shell of choice:

```pwsh
npm ci
npm run build
npx vitest run tests/pdfBundle.test.js --reporter dot
```

Follow-ups
- If you want actual browser-level verification in CI, use a separate workflow that runs Puppeteer/Playwright on ubuntu-latest and ensures Chrome is available (or uses the Playwright GitHub Action). That should be scheduled or run on demand to avoid PR flakiness.
