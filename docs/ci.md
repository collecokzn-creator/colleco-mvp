# CI for Colleco MVP

This document explains the E2E CI flows added to the repository and guidelines for keeping tests stable and cheap.

Workflows

1. `E2E PR Smoke` (.github/workflows/e2e-pr-smoke.yml)
   - Trigger: `pull_request` against `main`.
   - Purpose: fast feedback for PRs. Runs a lightweight smoke E2E spec (`cypress/e2e/smoke.cy.js`) and a small navbar regression spec (`cypress/e2e/nav_mobile.cy.js`) against the dev server.
   - When to use: default for PRs; helps catch obvious regressions quickly.

2. `E2E Cypress Tests (full)` (.github/workflows/e2e.yml)
   - Trigger: `push` to `main` only.
   - Purpose: full matrix run (Electron + Chrome) running the full Cypress suite against the dev server. Uploads artifacts on failure.
   - When to use: main branch validation; run after merge or as an explicit push.

Recommendations

- Keep PR-run smoke tests small and fast. Use unit/integration tests for fine-grained logic.
- Use `window.__E2E__` and `data-e2e-*` attributes in app code to expose stable hooks and avoid fragile selectors.
- When adding tests that rely on third-party services, prefer demo/stubbed endpoints or record fixtures.
- Capture debug artifacts on test failure: screenshots, Cypress videos, DOM snapshots in `cypress/logs`.

CI tuning

- To reduce runtime, limit the full matrix to run only on scheduled builds or on merges to `main`.
- Cache `~/.npm` (already configured) for faster installs.

If you'd like, I can add automatic reruns for flaky tests or a separate job that uploads artifacts to an S3 bucket for long-term storage.

Test robustness notes

- Prefer host-agnostic network intercepts in Cypress tests (for example: `cy.intercept('POST', '**/api/ai/itinerary')`) so tests do not break when the dev server or API runs on a different host or port in CI. This reduces brittle assumptions about API_BASE values.
- When debugging CI failures locally, start the API and dev server and run Cypress headless to reproduce: set `VITE_API_BASE` when starting the dev server if needed and poll http://127.0.0.1:5173 until it's ready before running `npx cypress run`.

Local troubleshooting snippet (PowerShell):

```powershell
# start API on 4001 and Vite bound to 127.0.0.1
$env:PORT='4001'; Start-Process node -ArgumentList 'server/server.js' -WorkingDirectory (Get-Location) -NoNewWindow
$env:VITE_API_BASE='http://127.0.0.1:4001'; npm run dev
# in a new terminal, wait for vite then run Cypress
for ($i=0; $i -lt 60; $i++) { try { Invoke-WebRequest -Uri 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2; break } catch { Start-Sleep -Seconds 1 } }
npx cypress run --config video=false
```
