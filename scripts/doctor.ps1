<#
.SYNOPSIS
Checks whether the local development environment is ready.

.DESCRIPTION
Validates tool versions, dependency restore, Microsoft 365 authentication,
local port state, and the user-specific public MCP endpoint.

.PARAMETER Port
The local HTTP port used by the MCP server.

.EXAMPLE
.\scripts\doctor.ps1
#>
param(
    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 65535)]
    [int] $Port = 3000
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$userEnvironmentPath = Join-Path $repositoryRoot "env/.env.dev.user"
$failures = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

function Test-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name
    )

    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Write-Check {
    param(
        [Parameter(Mandatory = $true)]
        [bool] $Passed,

        [Parameter(Mandatory = $true)]
        [string] $Message
    )

    $marker = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    Write-Host "[$marker] $Message" -ForegroundColor $color
}

Push-Location $repositoryRoot
try {
    $hasNode = Test-Command "node"
    Write-Check $hasNode "Node.js is installed."
    if (-not $hasNode) {
        $failures.Add("Install Node.js 22 LTS.")
    }
    else {
        $nodeVersion = (node --version).Trim()
        $nodeMajor = [int]($nodeVersion.TrimStart("v").Split(".")[0])
        $isNode22 = $nodeMajor -eq 22
        Write-Check $isNode22 "Node.js version is $nodeVersion; version 22 is required."
        if (-not $isNode22) {
            $failures.Add("Install and select Node.js 22.")
        }
    }

    foreach ($command in @("npm", "atk")) {
        $available = Test-Command $command
        Write-Check $available "$command is available on PATH."
        if (-not $available) {
            $failures.Add("Install $command and add it to PATH.")
        }
    }

    $hasDevTunnel = Test-Command "devtunnel"
    if ($hasDevTunnel) {
        Write-Check $true "devtunnel is available on PATH."
    }
    else {
        $warnings.Add("devtunnel is not available on PATH. Install Microsoft Dev Tunnels or use -SkipTunnel with start-dev.ps1.")
    }

    $dependenciesPresent = Test-Path (Join-Path $repositoryRoot "node_modules")
    Write-Check $dependenciesPresent "npm dependencies are restored."
    if (-not $dependenciesPresent) {
        $failures.Add("Run npm ci or scripts/bootstrap.ps1.")
    }

    $accountConnected = $false
    if (Test-Command "atk") {
        $authOutput = atk auth list m365 2>&1 | Out-String
        $accountConnected = $LASTEXITCODE -eq 0 -and $authOutput -notmatch "(?i)(not logged|no account|empty)"
    }
    Write-Check $accountConnected "Microsoft 365 Agents Toolkit has a connected account."
    if (-not $accountConnected) {
        $warnings.Add("Run atk auth login m365 before provisioning.")
    }

    $pluginServerUrl = $null
    if (Test-Path $userEnvironmentPath) {
        $pluginServerUrl = Get-Content $userEnvironmentPath |
            Where-Object { $_ -match '^PLUGIN_SERVER_URL=' } |
            Select-Object -First 1
        $pluginServerUrl = $pluginServerUrl -replace '^PLUGIN_SERVER_URL=', ''
    }
    $validPluginUrl = $pluginServerUrl -match '^https://.+/mcp/?$'
    Write-Check $validPluginUrl "PLUGIN_SERVER_URL is an HTTPS URL ending in /mcp."
    if (-not $validPluginUrl) {
        $warnings.Add("Set PLUGIN_SERVER_URL in env/.env.dev.user after starting a public tunnel.")
    }

    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        Write-Host "[INFO] Port $Port is already listening; reuse it or stop that process before starting another server." -ForegroundColor Yellow
    }
    else {
        Write-Host "[INFO] Port $Port is available." -ForegroundColor Cyan
    }

    foreach ($warning in $warnings) {
        Write-Host "[WARN] $warning" -ForegroundColor Yellow
    }

    if ($failures.Count -gt 0) {
        foreach ($failure in $failures) {
            Write-Host "[ACTION] $failure" -ForegroundColor Red
        }
        exit 1
    }

    Write-Host "Development environment checks passed." -ForegroundColor Green
}
finally {
    Pop-Location
}