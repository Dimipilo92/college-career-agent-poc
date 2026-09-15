<#
.SYNOPSIS
Starts the local MCP server and, optionally, a public development tunnel.

.DESCRIPTION
Runs the existing npm development process and keeps it paired with a Dev
Tunnels host process. Press Ctrl+C to stop both processes.

.PARAMETER Port
The local port exposed by the MCP server.

.PARAMETER TunnelId
An optional persistent Dev Tunnels tunnel ID to host.

.PARAMETER SkipTunnel
Starts only the local MCP server.

.EXAMPLE
.\scripts\start-dev.ps1 -TunnelId "my-tunnel-id"

.EXAMPLE
.\scripts\start-dev.ps1 -SkipTunnel
#>
param(
    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 65535)]
    [int] $Port = 3000,

    [Parameter(Mandatory = $false)]
    [string] $TunnelId,

    [Parameter(Mandatory = $false)]
    [switch] $SkipTunnel
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm is required. Run scripts/bootstrap.ps1 first."
}
if (-not $SkipTunnel -and -not (Get-Command devtunnel -ErrorAction SilentlyContinue)) {
    throw "devtunnel is required unless -SkipTunnel is specified. See docs/development-environment.md."
}
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    throw "Port $Port is already in use. Stop the existing listener or choose another port."
}

$tunnelProcess = $null

Push-Location $repositoryRoot
try {
    $env:PORT = $Port

    if (-not $SkipTunnel) {
        Write-Host "Starting public tunnel. Copy its HTTPS URL and append /mcp in env/.env.dev.user." -ForegroundColor Green
        $tunnelArguments = @("host", "-p", $Port, "--allow-anonymous")
        if ($TunnelId) {
            $tunnelArguments = @("host", $TunnelId, "-p", $Port, "--allow-anonymous")
        }
        $tunnelProcess = Start-Process -FilePath (Get-Command devtunnel).Source -ArgumentList $tunnelArguments -NoNewWindow -PassThru
    }

    Write-Host "Starting MCP server at http://localhost:$Port/mcp. Press Ctrl+C to stop." -ForegroundColor Green
    npm run start
    if ($LASTEXITCODE -ne 0) {
        throw "npm run start failed."
    }
}
finally {
    if ($tunnelProcess -and -not $tunnelProcess.HasExited) {
        Stop-Process -Id $tunnelProcess.Id -Force
    }
    Pop-Location
}