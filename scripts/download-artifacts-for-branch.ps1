param(
  [string]$owner = 'collecokzn-creator',
  [string]$repo = 'colleco-mvp',
  [string]$branch = 'copilot/vscode1761040997229'
)
$fullRepo = "$owner/$repo"
Write-Output "Querying runs for branch '$branch' in $fullRepo"
$apiPath = "/repos/$owner/$repo/actions/runs?branch=$branch&per_page=10"
$runsJson = gh api $apiPath --silent
if (-not $runsJson) { Write-Output 'NO_RUNS_JSON'; exit 2 }
$payload = $runsJson | ConvertFrom-Json
if (-not $payload.workflow_runs -or $payload.workflow_runs.Count -eq 0) { Write-Output 'NO_RUNS_FOUND_FOR_BRANCH'; exit 3 }
$run = $payload.workflow_runs | Sort-Object -Property created_at -Descending | Select-Object -First 1
$id = $run.id
Write-Output "Found run id=$id name='$($run.name)' workflow='$($run.name)' head_branch='$($run.head_branch)' status='$($run.status)' created_at='$($run.created_at)'"
# Poll the run status until completed
while ($true) {
  $viewJson = gh run view $id --repo $fullRepo --json status,conclusion --silent
  if (-not $viewJson) { Write-Output 'FAILED_TO_VIEW_RUN'; exit 4 }
  $view = $viewJson | ConvertFrom-Json
  Write-Output "Run $id status: $($view.status) conclusion: $($view.conclusion)"
  if ($view.status -eq 'completed') { break }
  Start-Sleep -Seconds 15
}
Write-Output "Run completed with conclusion: $($view.conclusion)"
$dir = "gh-artifacts-$id"
if (Test-Path $dir) { Remove-Item $dir -Recurse -Force }
Write-Output "Downloading artifacts into: $dir"
gh run download $id --repo $fullRepo --dir $dir --force
if ($LASTEXITCODE -ne 0) { Write-Output 'ARTIFACT_DOWNLOAD_FAILED'; exit 5 }
Write-Output 'Artifact download finished'
exit 0
