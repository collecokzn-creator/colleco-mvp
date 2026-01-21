# CI Secrets & Sample GitHub Actions Job

This page explains which repository secrets to add for CI and provides a minimal GitHub Actions job example that uses those secrets to run the build and smoke tests.

## Recommended repository secrets
- `COLLECO_API_TOKEN` (maps to `API_TOKEN` in server)
- `YOCO_SECRET_KEY`, `YOCO_PUBLIC_KEY`, `YOCO_WEBHOOK_SECRET`
- `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`
- `VAPID_PRIVATE_KEY`, `VITE_VAPID_PUBLIC_KEY`, `VAPID_EMAIL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `TICKETMASTER_API_KEY`, `SEATGEEK_CLIENT_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

Add these under: Repository → Settings → Secrets and variables → Actions.

## Minimal GitHub Actions job (example)
Place this snippet in a workflow (`.github/workflows/ci-smoke.yml`) and update your hosting/deploy steps as required.

```yaml
name: CI Smoke

on: [push, pull_request]

jobs:
  build-and-smoke:
    runs-on: ubuntu-latest
    env:
      VITE_API_BASE: ${{ secrets.VITE_API_BASE }}
      API_TOKEN: ${{ secrets.COLLECO_API_TOKEN }}
      YOCO_SECRET_KEY: ${{ secrets.YOCO_SECRET_KEY }}
      YOCO_PUBLIC_KEY: ${{ secrets.YOCO_PUBLIC_KEY }}
      YOCO_WEBHOOK_SECRET: ${{ secrets.YOCO_WEBHOOK_SECRET }}
      PAYFAST_MERCHANT_ID: ${{ secrets.PAYFAST_MERCHANT_ID }}
      PAYFAST_MERCHANT_KEY: ${{ secrets.PAYFAST_MERCHANT_KEY }}
      PAYFAST_PASSPHRASE: ${{ secrets.PAYFAST_PASSPHRASE }}
      VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start server and run smoke tests
        run: |
          npm run smoke:build
          npm run smoke:start:stack &
          npx wait-on http://localhost:4010/health && npm run smoke:run

      # Optional: upload test artifacts
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

Notes:
- The workflow expects secrets to be configured; it does not write secrets to repo files.
- Adjust Node version and CI steps to match your environment.

## Next operational steps (manual)
- Add the listed secrets to GitHub Actions.
- Add production webhook URLs in provider consoles and set webhook secrets to match.
- Rotate any exposed keys and coordinate history purge if required.

If you'd like, I can add the workflow file directly and open a PR, or generate a shorter `README` with exact secret names for your ops team. Which would you prefer?
