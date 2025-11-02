param(
    [string]$repo = 'collecokzn-creator/colleco-mvp',
    [string]$branch = 'copilot/vscode1761040997229'
)
Write-Output "Looking up latest run for branch '$branch' in $repo"
$runsJson = gh run list --repo $repo --branch $branch --limit 10 --json id,name,workflowName,status,conclusion,createdAt
if (-not $runsJson) { Write-Output 'NO_RUNS_FOUND'; exit 2 }
$runs = $runsJson | ConvertFrom-Json
if (-not $runs -or $runs.Count -eq 0) { Write-Output 'NO_RUNS_FOUND'; exit 3 }
$run = $runs[0]
$id = $run.id
Write-Output "Found run id=$id name='$($run.name)' workflow='$($run.workflowName)' status=$($run.status) createdAt=$($run.createdAt)"
# Poll status until completed
while ($true) {
    $viewJson = gh run view $id --repo $repo --json status,conclusion
    $view = $viewJson | ConvertFrom-Json
    Write-Output "Run $id status: $($view.status) conclusion: $($view.conclusion)"
    if ($view.status -eq 'completed') { break }
    Start-Sleep -Seconds 15
}
Write-Output "Run completed with conclusion: $($view.conclusion)"
$dir = "gh-artifacts-$id"
if (Test-Path $dir) { Remove-Item $dir -Recurse -Force }
Write-Output "Downloading artifacts into: $dir"
gh run download $id --repo $repo --dir $dir
Write-Output 'Artifact download finished'
exit 0
