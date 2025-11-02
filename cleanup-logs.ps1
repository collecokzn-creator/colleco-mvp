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
        # Try a few times in case of transient locks
        $removed = $false
        for ($i = 1; $i -le 3; $i++) {
            try {
                Remove-Item -LiteralPath $dir.FullName -Recurse -Force -ErrorAction Stop
                Write-Host "✅ Removed: $($dir.FullName) (attempt $i)" -ForegroundColor Green
                $removed = $true
                break
            } catch {
                Write-Host "⚠️ Attempt $i failed to remove $($dir.FullName): $($_.Exception.Message)" -ForegroundColor Yellow
                Start-Sleep -Seconds (2 * $i)
            }
        }

        if (-not $removed) {
            # On Windows try a cmd fallback (rd) and also try the extended path prefix for long paths
            if ($IsWindows) {
                try {
                    $xp = $dir.FullName
                    # Apply extended path prefix if necessary
                    if ($xp -notmatch '^\\\\\\\?\\') {
                        $xp = "\\\\?\\$xp"
                    }
                    Write-Host "ℹ️ Trying Windows fallback removal (rd /s /q) on: $xp"
                    cmd /c "rd /s /q `"$xp`"" 2>$null
                    if (-not (Test-Path -LiteralPath $dir.FullName)) {
                        Write-Host "✅ Removed by rd fallback: $($dir.FullName)" -ForegroundColor Green
                        $removed = $true
                    }
                } catch {
                    Write-Host "❌ rd fallback failed: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
        if (-not $removed) { throw "Failed to remove $($dir.FullName) after retries" }
    }
    catch {
        Write-Host "❌ Failed to remove: $($dir.FullName)" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host "🎉 Cleanup complete!" -ForegroundColor Cyan

Write-Host "\nRun: pwsh -NoProfile -ExecutionPolicy Bypass -File cleanup-logs.ps1" -ForegroundColor DarkCyan