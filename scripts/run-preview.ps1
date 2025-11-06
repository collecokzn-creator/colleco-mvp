param(
  [int]$Port = 5173,
  [string]$BindHost = '127.0.0.1'
)

Write-Output "Starting preview server on $($BindHost):$($Port)..."

$node = (Get-Command node -ErrorAction SilentlyContinue)
if (-not $node) {
  Write-Error "node not found in PATH. Ensure Node.js is installed and retry."; exit 1
}

# Use subexpression to avoid interpolation parsing issues
# Use BindHost to avoid colliding with PowerShell automatic variables
$procArgs = "scripts/express-preview-server.js --port $($Port) --host $($BindHost)"
# Start the preview server in a new window so it continues running
Start-Process -FilePath $node.Source -ArgumentList $procArgs -WindowStyle Normal

Start-Sleep -Seconds 1
Write-Output "Opening browser to http://$($BindHost):$($Port)/"
Start-Process "http://$($BindHost):$($Port)/"

Write-Output "Preview started. Keep this shell open if you want to stop the server manually." 
