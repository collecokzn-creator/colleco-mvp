<#
clean-and-unlock.ps1

Stops common lock-holding processes and attempts to remove specified paths.
If removal fails and `-Force` is provided, the script will attempt `takeown` and
`icacls` to take ownership and grant permissions (requires running PowerShell
as Administrator).

Usage:
  pwsh -NoProfile -File .\scripts\clean-and-unlock.ps1 -Paths 'cypress/downloads' -Force
#>

param(
    [string[]] $Paths = @('cypress/downloads'),
    [int] $Retries = 5,
    [int] $DelaySeconds = 2,
    [switch] $Force
)

function Stop-CommonProcesses {
    $procs = @('node','ngrok','code','serve')
    foreach ($p in $procs) {
        try {
            $found = Get-Process -Name $p -ErrorAction SilentlyContinue
            if ($found) {
                Write-Host "Stopping process: $p (PID(s): $($found.Id -join ', '))"
                $found | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # ignore
        }
    }
}

function Show-HandleInfo($path) {
    $handle = Get-Command handle.exe -ErrorAction SilentlyContinue
    if ($handle) {
        Write-Host "handle.exe found — listing handles for: $path"
        try {
            & handle.exe -accepteula $path
        } catch {
            Write-Host "handle.exe failed:" $_
        }
    } else {
        Write-Host "handle.exe not found. Install Sysinternals handle and add to PATH to inspect open handles."
    }
}

function Try-RemovePath($fullPath) {
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            if (Test-Path $fullPath) {
                Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                Write-Host "Removed: $fullPath"
                return $true
            } else {
                Write-Host "Path missing: $fullPath"
                return $true
            }
        } catch {
            Write-Host ("Attempt {0}/{1} failed to remove {2}:" -f ($i+1), $Retries, $fullPath)
            Write-Host ($_.Exception.Message)
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    return $false
}

function Force-OwnershipAndRemove($fullPath) {
    Write-Host "Attempting takeown/icacls on: $fullPath (requires admin)"
    try { cmd /c "takeown /f \"$fullPath\" /r /d y" | Out-Null } catch { Write-Host "takeown failed or requires elevation" }
    try { cmd /c "icacls \"$fullPath\" /grant *S-1-1-0:F /T /C" | Out-Null } catch { Write-Host "icacls failed or requires elevation" }
    try {
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
        Write-Host "Removed after ACL change: $fullPath"
        return $true
    } catch {
        Write-Host "Still failed to remove after ACL changes:" $_.Exception.Message
        return $false
    }
}

if (-not $Force) { Write-Host "Dry-run: pass -Force to enable ACL fallback (requires Admin)." }

Stop-CommonProcesses

$results = @()
foreach ($p in $Paths) {
    $resolved = $null
    try { $resolved = (Resolve-Path $p -ErrorAction Stop).ProviderPath } catch { }
    if (-not $resolved) { $resolved = Join-Path (Get-Location) $p }
    Write-Host "`nProcessing: $resolved"
    $ok = Try-RemovePath $resolved
    if (-not $ok) {
        Show-HandleInfo $resolved
        if ($Force) {
            $ok2 = Force-OwnershipAndRemove $resolved
            $results += @{ path=$resolved; removed=$ok2 }
        } else {
            $results += @{ path=$resolved; removed=$false }
        }
    } else {
        $results += @{ path=$resolved; removed=$true }
    }
}

Write-Host "`nSummary:"
$results | Format-Table -AutoSize

if ($results | Where-Object { -not $_.removed }) {
    Write-Host "Some paths could not be removed. Common causes: OneDrive/Dropbox sync, open editors/terminals, or antivirus." 
    Write-Host "If you still see failures run PowerShell as Administrator with the -Force flag to allow takeown/icacls fallback." 
    Write-Host "Example (Admin):" -ForegroundColor Yellow
    Write-Host "  pwsh -NoProfile -File .\scripts\clean-and-unlock.ps1 -Paths 'cypress/downloads' -Force" -ForegroundColor Yellow
}

exit 0
<#
clean-and-unlock.ps1

Stops common lock-holding processes and attempts to remove specified paths.
If removal fails and `-Force` is provided, the script will attempt `takeown` and
<#
clean-and-unlock.ps1

Stops common lock-holding processes and attempts to remove specified paths.
If removal fails and `-Force` is provided, the script will attempt `takeown` and
`icacls` to take ownership and grant permissions (requires running PowerShell
as Administrator).

Usage:
  pwsh -NoProfile -File .\scripts\clean-and-unlock.ps1 -Paths 'cypress/downloads' -Force
#>

param(
    [string[]] $Paths = @('cypress/downloads'),
    [int] $Retries = 5,
    [int] $DelaySeconds = 2,
    [switch] $Force
)

function Stop-CommonProcesses {
    $procs = @('node','ngrok','code','serve')
    foreach ($p in $procs) {
        try {
            $found = Get-Process -Name $p -ErrorAction SilentlyContinue
            if ($found) {
                Write-Host "Stopping process: $p (PID(s): $($found.Id -join ', '))"
                $found | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # ignore
        }
    }
}

function Show-HandleInfo($path) {
    $handle = Get-Command handle.exe -ErrorAction SilentlyContinue
    if ($handle) {
        Write-Host "handle.exe found — listing handles for: $path"
        try {
            & handle.exe -accepteula $path
        } catch {
            Write-Host "handle.exe failed: $($_)"
        }
    } else {
        Write-Host "handle.exe not found. To inspect open handles install Sysinternals and add to PATH: https://learn.microsoft.com/sysinternals/downloads/handle"
    }
}

function Try-RemovePath($fullPath) {
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            if (Test-Path $fullPath) {
                Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                Write-Host "Removed: $fullPath"
                return $true
            } else {
                Write-Host "Path missing: $fullPath"
                return $true
            }
        } catch {
            Write-Host "Attempt $($i+1)/$Retries failed to remove $fullPath: $($_.Exception.Message)"
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    return $false
}

function Force-OwnershipAndRemove($fullPath) {
    Write-Host "Attempting takeown/icacls on: $fullPath (requires admin)"
    try { cmd /c "takeown /f \"$fullPath\" /r /d y" | Out-Null } catch { Write-Host "takeown command failed or requires elevation" }
    try { cmd /c "icacls \"$fullPath\" /grant *S-1-1-0:F /T /C" | Out-Null } catch { Write-Host "icacls command failed or requires elevation" }
    try {
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
        Write-Host "Removed after ACL change: $fullPath"
        return $true
    } catch {
        Write-Host "Still failed to remove after ACL changes: $($_.Exception.Message)"
        return $false
    }
}

if (-not $Force) { Write-Host "Dry-run: pass -Force to enable ACL fallback (requires Admin)." }

Stop-CommonProcesses

$results = @()
foreach ($p in $Paths) {
    $resolved = $null
    try { $resolved = (Resolve-Path $p -ErrorAction Stop).ProviderPath } catch { }
    if (-not $resolved) { $resolved = Join-Path (Get-Location) $p }
    Write-Host "`nProcessing: $resolved"
    $ok = Try-RemovePath $resolved
    if (-not $ok) {
        Show-HandleInfo $resolved
        if ($Force) {
            $ok2 = Force-OwnershipAndRemove $resolved
            $results += @{ path=$resolved; removed=$ok2 }
        } else {
            $results += @{ path=$resolved; removed=$false }
        }
    } else {
        $results += @{ path=$resolved; removed=$true }
    }
}

Write-Host "`nSummary:"
$results | Format-Table -AutoSize

if ($results | Where-Object { -not $_.removed }) {
    Write-Host "Some paths could not be removed. Common causes: OneDrive/Dropbox sync, open editors/terminals, or antivirus." 
    Write-Host "If you still see failures run PowerShell as Administrator with the -Force flag to allow takeown/icacls fallback." 
    Write-Host "Example (Admin):" -ForegroundColor Yellow
    Write-Host "  pwsh -NoProfile -File .\scripts\clean-and-unlock.ps1 -Paths 'cypress/downloads' -Force" -ForegroundColor Yellow
}

exit 0
What it does:
- Stops common lock-holding processes (node, ngrok, code, serve)
- Tries to remove each path with retries
- If removal fails, attempts `takeown` and `icacls` to take ownership and grant full control (may require Admin)
- If Sysinternals `handle.exe` is available, prints handles that reference the path to help debug

#>

param(
    [string[]] $Paths = @('server/data','test-results'),
    [int] $Retries = 5,
    [int] $DelaySeconds = 2,
    [switch] $Force
)

function Stop-CommonProcesses {
    $procs = @('node','ngrok','code','serve')
    foreach ($p in $procs) {
        try {
            $found = Get-Process -Name $p -ErrorAction SilentlyContinue
            if ($found) {
                Write-Host "Stopping process: $p (PID(s): $($found.Id -join ', '))"
                $found | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # ignore
        }
    }
}

function Show-HandleInfo($path) {
    $handle = Get-Command handle.exe -ErrorAction SilentlyContinue
    if ($handle) {
        Write-Host "handle.exe found — listing handles for: $path"
        try {
            & handle.exe -accepteula $path
        } catch {
            Write-Host "handle.exe failed: $($_)"
        <#
        PowerShell helper: clean-and-unlock.ps1

        Usage:
          .\clean-and-unlock.ps1 -Paths 'server/data','test-results' -Force

        This script stops common lock-holding processes and attempts to remove specified
        paths. If removal fails it can take ownership (with -Force) and adjust ACLs.
        #>

        param(
            [string[]] $Paths = @('server/data','test-results'),
            [int] $Retries = 5,
            [int] $DelaySeconds = 2,
            [switch] $Force
        )

        function Stop-CommonProcesses {
            $procs = @('node','ngrok','code','serve')
            foreach ($p in $procs) {
                try {
                    $found = Get-Process -Name $p -ErrorAction SilentlyContinue
                    if ($found) {
                        Write-Host "Stopping process: $p (PID(s): $($found.Id -join ', '))"
                        $found | Stop-Process -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    # ignore
                }
            }
        }

        function Show-HandleInfo($path) {
            $handle = Get-Command handle.exe -ErrorAction SilentlyContinue
            if ($handle) {
                Write-Host "handle.exe found — listing handles for: $path"
                try { & handle.exe -accepteula $path } catch { Write-Host "handle.exe failed: $($_)" }
            } else {
                Write-Host "handle.exe not found. To inspect open handles install Sysinternals and add to PATH: https://docs.microsoft.com/sysinternals/downloads/handle"
            }
        }

        function Try-RemovePath($fullPath) {
            for ($i = 0; $i -lt $Retries; $i++) {
                try {
                    if (Test-Path $fullPath) {
                        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                        Write-Host "Removed: $fullPath"
                        return $true
                    } else {
                        Write-Host "Path missing: $fullPath"
                        return $true
                    }
                } catch {
                    Write-Host ("Attempt {0}/{1} failed to remove {2}: {3}" -f ($i+1), $Retries, $fullPath, $_.Exception.Message)
                    Start-Sleep -Seconds $DelaySeconds
                }
            }
            return $false
        }

        function Force-OwnershipAndRemove($fullPath) {
            Write-Host "Attempting takeown/icacls on: $fullPath (requires admin)"
            try { cmd /c "takeown /f \"$fullPath\" /r /d y" | Out-Null } catch { Write-Host "takeown failed or requires elevation" }
            try { cmd /c "icacls \"$fullPath\" /grant *S-1-1-0:F /T /C" | Out-Null } catch { Write-Host "icacls failed or requires elevation" }
            try {
                Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                Write-Host "Removed after ACL change: $fullPath"
                return $true
            } catch {
                Write-Host ("Still failed to remove after ACL changes: {0}" -f $_.Exception.Message)
                return $false
            }
        }

        if (-not $Force) { Write-Host "Dry-run: pass -Force to enable ACL fallback (requires Admin)." }

        Stop-CommonProcesses

        $results = @()
        foreach ($p in $Paths) {
            $full = (Resolve-Path $p -ErrorAction SilentlyContinue).ProviderPath 2>$null
            if (-not $full) { $full = Join-Path (Get-Location) $p }
            Write-Host "`nProcessing: $full"
            $ok = Try-RemovePath $full
            if (-not $ok) {
                Show-HandleInfo $full
                if ($Force) { $ok2 = Force-OwnershipAndRemove $full; $results += @{ path=$full; removed=$ok2 } } else { $results += @{ path=$full; removed=$false } }
            } else { $results += @{ path=$full; removed=$true } }
        }

        Write-Host "`nSummary:"
        $results | Format-Table -AutoSize

        if ($results | Where-Object { -not $_.removed }) {
            Write-Host "Some paths could not be removed. Common causes: OneDrive/Dropbox sync, open editors/terminals, or antivirus. Run PowerShell as Administrator with -Force to allow ownership/ACL fallback."
            Write-Host 'Example (Admin): .\scripts\clean-and-unlock.ps1 -Paths "server/data","test-results" -Force' -ForegroundColor Yellow
        }

        exit 0
            if ($found) {
                Write-Host ('Stopping process: ' + $p + ' (PID(s): ' + ($found.Id -join ', ') + ')')
                $found | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # ignore
        }
    }
}

function Show-HandleInfo($path) {
    $handle = Get-Command handle.exe -ErrorAction SilentlyContinue
    if ($handle) {
        Write-Host ('handle.exe found — listing handles for: ' + $path)
        try {
            & handle.exe -accepteula $path
        } catch {
            Write-Host ('handle.exe failed: ' + $_)
        }
    } else {
        Write-Host 'handle.exe not found. To inspect open handles install Sysinternals and add to PATH: https://docs.microsoft.com/sysinternals/downloads/handle'
    }
}

function Try-RemovePath($fullPath) {
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            if (Test-Path $fullPath) {
                Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                Write-Host ('Removed: ' + $fullPath)
                return $true
            } else {
                Write-Host ('Path missing: ' + $fullPath)
                return $true
            }
        } catch {
            Write-Host ("Attempt {0}/{1} failed to remove {2}: {3}" -f ($i+1), $Retries, $fullPath, $_.Exception.Message)
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    return $false
}

function Force-OwnershipAndRemove($fullPath) {
    Write-Host ('Attempting takeown/icacls on: ' + $fullPath + ' (requires admin)')
    try {
        cmd /c "takeown /f \"$fullPath\" /r /d y" | Out-Null
    } catch {
        Write-Host 'takeown command failed or requires elevation'
    }
    try {
        # grant Everyone temporarily full control (S-1-1-0 is Everyone)
        cmd /c "icacls \"$fullPath\" /grant *S-1-1-0:F /T /C" | Out-Null
    } catch {
        Write-Host 'icacls command failed or requires elevation'
    }
    try {
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
        Write-Host ('Removed after ACL change: ' + $fullPath)
        return $true
    } catch {
        Write-Host ('Still failed to remove after ACL changes: ' + $_.Exception.Message)
        return $false
    }
}

if (-not $Force) {
    Write-Host 'Running with dry-run checks. Pass -Force to perform takeown/icacls fallback requiring elevation.'
}

Stop-CommonProcesses

$results = @()
foreach ($p in $Paths) {
    $resolved = $null
    try { $resolved = (Resolve-Path $p -ErrorAction Stop).ProviderPath } catch { }
    if (-not $resolved) { $resolved = Join-Path (Get-Location) $p }
    Write-Host ''
    Write-Host ('Processing: ' + $resolved)
    $ok = Try-RemovePath $resolved
    if (-not $ok) {
        Show-HandleInfo $resolved
        if ($Force) {
            $ok2 = Force-OwnershipAndRemove $resolved
            $results += @{ path=$resolved; removed=$ok2 }
        } else {
            $results += @{ path=$resolved; removed=$false }
        }
    } else {
        $results += @{ path=$resolved; removed=$true }
    }
}

Write-Host ''
Write-Host 'Summary:'
$results | Format-Table -AutoSize

if ($results | Where-Object { -not $_.removed }) {
    Write-Host ''
    Write-Host 'Some paths could not be removed. Common causes: OneDrive/Dropbox sync, open editors/terminals, or antivirus.'
    Write-Host 'If you still see failures run PowerShell as Administrator with the -Force flag to allow takeown/icacls fallback.'
    Write-Host ''
    Write-Host 'Example (Admin):' -ForegroundColor Yellow
    Write-Host '  .\scripts\clean-and-unlock.ps1 -Paths "server/data","test-results" -Force' -ForegroundColor Yellow
}

<#
PowerShell helper: clean-and-unlock.ps1

Usage:
  .\clean-and-unlock.ps1 -Paths 'server/data','test-results' -Force

What it does:
- Stops common lock-holding processes (node, ngrok, code, serve)
- Tries to remove each path with retries
- If removal fails, attempts `takeown` and `icacls` to take ownership and grant full control (may require Admin)
- If Sysinternals `handle.exe` is available, prints handles that reference the path to help debug

#>

param(
    [string[]] $Paths = @('server/data','test-results'),
    [int] $Retries = 5,
    [int] $DelaySeconds = 2,
    [switch] $Force
)

function Stop-CommonProcesses {
    $procs = @('node','ngrok','code','serve')
    foreach ($p in $procs) {
        try {
            $found = Get-Process -Name $p -ErrorAction SilentlyContinue
            if ($found) {
                Write-Host "Stopping process: $p (PID(s): $($found.Id -join ', '))"
                $found | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # ignore
        }
    }
}

function Show-HandleInfo($path) {
    $handle = Get-Command handle.exe -ErrorAction SilentlyContinue
    if ($handle) {
        Write-Host "handle.exe found — listing handles for: $path"
        try {
            & handle.exe -accepteula $path
        } catch {
            Write-Host "handle.exe failed: $($_)"
        }
    } else {
        Write-Host "handle.exe not found. To inspect open handles install Sysinternals and add to PATH: https://docs.microsoft.com/sysinternals/downloads/handle"
    }
}

function Try-RemovePath($fullPath) {
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            if (Test-Path $fullPath) {
                Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                Write-Host "Removed: $fullPath"
                return $true
            } else {
                Write-Host "Path missing: $fullPath"
                return $true
            }
        } catch {
            Write-Host ("Attempt {0}/{1} failed to remove {2}: {3}" -f ($i+1), $Retries, $fullPath, $_.Exception.Message)
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    return $false
}

function Force-OwnershipAndRemove($fullPath) {
    Write-Host "Attempting takeown/icacls on: $fullPath (requires admin)"
    try {
        cmd /c "takeown /f \"$fullPath\" /r /d y" | Out-Null
    } catch {
        Write-Host "takeown command failed or requires elevation"
    }
    try {
        # grant Everyone temporarily full control (S-1-1-0 is Everyone)
        cmd /c "icacls \"$fullPath\" /grant *S-1-1-0:F /T /C" | Out-Null
    } catch {
        Write-Host "icacls command failed or requires elevation"
    }
    try {
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
        Write-Host "Removed after ACL change: $fullPath"
        return $true
    } catch {
        Write-Host ("Still failed to remove after ACL changes: {0}" -f $_.Exception.Message)
        return $false
    }
}

if (-not $Force) {
    Write-Host "Running with dry-run checks. Pass -Force to perform takeown/icacls fallback requiring elevation."
}

Stop-CommonProcesses

$results = @()
foreach ($p in $Paths) {
    $full = (Resolve-Path $p -ErrorAction SilentlyContinue).ProviderPath 2>$null
    if (-not $full) { $full = Join-Path (Get-Location) $p }
    Write-Host "`nProcessing: $full"
    $ok = Try-RemovePath $full
    if (-not $ok) {
        Show-HandleInfo $full
        if ($Force) {
            $ok2 = Force-OwnershipAndRemove $full
            $results += @{ path=$full; removed=$ok2 }
        } else {
            $results += @{ path=$full; removed=$false }
        }
    } else {
        $results += @{ path=$full; removed=$true }
    }
}

Write-Host "`nSummary:"
$results | Format-Table -AutoSize

if ($results | Where-Object { -not $_.removed }) {
    Write-Host "`nSome paths could not be removed. Common causes: OneDrive/Dropbox sync, open editors/terminals, or antivirus.`nIf you still see failures run PowerShell as Administrator with the -Force flag to allow takeown/icacls fallback.`nExample (Admin):"
    Write-Host '  .\scripts\clean-and-unlock.ps1 -Paths "server/data","test-results" -Force' -ForegroundColor Yellow
}

exit 0
PowerShell helper: clean-and-unlock.ps1

Usage:
  .\clean-and-unlock.ps1 -Paths 'server/data','test-results' -Force

What it does:
- Stops common lock-holding processes (node, ngrok, code, serve)
- Tries to remove each path with retries
- If removal fails, attempts `takeown` and `icacls` to take ownership and grant full control (may require Admin)
- If Sysinternals `handle.exe` is available, prints handles that reference the path to help debug

#>

param(
    [string[]] $Paths = @('server\data','test-results'),
    [int] $Retries = 5,
    [int] $DelaySeconds = 2,
    [switch] $Force
)

function Stop-CommonProcesses {
    $procs = @('node','ngrok','code','serve')
    foreach ($p in $procs) {
        try {
            $found = Get-Process -Name $p -ErrorAction SilentlyContinue
            if ($found) {
                Write-Host "Stopping process: $p (PID(s): $($found.Id -join ', '))"
                $found | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # ignore
        }
    }
}

function Show-HandleInfo($path) {
    $handle = Get-Command handle.exe -ErrorAction SilentlyContinue
    if ($handle) {
        Write-Host "handle.exe found — listing handles for: $path"
        try {
            & handle.exe -accepteula $path
        } catch {
            Write-Host "handle.exe failed: $_"
        }
    } else {
        Write-Host "handle.exe not found. To inspect open handles install Sysinternals and add to PATH: https://docs.microsoft.com/sysinternals/downloads/handle"
    }
}

function Try-RemovePath($fullPath) {
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            if (Test-Path $fullPath) {
                Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                Write-Host "Removed: $fullPath"
                return $true
            } else {
                Write-Host "Path missing: $fullPath"
                return $true
            }
        } catch {
            Write-Host "Attempt $($i+1)/$Retries failed to remove $fullPath: $($_.Exception.Message)"
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    return $false
}

function Force-OwnershipAndRemove($fullPath) {
    Write-Host "Attempting takeown/icacls on: $fullPath (requires admin)"
    try {
        cmd /c "takeown /f \"$fullPath\" /r /d y" | Out-Null
    } catch {
        Write-Host "takeown command failed or requires elevation"
    }
    try {
        # grant Everyone temporarily full control (S-1-1-0 is Everyone)
        cmd /c "icacls \"$fullPath\" /grant *S-1-1-0:F /T /C" | Out-Null
    } catch {
        Write-Host "icacls command failed or requires elevation"
    }
    try {
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
        Write-Host "Removed after ACL change: $fullPath"
        return $true
    } catch {
        Write-Host "Still failed to remove after ACL changes: $($_.Exception.Message)"
        return $false
    }
}

if (-not $Force) {
    Write-Host "Running with dry-run checks. Pass -Force to perform takeown/icacls fallback requiring elevation."
}

Stop-CommonProcesses

$results = @()
foreach ($p in $Paths) {
    $full = (Resolve-Path $p -ErrorAction SilentlyContinue).ProviderPath 2>$null
    if (-not $full) { $full = Join-Path (Get-Location) $p }
    Write-Host "\nProcessing: $full"
    $ok = Try-RemovePath $full
    if (-not $ok) {
        Show-HandleInfo $full
        if ($Force) {
            $ok2 = Force-OwnershipAndRemove $full
            $results += @{ path=$full; removed=$ok2 }
        } else {
            $results += @{ path=$full; removed=$false }
        }
    } else {
        $results += @{ path=$full; removed=$true }
    }
}

Write-Host '\nSummary:'
$results | Format-Table -AutoSize

if ($results | Where-Object { -not $_.removed }) {
    Write-Host '\nSome paths could not be removed. Common causes: OneDrive/Dropbox sync, open editors/terminals, or antivirus.\nIf you still see failures run PowerShell as Administrator with the -Force flag to allow takeown/icacls fallback.\nExample (Admin):'
    Write-Host '  .\scripts\clean-and-unlock.ps1 -Paths "server/data","test-results" -Force' -ForegroundColor Yellow
}

exit 0
