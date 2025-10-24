$files = @('.\\login_register_failed.png', '.\\login_minimal_failed.png')
foreach ($f in $files) {
    if (-not (Test-Path $f)) { Write-Host "Missing $f"; continue }
    $bytes = [System.IO.File]::ReadAllBytes($f)
    if ($bytes[0..7] -ne 137,80,78,71,13,10,26,10) { Write-Host "Not PNG: $f"; continue }
    $width = [System.BitConverter]::ToInt32($bytes[16..19], 0)
    $height = [System.BitConverter]::ToInt32($bytes[20..23], 0)
    Write-Host "$f => ${width}x${height}, $($bytes.Length) bytes"
}