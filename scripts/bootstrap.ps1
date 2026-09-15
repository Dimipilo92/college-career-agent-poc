<#
.SYNOPSIS
Prepares the College & Career Agent development environment.

.DESCRIPTION
Checks the required local tools, installs locked npm dependencies, creates the
untracked user environment file, and runs the environment diagnostics.

.PARAMETER SkipInstall
Skips npm dependency installation.

.EXAMPLE
.\scripts\bootstrap.ps1
#>
param(
    [Parameter(Mandatory = $false)]
    [switch] $SkipInstall
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$userEnvironmentPath = Join-Path $repositoryRoot "env/.env.dev.user"

function Assert-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [string] $InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name is required. $InstallHint"
    }
}

Push-Location $repositoryRoot
try {
    Assert-Command -Name "node" -InstallHint "Install Node.js 22 LTS: https://nodejs.org/"
    Assert-Command -Name "npm" -InstallHint "npm is included with Node.js."
    Assert-Command -Name "atk" -InstallHint "Install the Microsoft 365 Agents Toolkit CLI or its VS Code extension."

    $nodeMajor = [int]((node --version).TrimStart("v").Split(".")[0])
    if ($nodeMajor -ne 22) {
        throw "Node.js 22 is required; found $(node --version)."
    }

    if (-not $SkipInstall) {
        Write-Host "Installing locked npm dependencies..." -ForegroundColor Green
        npm ci
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci failed."
        }
    }

    if (-not (Test-Path $userEnvironmentPath)) {
        @(
            "# Local-only values. This file is ignored by git."
            "PLUGIN_SERVER_URL="
        ) | Set-Content -Path $userEnvironmentPath -Encoding utf8
        Write-Host "Created env/.env.dev.user." -ForegroundColor Green
    }

    & (Join-Path $PSScriptRoot "doctor.ps1")
}
finally {
    Pop-Location
}