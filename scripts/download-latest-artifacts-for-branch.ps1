param(
  [string]$repo = 'collecokzn-creator/colleco-mvp',
  [string]$branch = 'copilot/vscode1761040997229'
)
Write-Output "Fetching runs for branch '$branch' in $repo"
$runsJson = gh run list --repo $repo --limit 50 --json databaseId,headBranch,status,conclusion,createdAt
if (-not $runsJson) { Write-Output 'NO_RUNS_JSON'; exit 2 }
$runs = $runsJson | ConvertFrom-Json
if (-not $runs -or $runs.Count -eq 0) { Write-Output 'NO_RUNS_RETURNED'; exit 3 }
$branchRuns = $runs | Where-Object { $_.headBranch -eq $branch }
if (-not $branchRuns -or $branchRuns.Count -eq 0) { Write-Output 'NO_RUNS_FOR_BRANCH'; exit 4 }
$latest = $branchRuns | Sort-Object -Property createdAt -Descending | Select-Object -First 1
$id = $latest.databaseId
Write-Output "Found latest run databaseId=$id status=$($latest.status) conclusion=$($latest.conclusion) createdAt=$($latest.createdAt)"
# If not completed, poll until completed
while ($latest.status -ne 'completed') {
  Write-Output "Run $id status: $($latest.status) - waiting 15s"
  Start-Sleep -Seconds 15
  $latest = (gh run list --repo $repo --limit 50 --json databaseId,headBranch,status,conclusion,createdAt | ConvertFrom-Json | Where-Object { $_.headBranch -eq $branch } | Sort-Object -Property createdAt -Descending | Select-Object -First 1)
}
Write-Output "Run $id completed with conclusion: $($latest.conclusion)"
$dir = "gh-artifacts-$id"
if (Test-Path $dir) { Remove-Item $dir -Recurse -Force }
Write-Output "Downloading artifacts into: $dir"
$exit = gh run download $id --repo $repo --dir $dir --force
if ($LASTEXITCODE -ne 0) { Write-Output 'ARTIFACT_DOWNLOAD_FAILED'; exit 5 }
Write-Output 'Artifact download finished'
exit 0
