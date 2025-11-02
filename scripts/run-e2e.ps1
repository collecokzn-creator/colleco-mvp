<#
  Helper to stop stale listeners, start API and Vite, wait for readiness, then run Cypress
  Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-e2e.ps1
#>

Write-Host '=== run-e2e: starting ==='

$ports = @(4001, 5173)
foreach ($p in $ports) {
  Write-Host ('Scanning for processes listening on port {0}...' -f $p)
  $lines = @()
  try { $lines = netstat -ano -p tcp | Select-String ":$p" -SimpleMatch } catch { }
  foreach ($l in $lines) {
    $text = $l.ToString().Trim()
    $parts = ($text -split '\s+') | Where-Object { $_ -ne '' }
    if ($parts.Count -gt 0) {
      $foundPid = $parts[-1]
      if ($foundPid -and ($foundPid -as [int]) -gt 0) {
        try {
          Write-Host ('Stopping PID {0} (from netstat line: {1})' -f $foundPid, $text)
          Stop-Process -Id $foundPid -Force -ErrorAction Stop
          Start-Sleep -Milliseconds 300
        } catch {
          Write-Host ('Could not stop PID {0}: {1}' -f $foundPid, $_)
        }
      }
    }
  }
}

Write-Host 'Starting API server on PORT=4001...'
$env:PORT = '4001'
$api = Start-Process -FilePath node -ArgumentList 'server/server.js' -WorkingDirectory (Get-Location) -PassThru
Start-Sleep -Seconds 1
Write-Host ('API started with PID {0}' -f $api.Id)

Write-Host 'Starting Vite dev server (VITE_API_BASE=http://127.0.0.1:4001)'
$env:VITE_API_BASE = 'http://127.0.0.1:4001'
# Prefer local vite.cmd if present (Windows), otherwise use npx
$localVite = Join-Path (Get-Location) 'node_modules\.bin\vite.cmd'
if (Test-Path $localVite) {
  Write-Host ('Found local vite at {0}, starting it' -f $localVite)
  $vite = Start-Process -FilePath $localVite -ArgumentList '--host','127.0.0.1' -WorkingDirectory (Get-Location) -PassThru
} else {
  $npxCmdObj = Get-Command npx -ErrorAction SilentlyContinue
  if ($npxCmdObj) {
    $npxCmd = $npxCmdObj.Path
    Write-Host ('Using npx at {0} to run vite' -f $npxCmd)
    $vite = Start-Process -FilePath $npxCmd -ArgumentList 'vite','--host','127.0.0.1' -WorkingDirectory (Get-Location) -PassThru
  } else {
    Write-Error 'Could not find local vite or npx in PATH; please install dependencies (npm install)'
    exit 1
  }
}
Start-Sleep -Seconds 1
Write-Host ('Vite started with PID {0}' -f ($vite.Id -as [string]))

Write-Host 'Waiting for Vite to respond on http://127.0.0.1:5173 (60s timeout)'
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
  Start-Sleep -Seconds 1
}

if (-not $ready) {
  Write-Error ('Vite not ready after 60s; check the dev server logs (PID {0}).' -f $vite.Id)
  exit 1
}

Write-Host 'Vite ready — running Cypress suite'
$npx = Get-Command npx -ErrorAction SilentlyContinue
if (-not $npx) { Write-Error 'npx not found in PATH'; exit 1 }

Write-Host 'Running: npx cypress run --config video=false'
& $npx.Path 'cypress' 'run' '--config' 'video=false'

Write-Host '=== run-e2e: finished ==='
