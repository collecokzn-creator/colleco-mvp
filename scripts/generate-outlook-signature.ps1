<#
PowerShell script to generate an Outlook signature package in the current user's Signatures folder.
Usage (PowerShell):
  .\generate-outlook-signature.ps1 -Name "CollEco" \
    -LogoUrl "https://www.travelcolleco.com/assets/logo.png" \
    -GlobeUrl "https://www.travelcolleco.com/assets/globe.png" \
    -Email "collecotravel@gmail.com"

This script will:
 - create a folder %APPDATA%\Microsoft\Signatures if missing
 - create a signature folder and images (SignatureName_files)
 - write SignatureName.htm, SignatureName.rtf, SignatureName.txt
 - images are downloaded into the files folder so Outlook will embed them locally

Notes:
 - Run in PowerShell with network access. If running on CI or restricted machine, images may fail to download.
 - Tested on Windows 10/11 with PowerShell 7+ and Windows PowerShell 5.1.
#>

param(
  [string]$Name = 'CollEco',
  [string]$LogoUrl = 'https://www.travelcolleco.com/assets/logo.png',
  [string]$GlobeUrl = 'https://www.travelcolleco.com/assets/globe.png',
  [string]$Email = 'collecotravel@gmail.com',
  [string]$Phone = '+27 73 399 4708',
  [string]$Website = 'https://www.travelcolleco.com'
)

Set-StrictMode -Version Latest

$appData = $env:APPDATA
if (-not $appData) { Write-Error "APPDATA is not set. This script must run on Windows."; exit 1 }

$signaturesDir = Join-Path $appData 'Microsoft\Signatures'
if (-not (Test-Path $signaturesDir)) { New-Item -ItemType Directory -Path $signaturesDir | Out-Null }

$sigName = $Name
$sigFilesFolder = Join-Path $signaturesDir ("${sigName}_files")
if (-not (Test-Path $sigFilesFolder)) { New-Item -ItemType Directory -Path $sigFilesFolder | Out-Null }

# Download images
function Download-File($url, $outPath) {
  try {
    Write-Host "Downloading $url -> $outPath"
    Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing -ErrorAction Stop
    return $true
  } catch {
    Write-Warning "Failed to download $url: $($_.Exception.Message)"
    return $false
  }
}

$logoPath = Join-Path $sigFilesFolder 'logo.png'
$globePath = Join-Path $sigFilesFolder 'globe.png'

$logoOk = Download-File $LogoUrl $logoPath
$globeOk = Download-File $GlobeUrl $globePath

# Build HTML signature referencing local files
$htmPath = Join-Path $signaturesDir ("$sigName.htm")
$rtfPath = Join-Path $signaturesDir ("$sigName.rtf")
$txtPath = Join-Path $signaturesDir ("$sigName.txt")

$logoSrc = if ($logoOk) { "$sigName_files/logo.png" } else { $LogoUrl }
$globeSrc = if ($globeOk) { "$sigName_files/globe.png" } else { $GlobeUrl }

$htm = @"
<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter, Arial, sans-serif;color:#C65A1E;background:#fff;">
<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;border:none;">
  <tr>
    <td style="width:20%;text-align:left;padding:6px 8px;vertical-align:middle;">
      <a href="$Website" target="_blank" rel="noopener noreferrer">
        <img src="$logoSrc" alt="CollEco Travel Logo" width="70" style="border:0;display:block;">
      </a>
    </td>
    <td style="width:60%;text-align:left;font-size:12px;line-height:1.6;padding:6px 8px;vertical-align:middle;color:#333;">
      <div><strong style="color:#C65A1E;">Bika Collin Mkhize</strong> <span style="color:#666;">| Managing Director</span></div>
      <div style="margin-top:4px;color:#444;font-size:12px;">
        <a href="mailto:$Email" style="color:#C65A1E;text-decoration:none;">$Email</a>
        <span style="color:#666"> | </span>
        <a href="tel:$Phone" style="color:#333;text-decoration:none;">$Phone</a>
        <span style="color:#666"> | </span>
        <a href="$Website" style="color:#C65A1E;text-decoration:none;">$Website</a>
      </div>
      <div style="margin-top:6px;">
        <span style="font-style:italic;color:#555;font-size:12px;">Travel | Connect | Collaborate</span>
        <a href="$Website" target="_blank" rel="noopener noreferrer" style="background-color:#C65A1E;color:#fff;text-decoration:none;padding:6px 14px;border-radius:6px;margin-left:8px;font-weight:bold;display:inline-block;">Start Living</a>
      </div>
    </td>
    <td style="width:20%;text-align:right;padding:6px 8px;vertical-align:middle;">
      <a href="$Website" target="_blank" rel="noopener noreferrer">
        <img src="$globeSrc" alt="CollEco Globe" width="60" style="border:0;display:block;">
      </a>
    </td>
  </tr>
</table>
</body>
</html>
"@

$htm | Out-File -FilePath $htmPath -Encoding UTF8

# RTF: simple plain fallback (Outlook uses it for rich text clients)
$rtf = "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}\\fs20 Bika Collin Mkhize \\par Managing Director \\par $Email | $Phone | $Website }"
$rtf | Out-File -FilePath $rtfPath -Encoding ASCII

# Plain text
$txt = "Bika Collin Mkhize | Managing Director`n$Email | $Phone | $Website"
$txt | Out-File -FilePath $txtPath -Encoding UTF8

Write-Host "Signature package created: $htmPath"
if ($logoOk -and $globeOk) { Write-Host "Images saved into: $sigFilesFolder" }
else { Write-Warning "One or more images failed to download. The HTML references remote URLs for missing images." }

Write-Host "You can now open Outlook → File → Options → Mail → Signatures and select the signature named '$sigName'."
