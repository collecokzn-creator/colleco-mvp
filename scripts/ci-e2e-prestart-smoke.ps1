param(
  [int]$TestPort = 5173
)

Set-StrictMode -Version Latest

Write-Host "CI E2E Smoke: starting preview-server on port $TestPort (background)"

$logsDir = Join-Path $env:TEMP "colleco-ci-logs"
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

$smokeLog = Join-Path $logsDir "preview-smoke.log"
if (Test-Path $smokeLog) { Remove-Item -Force -ErrorAction SilentlyContinue $smokeLog }

# Start a preview server directly (no env) in background
$nodeCmd = "node scripts/preview-server.js --port $TestPort"
Write-Host "Starting: $nodeCmd -> $smokeLog"
$null = Start-Process -FilePath "cmd.exe" -ArgumentList '/c', "$nodeCmd > `"$smokeLog`" 2>&1" -PassThru

Start-Sleep -Seconds 2

Write-Host "Running pre-start cleanup (stop any preview-server processes)"
try {
  $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -and ($_.CommandLine -like '*preview-server.js*' -or $_.CommandLine -like '*scripts\\preview-server.js*') }
  if ($procs -and $procs.Count -gt 0) {
    foreach ($p in $procs) {
      $ownerPid = $p.ProcessId
      $cmd = $p.CommandLine
      Write-Host "Found preview-server PID=$ownerPid CMD=$cmd"
      try { Stop-Process -Id $ownerPid -ErrorAction SilentlyContinue; Start-Sleep -Seconds 1 } catch {}
      if (Get-Process -Id $ownerPid -ErrorAction SilentlyContinue) { Stop-Process -Id $ownerPid -Force -ErrorAction SilentlyContinue }
    }
  } else {
    Write-Host "No preview-server processes found in cleanup"
  }
} catch {
  Write-Host "Cleanup run failed: $_"
}

Start-Sleep -Seconds 1

Write-Host "Verifying port $TestPort is free"
try {
  $found = $false
  if (Get-Command -Name Get-NetTCPConnection -ErrorAction SilentlyContinue) {
  $found = $null -ne (Get-NetTCPConnection -LocalPort $TestPort -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' })
  } else {
    $net = netstat -ano | Select-String ":$TestPort\s"
    $found = $net.Count -gt 0
  }
  if ($found) {
    Write-Host "Port $TestPort still in use after cleanup. Smoke test FAILED."; exit 2
  } else {
    Write-Host "Port $TestPort is free. Smoke test PASSED."; exit 0
  }
} catch {
  Write-Host "Verification failed: $_"; exit 3
}
