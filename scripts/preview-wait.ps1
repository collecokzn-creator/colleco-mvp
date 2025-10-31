# Start a static preview server (serve) and wait until it's responsive on port 5174
param(
  [int]$Port = 5174,
  [int]$Retries = 60,
  [int]$DelaySeconds = 2
)

Write-Output "Starting static preview on port $Port..."
# Start serve in a new process so the script can poll
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "npx"
$psi.Arguments = "serve -s dist -l $Port"
$psi.RedirectStandardOutput = $false
$psi.UseShellExecute = $true
$psi.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psi) | Out-Null

# Poll for readiness
for ($i=0; $i -lt $Retries; $i++) {
  try {
    $resp = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/" -TimeoutSec 2
    if ($resp.StatusCode -eq 200) {
      Write-Output "Preview is ready at http://127.0.0.1:$Port/"
      exit 0
    }
  } catch {
    Write-Output "waiting for preview... ($($i+1)/$Retries)"
    Start-Sleep -Seconds $DelaySeconds
  }
}

Write-Error "Preview did not become ready after $Retries attempts"
exit 1
