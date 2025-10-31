$uri = 'http://127.0.0.1:5173/'
Write-Output "Waiting for $uri to respond (timeout ~80s)..."
for ($i = 0; $i -lt 80; $i++) {
  try {
    $r = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($r.StatusCode -eq 200) { Write-Output "Dev server ready after $i seconds"; exit 0 }
  } catch {
    Start-Sleep -Seconds 1
  }
}
Write-Error "Dev server did not become ready in time"
exit 2
