param(
  [string]$dir = 'gh-artifacts-18682677585'
)
$patterns = @(
  'Blocked a frame with origin',
  'SecurityError',
  'uncaught exception',
  'Cypress failed',
  'AssertionError',
  'Error:'
)
if (-not (Test-Path $dir)) { Write-Output "DIR_NOT_FOUND: $dir"; exit 2 }
foreach ($p in $patterns) {
  Write-Output "--- Searching for: $p ---"
  Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue | Select-String -Pattern $p -SimpleMatch -List -ErrorAction SilentlyContinue | ForEach-Object { Write-Output "$($_.Path):$($_.LineNumber): $($_.Line)" }
}
exit 0
