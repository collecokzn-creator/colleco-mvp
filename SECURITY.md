# Security and Operations

This repository exposes a browser app (Vite + React) and a small Node API (Express) used for collaboration, contact forms, AI parsing, and events aggregation.

The API is hardened with:
- Helmet security headers
- Trust proxy enabled and `x-powered-by` disabled
- Restrictive CORS via `ALLOWED_ORIGINS`
- Global rate limiting (in addition to endpoint-level limits)
- Optional analytics logging toggle for AI (`AI_ANALYTICS`)

## Required environment (production)
Set these using your deployment platform's secret store. Do not commit secrets.

- `NODE_ENV=production`
- `API_TOKEN=<random-strong-token>`
- `ALLOWED_ORIGINS=https://your-domain.com,https://your-gh-pages-url`  (comma-separated)
- `AI_ANALYTICS=0`  (set to `1` only if you need disk analytics logs)
- Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`, `CONTACT_FROM`
- Optional: `TICKETMASTER_API_KEY`, `SEATGEEK_CLIENT_ID`

## Operational guidance
- Logs: Avoid logging PII; the contact endpoint falls back to appending JSONL entries if SMTP is not configured. Keep this file private or disable by configuring SMTP.
- Rate limiting: The API enforces a global rate limit and per-endpoint caps for AI and events. If you are behind a reverse proxy/CDN, ensure client IPs are forwarded so limits remain effective.
- CORS: Explicitly set `ALLOWED_ORIGINS` to your front-end origins.
- Auth: Routes guarded by `authCheck` require `Authorization: Bearer <API_TOKEN>` (or `?token=` query). In production, always set `API_TOKEN`.

## Reporting a vulnerability
Email the maintainers (see package.json `author` or use the contact address configured in env). Please include reproduction steps and affected endpoints. We will acknowledge within 72 hours and provide an ETA for fixes.
