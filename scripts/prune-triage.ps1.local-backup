param(
  [int]$Days = 30,
  [switch]$DryRun = $true,
  [string]$BasePath = 'artifacts/triage'
)

function FailIfUnsafePath($p) {
  if ([string]::IsNullOrWhiteSpace($p)) {
    throw "Base path is empty. Refusing to run."
  }
  # Normalize
  $full = (Resolve-Path -Path $p -ErrorAction SilentlyContinue)
  if (-not $full) {
    Write-Host "Path '$p' does not exist; nothing to prune."; return $false
  }
  $full = $full.Path
  if ($full -eq '\\' -or $full -eq '/') {
    throw "Refusing to prune root path: $full"
  }
  if ($full -notlike '*artifacts*' -and $full -notlike '*triage*') {
    throw "Refusing to operate on path that doesn't look like triage artifacts: $full"
  }
  return $true
}

try {
  if (-not (FailIfUnsafePath $BasePath)) { exit 0 }
} catch {
  Write-Host "Safety check failed: $_"; exit 2
}

Write-Host "Pruning triage artifacts under '$BasePath' older than $Days days. DryRun: $DryRun"

$threshold = (Get-Date).AddDays(-$Days)

$dirs = Get-ChildItem -Directory -Path $BasePath -ErrorAction SilentlyContinue | Sort-Object LastWriteTime
if (-not $dirs) { Write-Host "No run directories found under $BasePath"; exit 0 }

$toRemove = @()
foreach ($d in $dirs) {
  # Only consider directories named like run- (safety)
  if ($d.Name -notmatch '^run-') { continue }
  $age = $d.LastWriteTime
  if ($age -lt $threshold) { $toRemove += $d }
}

if (-not $toRemove -or $toRemove.Count -eq 0) {
  Write-Host "No directories to prune (none older than $Days days)."
  exit 0
}

Write-Host "Found $($toRemove.Count) directories older than $Days days:";
foreach ($r in $toRemove) { Write-Host " - $($r.FullName) (lastWrite: $($r.LastWriteTime))" }

if ($DryRun) {
  Write-Host "Dry run: no files will be deleted. Rerun with -DryRun:$false to actually delete."
  exit 0
}

Write-Host "Removing $($toRemove.Count) directories..."
foreach ($r in $toRemove) {
  try {
    Remove-Item -LiteralPath $r.FullName -Recurse -Force -ErrorAction Stop
    Write-Host "Removed $($r.FullName)"
  } catch {
    Write-Host "Failed to remove $($r.FullName): $_"
  }
}

Write-Host "Prune completed."
