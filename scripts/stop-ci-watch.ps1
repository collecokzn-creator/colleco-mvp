# Stop any running ci-watch-triage.ps1 instances
Write-Host "Stopping local CI watcher (ci-watch-triage.ps1) if any are running..."
$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -like '*ci-watch-triage.ps1*' }
if (-not $procs -or $procs.Count -eq 0) {
  Write-Host "No watcher processes found."
  exit 0
}
foreach ($p in $procs) {
  try {
    Write-Host "Stopping PID $($p.ProcessId) - $($p.CommandLine)"
    Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
  } catch {
    Write-Host "Failed to stop PID $($p.ProcessId): $_"
  }
}
Start-Sleep -Seconds 1
$left = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -like '*ci-watch-triage.ps1*' }
if ($left -and $left.Count -gt 0) {
  Write-Host "Some watcher processes remain:";
  $left | ForEach-Object { Write-Host "PID $($_.ProcessId) - $($_.CommandLine)" }
  exit 1
}
Write-Host "Watcher stopped.";
exit 0
