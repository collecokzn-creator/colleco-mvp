<#
PowerShell helper to create GitHub issues from markdown drafts in docs/issues.
Requires GitHub CLI (gh) installed and authenticated.
Usage:
  pwsh .\create-github-issues.ps1 -Path '..\docs\issues' -Repo 'owner/repo'
#>

param(
  [string]$Path = '..\docs\issues',
  [string]$Repo = ''
)

Set-StrictMode -Version Latest

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "gh CLI not found. Install from https://cli.github.com/ and authenticate (gh auth login)."; exit 1
}

$files = Get-ChildItem -Path $Path -Recurse -Include *.md | Sort-Object FullName
foreach ($f in $files) {
  Write-Host "Processing $($f.FullName)"
  $content = Get-Content $f.FullName -Raw
  # parse front matter if present
  if ($content -match "(?ms)^---\s*(.*?)\s*---\s*(.*)$") {
    $meta = $matches[1]
    $body = $matches[2]
    $title = ($meta -match "title:\s*(.*)") ? $matches[1].Trim() : ''
    if (-not $title) { $title = (Get-Item $f.FullName).BaseName }
  } else {
    $title = (Get-Item $f.FullName).BaseName
    $body = $content
  }
  $cmd = "gh issue create --title `"$title`" --body-file `"$($f.FullName)`""
  if ($Repo) { $cmd += " --repo $Repo" }
  Write-Host "Running: $cmd"
  iex $cmd
}
