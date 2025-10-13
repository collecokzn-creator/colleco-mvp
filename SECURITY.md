
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it as soon as possible. We take all security issues seriously and will respond promptly.

- **Email:** security@travelcolleco.com
- **GitHub Issues:** Please do not publicly disclose vulnerabilities. Instead, open a private security advisory via GitHub's "Report a vulnerability" feature.

## Supported Versions

We support the latest major release. Older versions may not receive security updates.

| Version | Supported          |
| ------- | ----------------- |
| latest  | :white_check_mark:|
| older   | :x:               |

## Security Updates

We aim to fix any confirmed vulnerabilities as quickly as possible. Once a fix is available, we will notify affected users and update the repository.

## Best Practices

- Keep your dependencies up to date.
- Do not share sensitive credentials in issues or pull requests.
- Review third-party packages for security risks.

## Operational Guidance

This repository exposes a browser app (Vite + React) and a small Node API (Express) used for collaboration, contact forms, AI parsing, and events aggregation.

The API is hardened with:
- Helmet security headers
- Trust proxy enabled and `x-powered-by` disabled
- Restrictive CORS via `ALLOWED_ORIGINS`
- Global rate limiting (in addition to endpoint-level limits)
- Optional analytics logging toggle for AI (`AI_ANALYTICS`)

### Required environment (production)
Set these using your deployment platform's secret store. Do not commit secrets.

- `NODE_ENV=production`
- `API_TOKEN=<random-strong-token>`
- `ALLOWED_ORIGINS=https://your-domain.com,https://your-gh-pages-url`  (comma-separated)
- `AI_ANALYTICS=0`  (set to `1` only if you need disk analytics logs)
- Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`, `CONTACT_FROM`
- Optional: `TICKETMASTER_API_KEY`, `SEATGEEK_CLIENT_ID`

### Operational guidance
- Logs: Avoid logging PII; the contact endpoint falls back to appending JSONL entries if SMTP is not configured. Keep this file private or disable by configuring SMTP.
- Rate limiting: The API enforces a global rate limit and per-endpoint caps for AI and events. If you are behind a reverse proxy/CDN, ensure client IPs are forwarded so limits remain effective.
- CORS: Explicitly set `ALLOWED_ORIGINS` to your front-end origins.
- Auth: Routes guarded by `authCheck` require `Authorization: Bearer <API_TOKEN>` (or `?token=` query). In production, always set `API_TOKEN`.

## Contact

For urgent security matters, please use the email above. For general questions, use the standard issue tracker.
