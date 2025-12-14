# One-off cleanup runner for locked directories

Stop-Process -Name node,ngrok,code,serve -ErrorAction SilentlyContinue -Force

$paths = @('cypress\\downloads')
foreach ($p in $paths) {
    for ($i=0; $i -lt 5; $i++) {
        try {
            if (Test-Path $p) {
                Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop
                Write-Host "REMOVED"
                break
            } else {
                Write-Host "MISSING"
                break
            }
        } catch {
            Write-Host ("Attempt {0} failed: {1}" -f ($i+1), $_.Exception.Message)
            Start-Sleep -Seconds 1
        }
    }

    if (Test-Path $p) {
        Write-Host "Still exists — attempting takeown/icacls"
        cmd /c "takeown /f \"$p\" /r /d y"
        cmd /c "icacls \"$p\" /grant *S-1-1-0:F /T /C"
        try {
            Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop
            Write-Host "Removed after ACL"
        } catch {
            Write-Host "Failed after ACL: " + $_.Exception.Message
        }
    }

    if (Get-Command handle.exe -ErrorAction SilentlyContinue) {
        Write-Host "handle.exe available — listing handles"
        & handle.exe -accepteula $p
    }

    Write-Host "Listing directory attributes if present"
    if (Test-Path $p) {
        Get-ChildItem -LiteralPath $p -Recurse -Force | Select-Object FullName,Attributes | Format-Table -AutoSize
    }
}

Write-Host "DONE"
