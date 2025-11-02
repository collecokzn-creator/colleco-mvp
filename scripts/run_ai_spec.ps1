$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -Path C:\temp -ItemType Directory -Force | Out-Null

# Start API on PORT=4002 in background (redirect logs)
Start-Process -FilePath cmd.exe -ArgumentList '/c','set PORT=4002 && node server/server.js > "C:\temp\api.log" 2>&1' -WorkingDirectory $repoRoot -WindowStyle Hidden
# Start static preview on port 5173 in background (redirect logs)
Start-Process -FilePath cmd.exe -ArgumentList '/c','npx serve -s dist -l 5173 > "C:\temp\preview.log" 2>&1' -WorkingDirectory $repoRoot -WindowStyle Hidden

Start-Sleep -Seconds 2
Write-Host 'Started background processes. Polling for readiness...'

$apiReady=$false; $previewReady=$false
for($i=0;$i -lt 60 -and -not ($apiReady -and $previewReady); $i++){
    if(-not $apiReady){
        try{ $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4002/health' -TimeoutSec 2; if($r.StatusCode -eq 200){ $apiReady=$true; Write-Host 'API ready (4002)'; } } catch{}
    }
    if(-not $previewReady){
        try{ $r2=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:5173/' -TimeoutSec 2; if($r2.StatusCode -eq 200){ $previewReady=$true; Write-Host 'Preview ready (5173)'; } } catch{}
    }
    Start-Sleep -Seconds 1
}

if($apiReady -and $previewReady){
    Write-Host 'Both servers ready - running Cypress spec...'
    npx cypress run --browser chrome --spec "cypress/e2e/ai_generator.cy.js" --headed
} else {
    Write-Host 'Servers not ready after timeout - dumping logs'
    if(Test-Path 'C:\temp\api.log'){ Write-Host '--- api.log (tail 200) ---'; Get-Content 'C:\temp\api.log' -Tail 200 }
    if(Test-Path 'C:\temp\preview.log'){ Write-Host '--- preview.log (tail 200) ---'; Get-Content 'C:\temp\preview.log' -Tail 200 }
    exit 2
}
