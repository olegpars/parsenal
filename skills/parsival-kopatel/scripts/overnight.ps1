[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Goal,

    [string]$WorkDir = (Get-Location).Path,

    [int]$MaxIterations = 40,

    [int]$SleepOnFailMinutes = 15,

    [int]$MaxConsecutiveFails = 5,

    [string]$AgentCmd = 'claude --print --permission-mode acceptEdits'
)

$ErrorActionPreference = 'Continue'

function Resolve-ExistingFile {
    param([string]$Path)

    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
    if ($null -eq $resolved) {
        Write-Error "Goal file not found: $Path"
        exit 64
    }
    return $resolved.ProviderPath
}

function Resolve-ExistingDirectory {
    param([string]$Path)

    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
    if ($null -eq $resolved) {
        Write-Error "WorkDir not found: $Path"
        exit 64
    }
    if (-not (Test-Path -LiteralPath $resolved.ProviderPath -PathType Container)) {
        Write-Error "WorkDir is not a directory: $Path"
        exit 64
    }
    return $resolved.ProviderPath
}

function Get-TextOrEmpty {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return ''
    }
    return (Get-Content -LiteralPath $Path -Raw -Encoding utf8)
}

function Add-StatusLine {
    param([string]$Line)

    $statusPath = Join-Path $script:ResolvedWorkDir 'STATUS.md'
    Add-Content -LiteralPath $statusPath -Value $Line -Encoding utf8
}

function Get-TerminalState {
    $donePath = Join-Path $script:ResolvedWorkDir '.done'
    $blockedPath = Join-Path $script:ResolvedWorkDir '.blocked'
    $statusPath = Join-Path $script:ResolvedWorkDir 'STATUS.md'
    $statusText = Get-TextOrEmpty $statusPath

    $hasDone = (Test-Path -LiteralPath $donePath -PathType Leaf) -or ($statusText -match 'DONE:')
    $hasBlocked = (Test-Path -LiteralPath $blockedPath -PathType Leaf) -or ($statusText -match '(?m)^BLOCKED:')

    if ($hasDone -and $hasBlocked) {
        Write-Error 'Both done and blocked terminal signals are present.'
        return 'blocked'
    }
    if ($hasDone) {
        return 'done'
    }
    if ($hasBlocked) {
        return 'blocked'
    }
    return 'running'
}

function Invoke-AgentCommand {
    param(
        [string]$InputText,
        [string]$LogPath
    )

    $agentBlock = [scriptblock]::Create('$input | ' + $script:AgentCmd)
    Push-Location -LiteralPath $script:ResolvedWorkDir
    try {
        $global:LASTEXITCODE = 0
        $InputText | & $agentBlock *> $LogPath
        if ($LASTEXITCODE -ne $null) {
            return [int]$LASTEXITCODE
        }
        if ($?) {
            return 0
        }
        return 1
    } catch {
        $_ | Out-File -FilePath $LogPath -Append -Encoding utf8
        return 1
    } finally {
        Pop-Location
    }
}

if ($MaxIterations -lt 1) {
    Write-Error 'MaxIterations must be at least 1.'
    exit 64
}
if ($MaxConsecutiveFails -lt 1) {
    Write-Error 'MaxConsecutiveFails must be at least 1.'
    exit 64
}
if ($SleepOnFailMinutes -lt 0) {
    Write-Error 'SleepOnFailMinutes must be 0 or greater.'
    exit 64
}

$script:ResolvedGoal = Resolve-ExistingFile $Goal
$script:ResolvedWorkDir = Resolve-ExistingDirectory $WorkDir
$logsDir = Join-Path $script:ResolvedWorkDir 'logs'
if (-not (Test-Path -LiteralPath $logsDir -PathType Container)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$preflightLog = Join-Path $logsDir 'preflight.log'
$preflightExit = Invoke-AgentCommand -InputText "hi`n" -LogPath $preflightLog
if ($preflightExit -ne 0) {
    $message = "FAILED: pre-flight smoke failed with exit code $preflightExit"
    Add-StatusLine $message
    Write-Error "$message. See $preflightLog."
    exit 1
}

$goalText = Get-Content -LiteralPath $script:ResolvedGoal -Raw -Encoding utf8
$consecutiveFails = 0

for ($iteration = 1; $iteration -le $MaxIterations; $iteration++) {
    $state = Get-TerminalState
    if ($state -eq 'done') {
        exit 0
    }
    if ($state -eq 'blocked') {
        exit 2
    }

    $iterLog = Join-Path $logsDir ("iter-$iteration.log")
    $agentExit = Invoke-AgentCommand -InputText $goalText -LogPath $iterLog

    if ($agentExit -ne 0) {
        $consecutiveFails++
        if ($consecutiveFails -ge $MaxConsecutiveFails) {
            $message = "FAILED: agent exited $agentExit for $consecutiveFails consecutive iterations"
            Add-StatusLine $message
            Write-Error "$message. See $iterLog."
            exit 1
        }
        if ($SleepOnFailMinutes -gt 0) {
            Start-Sleep -Seconds ($SleepOnFailMinutes * 60)
        }
        continue
    }

    $consecutiveFails = 0
}

$finalState = Get-TerminalState
if ($finalState -eq 'done') {
    exit 0
}
if ($finalState -eq 'blocked') {
    exit 2
}

Add-StatusLine "HALTED: max iterations reached ($MaxIterations)"
exit 3
