# Running E2E locally

This document explains how to run the full E2E suite locally using the new orchestrator.

Steps (Windows / PowerShell):

```powershell
# Ensure ports are free (4010, 5174)
netstat -ano | Select-String ':4010' | ForEach-Object { if ($_ -match '(\d+)$') { Stop-Process -Id ([int]$matches[1]) -Force -ErrorAction SilentlyContinue } }
netstat -ano | Select-String ':5174' | ForEach-Object { if ($_ -match '(\d+)$') { Stop-Process -Id ([int]$matches[1]) -Force -ErrorAction SilentlyContinue } }

# Build and run the orchestrator (will build, start API and preview, wait for /health, then run Cypress)
npm run e2e:orchestrate
```

Steps (Linux / macOS):

```bash
# free ports if needed (example using lsof)
sudo lsof -ti :4010 | xargs -r kill -9
sudo lsof -ti :5174 | xargs -r kill -9

npm run e2e:orchestrate
```

Notes
- The orchestrator writes PID files to `scripts/.pids` while services are running.
- On CI we use `.github/workflows/e2e.yml` which runs the orchestrator on push and PRs to `main`.
- If you prefer to start services manually: build (`npm run build`), then start API (`cross-env PORT=4010 node server/server.js`) and preview (`npm run preview:stable`) and then run Cypress via `npx cypress run --e2e`.
