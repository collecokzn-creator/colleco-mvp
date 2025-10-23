$files = @('.\\login_register_failed.png', '.\\login_minimal_failed.png')
foreach ($f in $files) {
  if (-not (Test-Path $f)) { Write-Host "Missing: $f"; continue }
  try {
    $bytes = [System.IO.File]::ReadAllBytes($f)
    $size = $bytes.Length
  $first8 = ($bytes[0..7] | ForEach-Object { $_.ToString('X2') }) -join ' '
    Write-Host "File: $f"
    Write-Host "  Size: $size bytes"
    Write-Host "  Header (first 8 bytes): $first8"
    if ($first8 -ne '89 50 4E 47 0D 0A 1A 0A') { Write-Host '  Not a PNG or header mismatch'; continue }
    # PNG width/height are big-endian at bytes 16-23 (IHDR chunk)
    $wBytes = $bytes[16..19]
    $hBytes = $bytes[20..23]
    [Array]::Reverse($wBytes)
    [Array]::Reverse($hBytes)
    $width = [System.BitConverter]::ToInt32($wBytes,0)
    $height = [System.BitConverter]::ToInt32($hBytes,0)
    Write-Host "  Dimensions: ${width}x${height}"
  } catch {
    Write-Host ('  Error reading {0}: {1}' -f $f, $_)
  }
}
