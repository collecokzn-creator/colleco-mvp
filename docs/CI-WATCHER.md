CI watcher and diagnostics

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
