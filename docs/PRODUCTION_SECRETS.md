# Production Secrets & Deployment Checklist

This document lists the environment variables and secrets required to run CollEco in production, plus minimal instructions for adding them to CI/CD and hosting.

## Secrets (grouped by service)

- **Core / Server**:
  - `API_TOKEN` : Bearer token used by protected API endpoints
  - `VITE_API_BASE` : Backend URL used by frontend (example: https://api.colleco.travel)

- **Payments**:
  - PayFast:
    - `PAYFAST_MERCHANT_ID`
    - `PAYFAST_MERCHANT_KEY`
    - `PAYFAST_PASSPHRASE`
    - `PAYFAST_SANDBOX` (set to `0` in prod)
  - Yoco:
    - `YOCO_SECRET_KEY`
    - `YOCO_PUBLIC_KEY`
    - `YOCO_WEBHOOK_SECRET` (used to verify `X-Yoco-Signature`)
    - `YOCO_TEST_MODE` (set to `0` in prod)
  - Paystack (if used): `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET`

- **Push Notifications / Web Push**:
  - `VAPID_PRIVATE_KEY`
  - `VITE_VAPID_PUBLIC_KEY`
  - `VAPID_EMAIL`

- **Email / SMTP**:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `CONTACT_FROM` / `CONTACT_TO`

- **Events & Maps**:
  - `TICKETMASTER_API_KEY`
  - `SEATGEEK_CLIENT_ID`
  - `VITE_GOOGLE_MAPS_API_KEY`

- **Siteminder / Integrations**:
  - `SITEMINDER_API_URL`
  - `SITEMINDER_API_KEY`
  - `SITEMINDER_OAUTH_CLIENT_ID`
  - `SITEMINDER_OAUTH_CLIENT_SECRET`
  - `SITEMINDER_WEBHOOK_SECRET`

- **AI / Provider keys**:
  - `OPENAI_API_KEY` or provider-specific keys

## GitHub Actions / CI secret names (recommended)
- `COLLECO_API_TOKEN`
- `YOCO_SECRET_KEY` / `YOCO_PUBLIC_KEY` / `YOCO_WEBHOOK_SECRET`
- `PAYFAST_MERCHANT_ID` / `PAYFAST_MERCHANT_KEY` / `PAYFAST_PASSPHRASE`
- `VAPID_PRIVATE_KEY` / `VITE_VAPID_PUBLIC_KEY` / `VAPID_EMAIL`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`
- `TICKETMASTER_API_KEY` / `SEATGEEK_CLIENT_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

Set these in the repository settings → Secrets and variables → Actions (or your cloud provider's secret manager).

## Webhook & URL checklist
- Ensure production webhook endpoints are configured in provider consoles (Yoco, Siteminder, PayFast). Example webhook URL patterns:
  - `https://api.YOURDOMAIN/api/webhooks/yoco`
  - `https://api.YOURDOMAIN/api/webhooks/payfast`
- Verify webhook secrets (`YOCO_WEBHOOK_SECRET`, `SITEMINDER_WEBHOOK_SECRET`) match what's configured.

## Minimal steps to go live
1. Create a production environment (HTTPS-enabled) and DNS for `api.YOURDOMAIN` and `YOURDOMAIN`.
2. Add the secrets listed above to your hosting/CI secret store.
3. Set `YOCO_TEST_MODE=0` and any other `*_TEST_MODE=0` for payment processors.
4. Ensure `VITE_API_BASE` points at the production API and `VITE_PUBLIC_SITE_URL` is set if used.
5. Verify `API_TOKEN` is set and shared with any deploy/run scripts that need it.
6. Run integration smoke tests against a staging environment before switching live keys.

## Post-deploy checks
- Test a low-value payment and verify booking and webhook flows.
- Confirm emails are sent (SMTP) and push notifications register (VAPID).
- Monitor webhook delivery failures and set up alerts for 4xx/5xx rates.

## Security notes
- Never commit real secrets. Use `.env.example` for placeholders only.
- Rotate keys immediately if a secret was exposed in git history — coordinate a history purge if necessary.
- Limit secret scope in provider dashboards (restrict webhook IPs, HTTP referrers for maps keys).

## If you want, I can:
- Open a PR adding this file (branch + PR) — I will create `chore/add-production-secrets-doc` and open a PR.
- Draft GitHub Actions steps to read these secrets into deployments.

---
Generated: January 2026
