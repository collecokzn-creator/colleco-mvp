# Requires: GitHub CLI (gh) authenticated to github.com with repo scopes
param(
  [string]$BaseBranch = "main",
  [string]$HeadBranch = "chore/ci-lint-build-and-pwa",
  [string]$Title = "CI/Lint/Build fixes, PWA, and Security Hardening",
  [string]$BodyFile = "docs/pr/security-hardening.md"
)

$gh = "C:\\Program Files\\GitHub CLI\\gh.exe"
if (-not (Test-Path $gh)) {
  Write-Error "GitHub CLI not found at $gh. Install via winget: winget install -e --id GitHub.cli"
  exit 1
}

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Error "GitHub CLI not authenticated. Run: `\n  & \"$gh\" auth login --hostname github.com --web --git-protocol https`"
  exit 1
}

if (-not (Test-Path $BodyFile)) {
  Write-Error "PR body file not found: $BodyFile"
  exit 1
}

Write-Host "Creating PR from '$HeadBranch' to '$BaseBranch'..."
& $gh pr create -B $BaseBranch -H $HeadBranch -t $Title -F $BodyFile
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to create PR."
  exit $LASTEXITCODE
}

Write-Host "PR created successfully."
