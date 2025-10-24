# Poll a GitHub Actions run, download all artifacts, and print key E2E logs
param(
    [string]$RunId = '18739072607',
    [string]$Repo = 'collecokzn-creator/colleco-mvp'
)
Write-Output "Watching workflow run $RunId in repo $Repo..."
$status = gh run view $RunId --repo $Repo --json status --jq '.status'
Write-Output "Initial status: $status"
while ($status -ne 'completed') {
    Start-Sleep -Seconds 8
    $status = gh run view $RunId --repo $Repo --json status --jq '.status'
    Write-Output "Polled status: $status"
}
$conclusion = gh run view $RunId --repo $Repo --json conclusion --jq '.conclusion'
Write-Output "Run completed with conclusion: $conclusion"

$downloadDir = Join-Path (Get-Location) "ci-artifacts-$RunId"
Write-Output "Preparing to download artifacts into: $downloadDir"

# Get artifact names
$artifactsJson = gh run view $RunId --repo $Repo --json artifacts | ConvertFrom-Json
if (-not $artifactsJson.artifacts) {
    Write-Output 'No artifacts found for this run.'
    exit 0
}
$names = $artifactsJson.artifacts | ForEach-Object { $_.name }
Write-Output "Artifacts: $($names -join ', ')"

# Build gh run download args to avoid interactive prompt
$ghArgs = @($RunId, '--repo', $Repo, '-D', $downloadDir)
foreach ($n in $names) {
    $ghArgs += '-n'
    $ghArgs += $n
}
Write-Output "Downloading artifacts (non-interactive)..."
gh run download @ghArgs
Write-Output "Downloaded artifacts to $downloadDir"

# List files
Get-ChildItem $downloadDir -Recurse | Select-Object FullName,Length | Format-Table -AutoSize

# Find window_flags.json and modal_snapshot.html
$wf = Get-ChildItem $downloadDir -Recurse -File | Where-Object { $_.Name -eq 'window_flags.json' } | Select-Object -First 1
if ($wf) {
    Write-Output "--- window_flags.json ---"
    Get-Content $wf.FullName -Raw | Out-String | Write-Output
} else {
    Write-Output "window_flags.json not found"
}

$modal = Get-ChildItem $downloadDir -Recurse -File | Where-Object { $_.Name -eq 'modal_snapshot.html' } | Select-Object -First 1
if ($modal) {
    Write-Output "--- modal_snapshot.html (first 200 lines) ---"
    Get-Content $modal.FullName -TotalCount 200 | Out-String | Write-Output
    Write-Output "--- Search results for login selectors ---"
    Select-String -Path $modal.FullName -Pattern 'data-e2e="login-form"','<h2[^>]*>\s*Welcome,','data-e2e-ready' -AllMatches | Select-Object LineNumber,Line | Format-Table -AutoSize
} else {
    Write-Output "modal_snapshot.html not found"
}
