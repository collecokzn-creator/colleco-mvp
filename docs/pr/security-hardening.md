# PR: CI/Lint/Build fixes, PWA, and Security Hardening

## Summary
- Fix SPA deep-link 404s on GitHub Pages by enabling hash routing in CI (VITE_USE_HASH=1) and honoring base path (VITE_BASE_PATH).
- Correct PWA manifest path and service worker registration; ensure manifest served from `/manifest.webmanifest`.
- Resolve UI overlap under fixed header/footer with consistent layout tokens (padding-top and z-index policy) and add UX helpers (back-to-top, connectivity UI).
- Establish CI on Node 20: `npm ci`, `npm run lint`, `npm test`, `npm run build`.
- Clean ESLint issues across pages/components; reach 0 errors/0 warnings; all tests pass and Vite build succeeds.
- Harden Express backend with Helmet, restrictive CORS via `ALLOWED_ORIGINS`, a global rate limiter, and production warnings for missing `API_TOKEN`.
- Add SECURITY.md, server/.env.example, and PR template with a security checklist.

## Details
- Routing/Hosting
  - HashRouter used on Pages to prevent 404 on deep links; BrowserRouter remains in dev.
  - Pages workflow uses VITE_BASE_PATH and VITE_USE_HASH to build correctly for /<repo>/.
  - Disabled legacy Jekyll workflow to avoid serving raw JSX.
- PWA
  - Manifest placed at `/public/manifest.webmanifest` and linked as `/manifest.webmanifest`.
  - Service worker registers after window load; cache version bumped and offline fallback included.
- Layout
  - Root layout adds header/banners height into page padding; z-index policy documented in README.
- CI/Quality
  - ESLint pinned at 8.57.x with react/react-hooks; Vitest + jsdom.
  - CI runs lint, tests, and build on PRs; artifacts verified.
- Backend Security
  - Helmet headers + trust proxy; `x-powered-by` disabled.
  - CORS restricted via `ALLOWED_ORIGINS` (comma-separated).
  - Global rate limiter applied (except /events and /health).
  - Optional AI analytics log controlled by `AI_ANALYTICS` env.
  - Warns if `API_TOKEN` is missing in production; `authCheck` guards protected routes.

## Environment
Set in deployment/secrets (do not commit):
- `NODE_ENV=production`
- `API_TOKEN=<strong-random-token>`
- `ALLOWED_ORIGINS=https://your-domain.com,https://<user>.github.io/<repo>`
- Optional: SMTP_* for contact mail; Ticketmaster/SeatGeek keys for events.

## Validation
- ESLint: 0 errors/0 warnings
- Tests: all pass
- Build: Vite production build succeeds
- Local server: starts with security middleware; falls back if port occupied

## Rollout
- After merge, ensure Pages redeploys from main; confirm hash routes work.
- For backend deployment, set envs above; verify /health, CORS preflight, and protected endpoints require token.

## Screenshots/Notes
- N/A
