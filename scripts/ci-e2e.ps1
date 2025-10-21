param(
  [int]$ApiPort = 4002,
  [int]$PreviewPort = 5173,
  [int]$WaitSeconds = 60
)

Set-StrictMode -Version Latest
Write-Host "CI E2E: building production assets..."
npm run build

$logsDir = Join-Path $env:TEMP "colleco-ci-logs"
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

$demoLog = Join-Path $logsDir "demo-api.log"
$previewLog = Join-Path $logsDir "preview.log"

# Remove stale log files to avoid "file in use" when redirecting output from cmd.exe
foreach ($f in @($demoLog, $previewLog)) {
  if (Test-Path $f) {
    try { Remove-Item -Force -ErrorAction SilentlyContinue $f } catch { }
  }
}

# Ensure important artifacts are copied into the $logsDir so the workflow can upload them.
function Save-Artifacts() {
  try {
    if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }
    Write-Host "Collecting artifacts into: $logsDir"

    # Ensure the demo and preview logs are present in the logs dir (Start-NodeProcess may have chosen alternate names)
    try { if ($demoLog -and (Test-Path $demoLog)) { Copy-Item -Path $demoLog -Destination $logsDir -Force -ErrorAction SilentlyContinue } } catch {}
    try { if ($previewLog -and (Test-Path $previewLog)) { Copy-Item -Path $previewLog -Destination $logsDir -Force -ErrorAction SilentlyContinue } } catch {}

    # Copy Cypress artifacts if they exist
    $cypressVideos = Join-Path (Get-Location) 'cypress' | Join-Path -ChildPath 'videos'
    if (Test-Path $cypressVideos) { Copy-Item -Path $cypressVideos -Destination (Join-Path $logsDir 'cypress-videos') -Recurse -Force -ErrorAction SilentlyContinue }
    $cypressScreens = Join-Path (Get-Location) 'cypress' | Join-Path -ChildPath 'screenshots'
    if (Test-Path $cypressScreens) { Copy-Item -Path $cypressScreens -Destination (Join-Path $logsDir 'cypress-screenshots') -Recurse -Force -ErrorAction SilentlyContinue }
    $cypressReports = Join-Path (Get-Location) 'cypress' | Join-Path -ChildPath 'results'
    if (Test-Path $cypressReports) { Copy-Item -Path $cypressReports -Destination (Join-Path $logsDir 'cypress-results') -Recurse -Force -ErrorAction SilentlyContinue }

    # Also copy any test output files at repo root that Cypress might emit
    foreach ($pat in @('cypress-report.html','mochawesome-report','test-results.xml')) {
      if (Test-Path $pat) { Copy-Item -Path $pat -Destination $logsDir -Force -ErrorAction SilentlyContinue }
    }

    # Write a manifest of what we saved
    try { Get-ChildItem -Recurse $logsDir | Select-Object FullName,Length | Out-File -FilePath (Join-Path $logsDir 'artifact-manifest.txt') -Encoding utf8 -Force } catch {}

    # Create a compressed zip of the collected artifacts to reduce upload size
    try {
      $zipName = "colleco-ci-logs-$(Get-Date -Format 'yyyyMMddHHmmss').zip"
      $zipPath = Join-Path $env:TEMP $zipName
      if (Test-Path $zipPath) { Remove-Item -Force $zipPath -ErrorAction SilentlyContinue }
      Write-Host "Creating artifact zip: $zipPath"
      Compress-Archive -Path (Join-Path $logsDir '*') -DestinationPath $zipPath -Force -ErrorAction SilentlyContinue
      # Copy the zip into the logs dir so the workflow artifact upload that targets $logsDir will pick it up too
      try { Copy-Item -Path $zipPath -Destination (Join-Path $logsDir $zipName) -Force -ErrorAction SilentlyContinue } catch {}
    } catch { Write-Host "Failed to create artifact zip: $_" }
  } catch { Write-Host "Save-Artifacts encountered an error: $_" }
}

Write-Host "Starting demo API on port $ApiPort (logs -> $demoLog)"
function Start-NodeProcess($scriptPathOrArgs, $logPath, $envHash = $null) {
  $workDir = (Get-Location)
  # Normalize argument list: accept either a single string or an array of args
  if ($scriptPathOrArgs -is [Array]) {
    $argsArray = $scriptPathOrArgs
  } else {
    # attempt to split on spaces for a simple string; caller should prefer array when args present
    $argsArray = $scriptPathOrArgs -split ' '
  }
  # Before starting, ensure the requested log path is writable. If another process holds the file
  # pick a unique timestamped log filename up-front to avoid collisions and confusing diagnostics.
  $actualLogPath = $logPath
  if (Test-Path $actualLogPath) {
    try {
      $fs = [System.IO.File]::Open($actualLogPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
      $fs.Close()
    } catch {
      $ts = (Get-Date).ToString('yyyyMMddHHmmssfff')
      $actualLogPath = "$($logPath).$ts"
      Write-Host ("Log file $logPath is locked; using alternate log path: $actualLogPath")
    }
  }

  # Try native Start-Process redirection first. If an envHash is provided and the cmdlet supports -Environment, use it.
  try {
    $spCmd = Get-Command -Name Start-Process -ErrorAction SilentlyContinue
    $supportsEnv = $false
    if ($spCmd) { $supportsEnv = ($spCmd.Parameters.Keys -contains 'Environment') }

    if ($envHash -ne $null -and $supportsEnv) {
      Write-Host ("Starting native Start-Process: node {0} (with -Environment) -> log: {1}" -f ($argsArray -join ' '), $actualLogPath)
      if ($envHash) { $envHash.GetEnumerator() | ForEach-Object { Write-Host ("  ENV: {0}={1}" -f $_.Key, $_.Value) } }
      $proc = Start-Process -FilePath "node" -ArgumentList $argsArray -RedirectStandardOutput $actualLogPath -RedirectStandardError $actualLogPath -WorkingDirectory $workDir -NoNewWindow -PassThru -Environment $envHash -ErrorAction Stop
    } else {
      Write-Host ("Starting native Start-Process: node {0} (without -Environment) -> log: {1}" -f ($argsArray -join ' '), $actualLogPath)
      if ($envHash) { $envHash.GetEnumerator() | ForEach-Object { Write-Host ("  (env available but not applied via -Environment) {0}={1}" -f $_.Key, $_.Value) } }
      $proc = Start-Process -FilePath "node" -ArgumentList $argsArray -RedirectStandardOutput $actualLogPath -RedirectStandardError $actualLogPath -WorkingDirectory $workDir -NoNewWindow -PassThru -ErrorAction Stop
    }
  return @{ proc = $proc; log = $actualLogPath }
  } catch {
    # Fallback: try spawning via cmd.exe with file-redirect. If envHash provided, prefix with set VAR=val &&
    $attempt = 0
    while ($attempt -lt 5) {
  $attempt++
  $ts = (Get-Date).ToString('yyyyMMddHHmmssfff')
  # ensure fallback attempts write to $actualLogPath when possible
  $tryLog = if ($attempt -eq 1) { $actualLogPath } else { "$($actualLogPath).$ts.$attempt" }
      # Build the command-line string for cmd.exe fallback
      $argStr = $argsArray | ForEach-Object {
        # quote any arg that contains spaces
        if ($_ -match '\s') { '"' + $_ + '"' } else { $_ }
      } | Out-String
      $argStr = $argStr -replace "\r?\n"," "
      if ($envHash -ne $null) {
        # Use cmd.exe safe 'set "KEY=VALUE"' form so values (and spaces) are preserved and the variable
        # name is not accidentally quoted. Join multiple sets with && so they apply to the same command.
        $envParts = $envHash.GetEnumerator() | ForEach-Object { "set `"$($_.Key)=$($_.Value)`"" }
        $envCmd = ($envParts -join ' && ') + ' && '
        $cmd = "$envCmd node $argStr > `"$tryLog`" 2>&1"
      } else {
        $cmd = "node $argStr > `"$tryLog`" 2>&1"
      }
      Write-Host ("Attempting cmd.exe fallback (attempt {0}): {1}" -f $attempt, $cmd)
      if ($envHash) { $envHash.GetEnumerator() | ForEach-Object { Write-Host ("  ENV-FALLBACK: {0}={1}" -f $_.Key, $_.Value) } }
      try {
        $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -WorkingDirectory $workDir -NoNewWindow -PassThru -ErrorAction Stop
        return @{ proc = $proc; log = $tryLog }
      } catch {
        Start-Sleep -Milliseconds 200
      }
    }
    throw "Failed to start node process $scriptPath after multiple attempts: $_"
  }
}

# Dump which process owns a TCP port (best-effort)
function Dump-PortOwner([int]$port){
  Write-Host "--- Port $port owner diagnostic ---"
  try {
    if (Get-Command -Name Get-NetTCPConnection -ErrorAction SilentlyContinue) {
      $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
      if ($conn) {
        $conn | ForEach-Object {
          $ownerPid = $_.OwningProcess
          Write-Host "Found listener PID=$ownerPid (State=$($_.State))"
          try { Get-CimInstance Win32_Process -Filter (("ProcessId={0}" -f $ownerPid)) | Select-Object ProcessId,CommandLine | ForEach-Object { Write-Host $_.CommandLine } } catch {}
        }
        return
      }
    } else {
      $net = netstat -ano | Select-String ":$port\s"
      if ($net.Count -gt 0) { $net | ForEach-Object { Write-Host $_ } ; return }
    }
    Write-Host "No listener found for port $port"
  } catch { Write-Host "Dump-PortOwner failed: $_" }
}

$demoStart = Start-NodeProcess "server/server.js" $demoLog
$demoProc = $demoStart.proc
$demoLog = $demoStart.log

Start-Sleep -Seconds 1
Start-Sleep -Seconds 1

# Probe a small range for a free preview port to avoid EADDRINUSE flakes.
# We try $PreviewPort..($PreviewPort + 9) and pick the first free port. If none free, fall back to
# attempting to stop any process on the requested $PreviewPort (existing behavior).
Write-Host "Probing ports $PreviewPort..($PreviewPort + 9) for a free preview port..."
$chosenPort = $null
$rangeEnd = $PreviewPort + 9
for ($p = $PreviewPort; $p -le $rangeEnd; $p++) {
  $inUse = $false
  try {
    if (Get-Command -Name Get-NetTCPConnection -ErrorAction SilentlyContinue) {
      $inUse = (Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }) -ne $null
    } else {
      $net = netstat -ano | Select-String ":$p\s"
      $inUse = $net.Count -gt 0
    }
  } catch {
    # If the check fails, assume port is in use to be conservative
    $inUse = $true
  }
  if (-not $inUse) {
    $chosenPort = $p
    break
  }
}

if ($chosenPort) {
  Write-Host "Found free preview port: $chosenPort. Using this port and skipping port-kill logic."
  $PreviewPort = $chosenPort
} else {
  Write-Host "No free ports found in range. Will attempt to stop any process listening on port $PreviewPort."

  Write-Host "Checking for processes listening on preview port $PreviewPort..."
  try {
    $listeners = @()
    if (Get-Command -Name Get-NetTCPConnection -ErrorAction SilentlyContinue) {
      $listeners = Get-NetTCPConnection -LocalPort $PreviewPort -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    } else {
      # Fallback for environments without Get-NetTCPConnection (older PowerShell)
      $net = netstat -ano | Select-String ":$PreviewPort\s"
      foreach ($line in $net) {
        $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
        $ownerPid = $parts[-1]
        $listeners += [PSCustomObject]@{ OwningProcess = [int]$ownerPid }
      }
    }

    foreach ($l in $listeners) {
      $ownerPid = $null
      try { $ownerPid = $l.OwningProcess } catch { }
      if ($ownerPid) {
        Write-Host "Found process $ownerPid listening on port $PreviewPort. Attempting to stop..."
        try {
          Stop-Process -Id $ownerPid -ErrorAction SilentlyContinue
          Start-Sleep -Seconds 1
          if (Get-Process -Id $ownerPid -ErrorAction SilentlyContinue) {
            Write-Host "Process $ownerPid still running. Forcing kill..."
            Stop-Process -Id $ownerPid -Force -ErrorAction SilentlyContinue
          } else {
            Write-Host "Process $ownerPid stopped."
          }
        } catch {
          Write-Host ("Failed to stop process {0}: {1}" -f $ownerPid, $_)
        }
      }
    }
  } catch {
    Write-Host ("Warning: could not check preview port listeners: {0}" -f $_)
  }
}

Write-Host "Using preview port = $PreviewPort"

# Pre-start cleanup: find any existing preview-server.js node processes and stop them.
Write-Host "Checking for existing preview-server processes to avoid port conflicts..."
try {
  $existing = @()
  # Use Win32_Process to inspect command lines; fall back to Get-Process if unavailable
  try {
    $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -and ($_.CommandLine -like '*preview-server.js*' -or $_.CommandLine -like '*scripts\\preview-server.js*') }
    if ($procs) { $existing = $procs }
  } catch {
    # Fallback: search Get-Process and check Path/StartInfo if available
    $procs2 = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and ($_.Path -like '*node*') }
    foreach ($p in $procs2) {
      try {
        $cmd = (Get-CimInstance Win32_Process -Filter ("ProcessId={0}" -f $p.Id) -ErrorAction SilentlyContinue).CommandLine
        if ($cmd -and $cmd -like '*preview-server.js*') { $existing += @{ ProcessId = $p.Id; CommandLine = $cmd }
        }
      } catch { }
    }
  }

  if ($existing.Count -gt 0) {
    Write-Host "Found existing preview-server processes:"
    foreach ($e in $existing) {
      $ownerPid = $null
      $cmdline = $null
      try { $ownerPid = if ($e.PSObject.Properties.Match('ProcessId')) { $e.ProcessId } else { $e.OwningProcess } } catch { }
      try { $cmdline = if ($e.PSObject.Properties.Match('CommandLine')) { $e.CommandLine } else { '' } } catch { }
      Write-Host ("  PID={0} CMD={1}" -f $ownerPid, $cmdline)
      if ($ownerPid) {
        try {
          Write-Host ("  Stopping process {0}..." -f $ownerPid)
          Stop-Process -Id $ownerPid -ErrorAction SilentlyContinue
          Start-Sleep -Seconds 1
          if (Get-Process -Id $ownerPid -ErrorAction SilentlyContinue) {
            Write-Host ("  Process {0} still running; forcing kill..." -f $ownerPid)
            Stop-Process -Id $ownerPid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
          } else {
            Write-Host ("  Process {0} stopped." -f $ownerPid)
          }
        } catch {
          Write-Host ("  Failed to stop process {0}: {1}" -f $ownerPid, $_)
        }
      }
    }
  } else {
    Write-Host "No existing preview-server processes found."
  }
} catch {
  Write-Host ("Pre-start cleanup failed: {0}" -f $_)
}

Write-Host "Starting preview server (serving dist) on port $PreviewPort (logs -> $previewLog)"
try {
  # Start preview server with PORT in environment to ensure the Node script picks it up
  $env = @{ PORT = $PreviewPort.ToString(); HOST = '127.0.0.1' }
  $previewStart = Start-NodeProcess @("scripts/preview-server.js", "--port", $PreviewPort.ToString()) $previewLog $env
  $previewLog = $previewStart.log
} catch {
  Write-Host ("Failed to start preview server: {0}" -f $_)
  Save-Artifacts
  exit 22
}

Write-Host "Preview server started. Log file: $previewLog"
Write-Host "Preview log head (first 20 lines):"
Get-Content $previewLog -TotalCount 20 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
Write-Host "Preview log tail (last 20 lines):"
Get-Content $previewLog -Tail 20 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
Dump-PortOwner $PreviewPort
Dump-PortOwner 5173

function Wait-ForUrl([string]$url,[int]$timeoutSeconds){
  $deadline = (Get-Date).AddSeconds($timeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch { }
    Start-Sleep -Seconds 1
  }
  return $false
}

# Wait until a local TCP port is in LISTEN state. Uses Get-NetTCPConnection when available or netstat fallback.
function Wait-ForPort([int]$port, [int]$timeoutSeconds) {
  $deadline = (Get-Date).AddSeconds($timeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      # Try a direct TCP connect to localhost:$port (works for IPv4/IPv6 and avoids relying on parsing netstat)
      $client = New-Object System.Net.Sockets.TcpClient
      $iar = $client.BeginConnect('127.0.0.1', $port, $null, $null)
      if ($iar.AsyncWaitHandle.WaitOne(500)) {
        try { $client.EndConnect($iar) } catch { }
      }
      if ($client.Connected) { $client.Close(); return $true }
      $client.Close()
    } catch { }

    try {
      # Fallbacks: Get-NetTCPConnection or netstat
      if (Get-Command -Name Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        $found = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
        if ($found) { return $true }
      } else {
        $net = netstat -ano | Select-String ":$port\s"
        if ($net.Count -gt 0) { return $true }
      }
    } catch { }

    Start-Sleep -Seconds 1
  }

  # On failure, emit diagnostics helpful for debugging port/listener mismatches
  Write-Host "Wait-ForPort: timeout waiting for port $port. Netstat output (first 200 lines):"
  try { netstat -ano | Select-Object -First 200 | ForEach-Object { Write-Host $_ } } catch { }
  if (Get-Command -Name Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    try { Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $port } | Format-List * | ForEach-Object { Write-Host $_ } } catch { }
  }

  return $false
}

Write-Host "Waiting for demo API health..."
if (-not (Wait-ForPort $ApiPort $WaitSeconds)) {
  Write-Host "Demo API process did not bind to port $ApiPort within $WaitSeconds seconds. Dumping logs..."
  Get-Content $demoLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
  Save-Artifacts
  exit 20
}

Write-Host "Demo API port bound; waiting for HTTP health endpoint..."
if (-not (Wait-ForUrl "http://127.0.0.1:$ApiPort/health" $WaitSeconds)) {
  Write-Host "Demo API did not become ready within $WaitSeconds seconds. Dumping last 200 lines of $demoLog"
  Get-Content $demoLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
  Save-Artifacts
  exit 20
}

Write-Host "Waiting for preview server root..."
if (-not (Wait-ForPort $PreviewPort $WaitSeconds)) {
  Write-Host "Preview server process did not bind to port $PreviewPort within $WaitSeconds seconds. Dumping logs..."
  Get-Content $previewLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
  Save-Artifacts
  exit 21
}

Write-Host "Preview server port bound; waiting for HTTP root..."
if (-not (Wait-ForUrl "http://127.0.0.1:$PreviewPort/" $WaitSeconds)) {
  Write-Host "Preview server did not become ready within $WaitSeconds seconds. Dumping last 200 lines of $previewLog"
  Get-Content $previewLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
  Save-Artifacts
  exit 21
}

Write-Host "Both services are ready. Running Cypress..."

  # Ensure artifacts are saved before exiting
  Save-Artifacts

$env:API_BASE = "http://127.0.0.1:$ApiPort"
$cyCmd = "npx cypress run --e2e --config baseUrl=http://127.0.0.1:$PreviewPort"
Write-Host "Executing: $cyCmd"
$cyProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cyCmd -NoNewWindow -Wait -PassThru
$exit = $cyProc.ExitCode

Write-Host "Cypress finished with exit code $exit"
Write-Host "Tail of demo API log ($demoLog):"
Get-Content $demoLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host
Write-Host "Tail of preview log ($previewLog):"
Get-Content $previewLog -Tail 200 -ErrorAction SilentlyContinue | Write-Host

exit $exit
