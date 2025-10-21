param(
  [string]$dir = 'gh-artifacts-18682677588'
)
if (-not (Test-Path $dir)) { Write-Output "DIR_NOT_FOUND: $dir"; exit 2 }
Get-ChildItem -LiteralPath $dir -Recurse -File | ForEach-Object { Write-Output $_.FullName }
exit 0
