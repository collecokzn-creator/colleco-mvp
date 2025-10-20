# Start API and Vite for local E2E run (background)
# Usage: Start-Process -FilePath pwsh -ArgumentList '-NoProfile','-NoLogo','-File','./scripts/start-dev-for-e2e.ps1' -WindowStyle Hidden

Write-Output "Starting API server (node server/server.js)"
Start-Process -FilePath node -ArgumentList 'server/server.js' -WindowStyle Hidden
Start-Sleep -Seconds 1

Write-Output "Starting Vite dev server (npm run dev) with VITE_API_BASE=http://127.0.0.1:4001"
$env:VITE_API_BASE = 'http://127.0.0.1:4001'
# Run dev server in this background PowerShell process
npm run dev
