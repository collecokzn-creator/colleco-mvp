# Requires: GitHub CLI (gh) authenticated with admin rights on the repo
param(
  [string]$Owner = "collecokzn-creator",
  [string]$Repo = "colleco-mvp",
  [string]$Branch = "main"
)

$gh = "C:\\Program Files\\GitHub CLI\\gh.exe"
if (-not (Test-Path $gh)) {
  Write-Error "GitHub CLI not found at $gh. Install via winget: winget install -e --id GitHub.cli"
  exit 1
}

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Error "GitHub CLI not authenticated. Run: `\n  & \"$gh\" auth login --hostname github.com --web`"
  exit 1
}

$checks = @(
  @{ context = "CI" },
  @{ context = "E2E Smoke" }
)

$payload = @{ 
  required_status_checks = @{ 
    strict = $true; 
    contexts = $checks.context 
  };
  enforce_admins = $true;
  required_pull_request_reviews = @{ 
    required_approving_review_count = 1; 
    require_last_push_approval = $true 
  };
  restrictions = $null
} | ConvertTo-Json -Depth 5

Write-Host "Enabling branch protection on $Owner/$Repo:$Branch ..."
& $gh api -X PUT `
  repos/$Owner/$Repo/branches/$Branch/protection `
  -H "Accept: application/vnd.github+json" `
  -F required_status_checks.strict=true `
  -F required_status_checks.contexts[]="CI" `
  -F required_status_checks.contexts[]="E2E Smoke" `
  -F enforce_admins=true `
  -F required_pull_request_reviews.required_approving_review_count=1 `
  -F required_pull_request_reviews.require_last_push_approval=true `
  -F restrictions=

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to enable branch protection."
  exit $LASTEXITCODE
}

Write-Host "Branch protection enabled."
