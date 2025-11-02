# cleanup-logs.ps1
# Purpose: Safely remove Cypress log folders from artifacts directory

Write-Host "Attempting to clear readonly/hidden attributes and remove logs directory"

# Adjust this path if your artifact run ID changes
$p = "artifacts\18933260328\cypress\logs"

if (Test-Path -LiteralPath $p) {
    try {
        Write-Host "Found path: $p"
        # Normalize attributes so files can be deleted
        Get-ChildItem -LiteralPath $p -Recurse -Force | ForEach-Object {
            try { $_.Attributes = 'Normal' } catch {}
        }

        # Remove the directory
        Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop
        Write-Host "✅ SUCCESS: Logs folder removed."
    }
    catch {
        Write-Host "❌ ERROR: Remove failed:"
        Write-Host $_.Exception.Message
        exit 2
    }
}
else {
    Write-Host "⚠️ NOTFOUND: Path does not exist"
}

Write-Host "Done."