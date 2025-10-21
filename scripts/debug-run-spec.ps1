param(
  [string]$Spec = 'cypress/e2e/mobile-compliance.cy.js',
  [int]$ApiPort = 4001,
  [int]$PreviewPort = 5173,
  [int]$WaitSeconds = 30
)

Set-StrictMode -Version Latest

$logsDir = Join-Path $env:TEMP 'colleco-ci-logs'
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

$demoLog = Join-Path $logsDir 'demo-api-debug.log'
$previewLog = Join-Path $logsDir 'preview-debug.log'

Write-Host "Debug run: Spec=$Spec ApiPort=$ApiPort PreviewPort=$PreviewPort"

# Start demo API via cmd.exe wrapper so env is applied reliably
Write-Host "Starting demo API (cmd wrapper) -> $demoLog"
$demoCmd = 'set "PORT={0}" && node server/server.js > "{1}" 2>&1' -f $ApiPort, $demoLog
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $demoCmd -WorkingDirectory (Get-Location) -NoNewWindow -PassThru | Out-Null

Start-Sleep -Seconds 1

Write-Host "Starting preview server (cmd wrapper) -> $previewLog"
$previewCmd = 'set "HOST=127.0.0.1" && set "PORT={0}" && node scripts/preview-server.js --port {0} > "{1}" 2>&1' -f $PreviewPort, $previewLog
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $previewCmd -WorkingDirectory (Get-Location) -NoNewWindow -PassThru | Out-Null

Start-Sleep -Seconds 3

Write-Host "Waiting up to $WaitSeconds seconds for services to bind..."
function Wait-ForPort([int]$port,[int]$seconds){
  $deadline = (Get-Date).AddSeconds($seconds)
  while((Get-Date) -lt $deadline){
    try{ $c = New-Object System.Net.Sockets.TcpClient; $iar = $c.BeginConnect('127.0.0.1',$port,$null,$null); if($iar.AsyncWaitHandle.WaitOne(250)){ try{ $c.EndConnect($iar) } catch{} } if($c.Connected){ $c.Close(); return $true } $c.Close() } catch{}
    Start-Sleep -Seconds 1
  }
  return $false
}

if (-not (Wait-ForPort $ApiPort $WaitSeconds)) { Write-Host "API did not bind to $ApiPort"; Get-Content $demoLog -ErrorAction SilentlyContinue | Select-Object -Last 200 | ForEach-Object { Write-Host $_ }; exit 20 }
if (-not (Wait-ForPort $PreviewPort $WaitSeconds)) { Write-Host "Preview did not bind to $PreviewPort"; Get-Content $previewLog -ErrorAction SilentlyContinue | Select-Object -Last 200 | ForEach-Object { Write-Host $_ }; exit 21 }

Write-Host "Both services bound. Running Cypress spec: $Spec"
$env:API_BASE = "http://127.0.0.1:$ApiPort"
$cyCmd = "npx cypress run --e2e --spec '$Spec' --config baseUrl=http://127.0.0.1:$PreviewPort"
Write-Host "Executing: $cyCmd"
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $cyCmd -NoNewWindow -Wait -PassThru | Out-Null

Write-Host "Cypress run complete. Tail of demo log:"
Get-Content $demoLog -Tail 200 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
Write-Host "Tail of preview log:"
Get-Content $previewLog -Tail 200 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }

Write-Host "Done. Logs collected under: $logsDir"

exit 0
