# Maintainers Guide

## Branch protection & required checks

To ensure high-quality merges into `main`, enable branch protection in the repository settings:

1. Settings → Branches → Branch protection rules → Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require a pull request before merging
   - Require approvals (1+)
   - Dismiss stale approvals when new commits are pushed (optional)
   - Require status checks to pass before merging
     - Select required checks:
       - `CI` (lint, unit/integration tests, build)
       - `E2E Smoke` (Cypress)
       - `Deploy Vite site to GitHub Pages` (optional, for main branch only)
   - Require conversation resolution before merging
   - Require signed commits (optional)
4. Save changes.

## CODEOWNERS & review routing
- The `.github/CODEOWNERS` file routes default reviews to `@collecokzn-creator`. Add teammates or paths as needed.

## Security & operations
- Keep `API_TOKEN` rotated periodically.
- Maintain `ALLOWED_ORIGINS` to the frontend origins only.
- Review `SECURITY.md` for headers, CORS, rate limiting and environment guidance.

## CI & E2E tips
- Unit/integration tests: run `npm test` locally.
- E2E smoke: run `npm run smoke:all` for a one-command local check.