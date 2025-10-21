$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Starting preview server (npx serve -s dist -l 5173) in background..."
Start-Process -FilePath cmd.exe -ArgumentList '/c','npx serve -s dist -l 5173 > "C:\temp\preview.log" 2>&1' -WorkingDirectory $repoRoot -WindowStyle Hidden
Start-Sleep -Seconds 2
# Poll port
$found = $false
for($i=0;$i -lt 20 -and -not $found; $i++){
    try{
        $c = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
        if($c){ $found = $true; break }
    } catch{}
    Start-Sleep -Seconds 1
}
if($found){ Write-Host "Preview server is listening on port 5173" } else { Write-Host "Preview server not listening yet. Tail preview log:"; if(Test-Path 'C:\temp\preview.log'){ Get-Content 'C:\temp\preview.log' -Tail 200 } else { Write-Host 'no preview.log found' } }
