param(
  [int]$PreviewPort = 5174,
  [int]$MockPort = 4015
)

Write-Host "Starting mock Siteminder and preview server..."

# Start mock server via npx cross-env so env var is set for that process
$mockProc = Start-Process -FilePath "npx" -ArgumentList "cross-env SITEMINDER_USE_MOCK=1 node scripts/mock-siteminder-server.js" -NoNewWindow -PassThru
Write-Host "Mock server PID: $($mockProc.Id)"

# Start preview server
$previewProc = Start-Process -FilePath "node" -ArgumentList "scripts/express-preview-server.js --port $PreviewPort --host 0.0.0.0" -NoNewWindow -PassThru
Write-Host "Preview server PID: $($previewProc.Id)"

function Wait-ForUrl([string]$url, [int]$tries = 20, [int]$delayMs = 1000) {
  for ($i=0; $i -lt $tries; $i++) {
    try {
      $r = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 2
      if ($r) { return $true }
    } catch {}
    Start-Sleep -Milliseconds $delayMs
  }
  return $false
}

$health = "http://127.0.0.1:$PreviewPort/health"
Write-Host "Waiting for preview health at $health"
if (-not (Wait-ForUrl $health 30 1000)) {
  Write-Error "Preview did not become healthy in time"
  exit 1
}

Write-Host "Preview is healthy. Running Cypress spec against mock..."

# Run Cypress with API_BASE pointing to mock port
$env:API_BASE = "http://127.0.0.1:$MockPort"
& npx cypress run --browser chrome --e2e --spec cypress/e2e/login_register_smoke.cy.js --reporter spec
$exitCode = $LASTEXITCODE

Write-Host "Cypress exited with code $exitCode"

Write-Host "Stopping preview and mock servers..."
try { Stop-Process -Id $previewProc.Id -Force } catch {}
try { Stop-Process -Id $mockProc.Id -Force } catch {}

exit $exitCode
