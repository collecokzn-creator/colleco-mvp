# Extract latest colleco CI staged zip and search for the known cross-origin SecurityError
$staging = Join-Path $env:TEMP 'colleco-ci-logs'
if (-not (Test-Path $staging)) { Write-Output "STAGING_NOT_FOUND: $staging"; exit 2 }
$zip = Get-ChildItem -Path $staging -Filter 'colleco-ci-logs-*.zip' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $zip) { Write-Output "NO_ZIP_FOUND_IN_STAGING: $staging"; exit 3 }
Write-Output "Using zip: $($zip.FullName)"
$dest = Join-Path (Get-Location) 'artifact-extract'
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest | Out-Null
Expand-Archive -LiteralPath $zip.FullName -DestinationPath $dest -Force
Write-Output "EXTRACTED_TO: $dest"
# Search for the exact phrase
$pattern = 'Blocked a frame with origin'
$foundMatches = Get-ChildItem -Path $dest -Recurse -File | Select-String -Pattern $pattern -SimpleMatch -List -ErrorAction SilentlyContinue
if (-not $foundMatches) { Write-Output 'NO_MATCHES' ; exit 0 }
foreach ($m in $foundMatches) { Write-Output "$($m.Path):$($m.LineNumber): $($m.Line)" }
exit 0
