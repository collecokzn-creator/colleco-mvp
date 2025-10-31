$dir = Join-Path $env:TEMP 'colleco-ci-logs'
if (-not (Test-Path $dir)) { Write-Host "No local artifact folder at $dir"; exit 0 }
Get-ChildItem -Path $dir -Recurse -File | ForEach-Object {
    $f = $_
    Write-Host "Searching: $($f.FullName)"
    Select-String -Path $f.FullName -Pattern 'Blocked a frame with origin','SecurityError','EADDRINUSE','uncaught','UnhandledPromiseRejection','Error:','TypeError','ReferenceError' -SimpleMatch -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "$($f.FullName) : $($_.LineNumber) : $($_.Line)"
    }
}