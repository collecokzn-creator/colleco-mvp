param(
  [int]$ApiPort = 4002,
  [int]$PreviewPort = 5173,
  [int]$WaitSeconds = 60
)

Set-StrictMode -Version Latest
Write-Host "CI E2E: building production assets..."
npm run build

$logsDir = Join-Path $env:TEMP "colleco-ci-logs"
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

$demoLog = Join-Path $logsDir "demo-api.log"
$previewLog = Join-Path $logsDir "preview.log"

Write-Host "Starting demo API on port $ApiPort (logs -> $demoLog)"
$demoProc = Start-Process -FilePath "node" -ArgumentList "server/server.js" -WorkingDirectory (Get-Location) -NoNewWindow -RedirectStandardOutput $demoLog -RedirectStandardError $demoLog -PassThru

Start-Sleep -Seconds 1
Write-Host "Starting preview server (serving dist) on port $PreviewPort (logs -> $previewLog)"
$previewProc = Start-Process -FilePath "node" -ArgumentList "scripts/preview-server.js --port $PreviewPort" -WorkingDirectory (Get-Location) -NoNewWindow -RedirectStandardOutput $previewLog -RedirectStandardError $previewLog -PassThru

function Wait-ForUrl([string]$url,[int]$timeoutSeconds){
  $deadline = (Get-Date).AddSeconds($timeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch { }
    Start-Sleep -Seconds 1
  }
  return $false
}

Write-Host "Waiting for demo API health..."
if (-not (Wait-ForUrl "http://127.0.0.1:$ApiPort/health" $WaitSeconds)) {
  Write-Host "Demo API did not become ready within $WaitSeconds seconds. Dumping last 200 lines of $demoLog"
  Get-Content $demoLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
  exit 20
}

Write-Host "Waiting for preview server root..."
if (-not (Wait-ForUrl "http://127.0.0.1:$PreviewPort/" $WaitSeconds)) {
  Write-Host "Preview server did not become ready within $WaitSeconds seconds. Dumping last 200 lines of $previewLog"
  Get-Content $previewLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
  exit 21
}

Write-Host "Both services are ready. Running Cypress..."

$env:API_BASE = "http://127.0.0.1:$ApiPort"
$args = @("cypress","run","--e2e","--config","baseUrl=http://127.0.0.1:$PreviewPort")
Write-Host "Executing: npx $($args -join ' ')"
$proc = Start-Process -FilePath "npx" -ArgumentList $args -NoNewWindow -Wait -PassThru
$exit = $proc.ExitCode

Write-Host "Cypress finished with exit code $exit"
Write-Host "Tail of demo API log ($demoLog):"
Get-Content $demoLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
Write-Host "Tail of preview log ($previewLog):"
Get-Content $previewLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host

exit $exit
