param(
    [string]$RepoPath = (Get-Location).Path,
    [int]$DebounceMs = 3000
)

$ErrorActionPreference = "Stop"

function Has-Git() {
    try { git --version | Out-Null; return $true } catch { return $false }
}

function Get-DirtyStatus() {
    try {
        $status = git status -s
        return -not [string]::IsNullOrWhiteSpace($status)
    } catch {
        return $false
    }
}

function Auto-CommitPush() {
    if (-not (Has-Git)) { Write-Host "git not found"; return }
    if (-not (Get-DirtyStatus)) { return }

    try {
        git add -A | Out-Null
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $msg = "auto-sync: $ts"
        git commit -m $msg | Out-Null
        git push | Out-Null
        Write-Host "Auto-pushed at $ts"
    } catch {
        Write-Warning "Auto-push failed: $($_.Exception.Message)"
    }
}

if (-not (Test-Path $RepoPath)) {
    Write-Error "Path not found: $RepoPath"
    exit 1
}

Set-Location $RepoPath

$ignorePatterns = @(
    "\\.git($|\\)",
    "node_modules($|\\)",
    "\\.trae($|\\)",
    "\\.cache($|\\)",
    "dist($|\\)"
)

function Should-IgnorePath([string]$path) {
    foreach ($p in $ignorePatterns) {
        if ($path -match $p) { return $true }
    }
    return $false
}

$global:lastChange = $null

$watcher = New-Object System.IO.FileSystemWatcher $RepoPath
$watcher.IncludeSubdirectories = $true
$watcher.Filter = "*.*"
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, DirectoryName, Size'
$watcher.EnableRaisingEvents = $true

$action = {
    $fp = $Event.SourceEventArgs.FullPath
    if (-not (Should-IgnorePath $fp)) {
        $global:lastChange = Get-Date
    }
}

Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $action | Out-Null

$timer = New-Object System.Timers.Timer
$timer.Interval = $DebounceMs
$timer.AutoReset = $true
Register-ObjectEvent -InputObject $timer -EventName Elapsed -Action {
    if ($global:lastChange -ne $null) {
        $since = (New-TimeSpan -Start $global:lastChange -End (Get-Date)).TotalMilliseconds
        if ($since -ge $DebounceMs) {
            $global:lastChange = $null
            Auto-CommitPush
        }
    }
} | Out-Null
$timer.Start()

Write-Host "Auto-push watcher started on $RepoPath (debounce ${DebounceMs}ms)."
Write-Host "Ignore: $($ignorePatterns -join ', ')"
Write-Host "Press Ctrl+C to stop."

while ($true) {
    Start-Sleep -Seconds 1
}
