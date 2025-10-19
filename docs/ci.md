# CI for Colleco MVP

This document explains the E2E CI flows added to the repository and guidelines for keeping tests stable and cheap.

Workflows

1. `E2E PR Smoke` (.github/workflows/e2e-pr-smoke.yml)
   - Trigger: `pull_request` against `main`.
   - Purpose: fast feedback for PRs. Runs a lightweight smoke E2E spec (`cypress/e2e/smoke.cy.js`) against the dev server.
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
