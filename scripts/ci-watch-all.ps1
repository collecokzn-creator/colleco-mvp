param(
  [int]$minutes = 1440,
  [string]$repo = 'collecokzn-creator/colleco-mvp'
)

Write-Host "Starting repository-wide CI watch/triage for $repo (duration: $minutes min)"
$end = (Get-Date).AddMinutes($minutes)
New-Item -ItemType Directory -Path artifacts/triage -Force | Out-Null

while((Get-Date) -lt $end) {
  Write-Host "Checking runs at $(Get-Date -Format o) ..."
  $runsJson = gh run list --repo $repo --limit 200 --json databaseId,workflowName,conclusion,createdAt 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) {
    Write-Host "gh run list failed: $runsJson"
    Start-Sleep -Seconds 30
    continue
  }

  $runs = $runsJson | ConvertFrom-Json
  foreach ($r in $runs) {
    if ($r.conclusion -eq 'failure') {
      $id = $r.databaseId
  # Save run metadata (URL, branch, etc.) for triage
  $meta = @{ id = $id; workflow = $r.workflowName; url = $r.url; headBranch = $r.headBranch; headSha = $r.headSha; createdAt = $r.createdAt }
      $outDir = "artifacts/triage/run-$id"
      if (-Not (Test-Path $outDir)) {
        New-Item -ItemType Directory -Path $outDir -Force | Out-Null
        Write-Host "Found failing run $id ($($r.workflowName)). Downloading logs..."
        gh run view $id --repo $repo --log > "$outDir/log.txt" 2>&1
        gh run download $id --repo $repo --dir $outDir > "$outDir/download.log" 2>&1
        # Save run metadata for easy triage
        $meta | ConvertTo-Json | Out-File -FilePath "$outDir/meta.json"
        Write-Host "Logs saved to $outDir"
      } else {
        Write-Host "Already collected run $id"
      }
    }
  }

  Start-Sleep -Seconds 60
}

Write-Host "Watch completed. Collected artifacts under artifacts/triage"
