CI notes — E2E smoke job

This repository runs a lightweight E2E smoke job in GitHub Actions which builds the app and runs a single Cypress smoke spec. Keep these notes in sync with `.github/workflows/e2e-smoke.yml`.

Required runtime
- Node.js 20.x (the project uses Vite >=7 which requires Node >=20)

Ports used by the smoke job (on the runner)
- Backend demo API: http://127.0.0.1:4001 (health: /health)
- Static preview (Vite `preview` / `serve`): http://127.0.0.1:5173

How the workflow starts services
- Backend: starts `node server/server.js` with `PORT=4001` and logs to `server.log`.
- Preview: serves `dist` on port `5173` (uses `npx serve -s dist -l 5173`) and logs to `preview.log`.

Run the smoke job locally (approx)

# 1. Build the app
npm ci
npm run build

# 2. Start backend (in a separate shell)
# on Windows (PowerShell):
$env:PORT=4001; Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server/server.js" -RedirectStandardOutput server.log -RedirectStandardError server.log

# 3. Start preview (in a separate shell)
# on Windows (PowerShell):
npx serve -s dist -l 5173 > preview.log 2>&1 &

# 4. Run smoke spec
npx cypress run --browser electron --config video=false --spec "cypress/e2e/smoke.cy.js"

Notes and troubleshooting
- If the build errors with a Vite / ESM error, verify your Node version is Node 20+.
- The workflow waits up to ~120s for services to become ready and will upload `server.log` and `preview.log` on failure for triage.
- If you update ports or server start commands, update `.github/workflows/e2e-smoke.yml` and this file.
