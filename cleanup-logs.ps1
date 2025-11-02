# cleanup-logs.ps1
# Purpose: Automatically remove all Cypress log folders under the artifacts directory.

Write-Host "🔍 Searching for Cypress log folders under 'artifacts'..." -ForegroundColor Cyan

# Get all possible Cypress logs directories (e.g., artifacts/*/cypress/logs)
$logDirs = Get-ChildItem -Path "artifacts" -Recurse -Directory -ErrorAction SilentlyContinue |
           Where-Object { $_.FullName -match "\\cypress\\logs$" }

if ($logDirs.Count -eq 0) {
    Write-Host "⚠️ No Cypress logs directories found." -ForegroundColor Yellow
    exit 0
}

foreach ($dir in $logDirs) {
    Write-Host "🧩 Found: $($dir.FullName)"
    try {
        # Reset file attributes (hidden, readonly) to allow removal
        Get-ChildItem -LiteralPath $dir.FullName -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
            try { $_.Attributes = 'Normal' } catch {}
        }

        # Remove the directory
        Remove-Item -LiteralPath $dir.FullName -Recurse -Force -ErrorAction Stop
        Write-Host "✅ Removed: $($dir.FullName)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to remove: $($dir.FullName)" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host "🎉 Cleanup complete!" -ForegroundColor Cyan

Write-Host "\nRun: pwsh -NoProfile -ExecutionPolicy Bypass -File cleanup-logs.ps1" -ForegroundColor DarkCyan