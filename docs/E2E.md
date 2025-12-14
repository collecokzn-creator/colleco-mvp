# Running E2E locally

This document explains how to run the full E2E suite locally using Playwright.

## Quick Start

Steps (Windows / PowerShell):

```powershell
# Ensure ports are free (4010, 5173)
netstat -ano | Select-String ':4010' | ForEach-Object { if ($_ -match '(\d+)$') { Stop-Process -Id ([int]$matches[1]) -Force -ErrorAction SilentlyContinue } }
netstat -ano | Select-String ':5173' | ForEach-Object { if ($_ -match '(\d+)$') { Stop-Process -Id ([int]$matches[1]) -Force -ErrorAction SilentlyContinue } }

# Install Playwright browsers (first time only)
npx playwright install --with-deps chromium

# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/smoke.spec.ts

# Run with UI mode (interactive debugging)
npm run test:e2e:ui

# Run in headed mode (see the browser)
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug
```

Steps (Linux / macOS):

```bash
# free ports if needed (example using lsof)
sudo lsof -ti :4010 | xargs -r kill -9
sudo lsof -ti :5173 | xargs -r kill -9

# Install Playwright browsers (first time only)
npx playwright install --with-deps chromium

# Run all E2E tests
npm run test:e2e
```

## Running with Services

For full integration testing, start the backend and frontend first:

```powershell
# Build the frontend
npm run build

# Start backend API (port 4010)
$env:PORT=4010; node server/server.js

# In another terminal, start preview server (port 5173)
npm run preview:stable

# In another terminal, run tests
npm run test:e2e
```

Or use the smoke test scripts which handle service orchestration:

```powershell
# Build, start services, and run smoke tests
npm run smoke:all

# Build, start services, and run mobile tests
npm run mobile:all
```

## CI watcher and diagnostics

The repository includes a small repo-wide watcher that can poll recent GitHub Actions workflow runs and download artifacts for any failing run into `artifacts/triage/run-<id>/`.

Script: `scripts/ci-watch-all.ps1`

Usage examples (PowerShell):

- Default run (4 hours):

	pwsh ./scripts/ci-watch-all.ps1

- Run for 30 minutes (backwards-compatible `-minutes` argument):

	pwsh ./scripts/ci-watch-all.ps1 -minutes 30

- Short run for 2 hours:

	pwsh ./scripts/ci-watch-all.ps1 -Hours 2

- Create GitHub issues for failing runs (opt-in):

	pwsh ./scripts/ci-watch-all.ps1 -Hours 4 -CreateIssues

Notes:
- Issue creation is opt-in. When `-CreateIssues` is passed, the watcher will attempt to create a GitHub issue per failing run with basic metadata and an artifacts path. Make sure `gh` is installed and authenticated and you have permission to create issues.
- Artifacts collected include `log.txt`, `download.log`, the downloaded artifact files, and `meta.json` with run metadata.

Triaging artifacts

- Artifacts are saved under `artifacts/triage/run-<id>/` and include `log.txt`, `download.log`, downloaded artifact bundles, and `meta.json` with run metadata.
- When a login or UI test fails in headless CI, check screenshots and the recorded logs first. If more information is needed, re-run the PR with the `e2e-diag` label so CI will run the diagnostic E2E job with `CI_E2E_DIAG=1` enabled.

Quick checklist for maintainers

- Use short durations for local runs when triaging (e.g., `-Hours 1`).
- Don't enable `-CreateIssues` as a global schedule; prefer manual runs when you want issues created.
- Keep `CI_E2E_DIAG` gated to avoid noisy logs in routine CI runs.

## Artifact pruning (safe cleanup)

Collected triage artifacts can grow over time. We provide a small pruning helper to remove old `artifacts/triage/run-*` folders.

Script: `scripts/prune-triage.ps1`

Usage (PowerShell):

- Dry-run (default):

	pwsh ./scripts/prune-triage.ps1 -Days 30

- Actually delete (explicit):

	pwsh ./scripts/prune-triage.ps1 -Days 30 -DryRun:$false

Notes & safety

- The script defaults to dry-run to avoid accidental deletions. Always inspect output before running with `-DryRun:$false`.
- The script performs safety checks and will refuse to run if the target path doesn't look like a triage artifacts folder.
- Recommended retention: 30 days. Adjust the `-Days` value for your needs.


Steps (Linux / macOS):

```bash
# free ports if needed (example using lsof)
sudo lsof -ti :4010 | xargs -r kill -9
sudo lsof -ti :5174 | xargs -r kill -9

npm run e2e:orchestrate
```

Notes
- Playwright artifacts (reports, screenshots, traces) are saved to `playwright-report/` and `test-results/`
- On CI we use `.github/workflows/e2e.yml` which runs Playwright tests on push and PRs to `main`
- If you prefer to start services manually: build (`npm run build`), then start API (`cross-env PORT=4010 node server/server.js`) and preview (`npm run preview:stable`) and then run Playwright via `npx playwright test`
- Use `npx playwright show-report` to view the HTML report after a test run

## Playwright Configuration

The test configuration is in [playwright.config.ts](../playwright.config.ts) and includes:

- **Base URL**: `http://127.0.0.1:5173` (configurable via `PLAYWRIGHT_BASE_URL`)
- **Retries**: 2 retries on CI, 0 locally
- **Browsers**: Chromium (default), Firefox, WebKit
- **Mobile viewports**: iPhone SE, iPhone 12, Galaxy S5
- **Timeouts**: 60s navigation, 12s action
- **Artifacts**: Screenshots on failure, traces on first retry, videos on failure
