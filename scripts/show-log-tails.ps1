$dir = Join-Path $env:TEMP 'colleco-ci-logs'
if (-not (Test-Path $dir)) {
    Write-Host "No local artifact folder at $dir"; exit 0
}
# Find latest demo-api log (including rotated files)
$demo = Get-ChildItem -Path $dir -Filter 'demo-api.log*' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$preview = Get-ChildItem -Path $dir -Filter 'preview.log*' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($demo) {
    Write-Host "--- Last 200 lines of demo API log: $($demo.FullName) ---" -ForegroundColor Cyan
    Get-Content -Path $demo.FullName -Tail 200 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
    Write-Host "";
} else {
    Write-Host 'No demo API log found in' $dir -ForegroundColor Yellow
}
if ($preview) {
    Write-Host "--- Last 200 lines of preview log: $($preview.FullName) ---" -ForegroundColor Cyan
    Get-Content -Path $preview.FullName -Tail 200 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
    Write-Host "";
} else {
    Write-Host 'No preview log found in' $dir -ForegroundColor Yellow
}
# Optionally list the most recent zip artifact
$zip = Get-ChildItem -Path $dir -Filter 'colleco-ci-logs-*.zip' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($zip) { Write-Host "Most recent staged zip: $($zip.FullName)" }