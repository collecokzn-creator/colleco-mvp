param(
  [string]$repo = 'collecokzn-creator/colleco-mvp',
  [string]$branch = 'copilot/vscode1761040997229'
)
Write-Output "Monitoring E2E runs for branch $branch in $repo"
# Poll for a run whose workflowName contains 'E2E' and has status 'completed'
while ($true) {
  $runsJson = gh run list --repo $repo --limit 50 --json databaseId,workflowName,headBranch,status,conclusion,createdAt
  if (-not $runsJson) { Write-Output 'NO_RUNS_JSON'; Start-Sleep -Seconds 15; continue }
  $runs = $runsJson | ConvertFrom-Json
  $candidate = $runs | Where-Object { $_.headBranch -eq $branch -and ($_.workflowName -like '*E2E*' -or $_.workflowName -like '*e2e*') } | Sort-Object createdAt -Descending | Select-Object -First 1
  if (-not $candidate) { Write-Output 'NO_E2E_RUN_FOUND - sleeping 15s'; Start-Sleep -Seconds 15; continue }
  Write-Output "Found candidate run databaseId=$($candidate.databaseId) workflowName=$($candidate.workflowName) status=$($candidate.status) conclusion=$($candidate.conclusion) createdAt=$($candidate.createdAt)"
  if ($candidate.status -ne 'completed') { Write-Output 'Candidate not completed yet - sleeping 15s'; Start-Sleep -Seconds 15; continue }
  # download artifacts
  $dir = "gh-artifacts-$($candidate.databaseId)"
  if (Test-Path $dir) { Remove-Item $dir -Recurse -Force }
  Write-Output "Downloading artifacts for run $($candidate.databaseId) into $dir"
  gh run download $candidate.databaseId --repo $repo --dir $dir
  if ($LASTEXITCODE -ne 0) { Write-Output 'ARTIFACT_DOWNLOAD_FAILED'; exit 2 }
  Write-Output 'Artifact download finished'
  exit 0
}
