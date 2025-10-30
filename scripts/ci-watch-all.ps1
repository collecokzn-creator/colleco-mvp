param(
  [int]$minutes = 0,
  [int]$Hours = 4,
  [switch]$CreateIssues = $false,
  [string]$repo = 'collecokzn-creator/colleco-mvp'
)

# Determine end time: prefer explicit minutes if provided for backward compatibility, else use Hours
if ($minutes -gt 0) {
  $totalMinutes = $minutes
} else {
  $totalMinutes = $Hours * 60
}

Write-Host "Starting repository-wide CI watch/triage for $repo (duration: $totalMinutes min)"
$end = (Get-Date).AddMinutes($totalMinutes)
New-Item -ItemType Directory -Path artifacts/triage -Force | Out-Null

while((Get-Date) -lt $end) {
  Write-Host "Checking runs at $(Get-Date -Format o) ..."
  # Request additional fields (url, headBranch, headSha) for richer triage/meta
  $runsJson = gh run list --repo $repo --limit 200 --json databaseId,workflowName,conclusion,createdAt,url,headBranch,headSha 2>&1 | Out-String
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
      # Write per-run timestamped output directory so uploads can target a single folder
      $timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
      $outDir = "artifacts/triage/run-$id-$timestamp"
      if (-Not (Test-Path $outDir)) {
        New-Item -ItemType Directory -Path $outDir -Force | Out-Null
        Write-Host "Found failing run $id ($($r.workflowName)). Downloading logs..."
        gh run view $id --repo $repo --log > "$outDir/log.txt" 2>&1
        gh run download $id --repo $repo --dir $outDir > "$outDir/download.log" 2>&1
        # Save run metadata for easy triage
        $meta | ConvertTo-Json | Out-File -FilePath "$outDir/meta.json"
        # update a pointer file so runners and workflows can find the most recent run folder
        "$outDir" | Out-File -FilePath "artifacts/triage/last-run.txt" -Encoding UTF8
        # Optionally create a GitHub issue pointing to the saved artifacts (opt-in only)
        if ($CreateIssues) {
          try {
            $issueTitle = "[CI][Fail] Workflow: $($r.workflowName) — run $id"
            $issueBody = @()
            $issueBody += "A failing workflow run was detected and artifacts have been saved to the runner that executed this watcher."
            if ($r.url) { $issueBody += "Run details: $($r.url)" }
            $issueBody += "Artifacts path: $outDir"
            $issueBody += "Branch: $($r.headBranch)  SHA: $($r.headSha)"
            $bodyText = $issueBody -join "`n`n"
            gh issue create --repo $repo --title "$issueTitle" --body $bodyText > "$outDir/issue.create.log" 2>&1
            Write-Host "Created issue for run $id (see $outDir/issue.create.log)"
          } catch {
            # Avoid ambiguous variable expansion inside double-quoted strings; format explicitly
            Write-Host ("Failed to create issue for run {0}: {1}" -f $id, ($_.ToString()))
          }
        }
        Write-Host "Logs saved to $outDir"
      } else {
        Write-Host "Already collected run $id"
      }
    }
  }

  Start-Sleep -Seconds 60
}

Write-Host "Watch completed. Collected artifacts under artifacts/triage"
