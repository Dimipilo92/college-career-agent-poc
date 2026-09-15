# Development environment

This project runs a Microsoft 365 declarative agent against a local MCP gateway. The gateway serves the MCP App, stores prototype goal state in memory, and calls the public Career Coach MCP for recommendations.

## Architecture

```text
Microsoft 365 Copilot
  -> public HTTPS dev tunnel
  -> local Streamable HTTP MCP endpoint (/mcp)
  -> goal planner MCP App and save_goal tool
  -> Career Coach MCP (https://mcp.aicareercoach.org/mcp/)
```

The local endpoint is `http://localhost:3000/mcp`. Microsoft 365 cannot call localhost, so remote testing requires a public HTTPS tunnel.

## Supported workstation

- Windows 11
- PowerShell 7 (`pwsh`)
- Node.js 22 LTS and npm
- Visual Studio Code
- Microsoft 365 Agents Toolkit extension and `atk` CLI
- Microsoft Dev Tunnels CLI (`devtunnel`) for Microsoft 365 testing
- A Microsoft 365 account with Copilot access
- A tenant that permits custom app upload
- Network access to `https://mcp.aicareercoach.org/mcp/`

The app itself has no Azure resources, database, or local secrets. Career Coach MCP is anonymous and read-only. Microsoft 365 authentication is needed only to provision and test the declarative agent.

## Repository setup

Clone the repository and run the bootstrap script from PowerShell:

```powershell
git clone https://github.com/Dimipilo92/college-career-agent-poc.git
Set-Location college-career-agent-poc
.\scripts\bootstrap.ps1
```

Bootstrap performs these actions:

1. Requires Node.js 22, npm, and Agents Toolkit.
2. Restores exactly the dependencies in `package-lock.json` with `npm ci`.
3. Creates `env/.env.dev.user` when missing.
4. Runs `scripts/doctor.ps1`.

It does not install global tools or perform sign-in because those operations can require administrator policy, browser authentication, or tenant consent.

## Tool installation

Install Node.js 22 LTS from [nodejs.org](https://nodejs.org/) or your managed software catalog. Install the Microsoft 365 Agents Toolkit extension from the VS Code Extensions view; ensure its `atk` command is available in a new terminal.

Install Microsoft Dev Tunnels using the official instructions, then open a new terminal and verify all tools:

```powershell
node --version
npm --version
atk --version
devtunnel --version
```

Node must report major version 22. Run the project diagnostics at any time:

```powershell
npm run doctor
```

## Authentication

Connect Agents Toolkit to the Microsoft 365 tenant used for testing:

```powershell
atk auth login m365
atk auth list m365
```

Dev Tunnels may also require an interactive login:

```powershell
devtunnel user login
```

Authentication caches are managed by their respective CLIs and must not be committed.

## Local-only development

Start the MCP server without a public tunnel:

```powershell
npm run dev:local
```

In another terminal, verify the full local tool contract and live Career Coach MCP integration:

```powershell
npm run test:smoke
```

VS Code MCP clients can connect using `.vscode/mcp.json`.

## Microsoft 365 testing

Start the server and an ephemeral anonymous tunnel:

```powershell
.\scripts\start-dev.ps1
```

For a stable URL, create a persistent tunnel once and then pass its ID:

```powershell
.\scripts\start-dev.ps1 -TunnelId "your-tunnel-id"
```

Copy the tunnel's public HTTPS URL, append `/mcp`, and place it in the untracked file `env/.env.dev.user`:

```dotenv
PLUGIN_SERVER_URL=https://your-tunnel-host.example/mcp
```

The trailing `/mcp` path is required. Verify the environment before provisioning:

```powershell
npm run doctor
$env:PLUGIN_SERVER_URL = "https://your-tunnel-host.example/mcp"
atk validate -i false
atk provision --env dev
```

The explicit process environment value prevents a stale shell value from silently overriding the user environment file. After provisioning, start a new Microsoft 365 Copilot chat so updated agent metadata is loaded.

## Build and test commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Restore locked dependencies |
| `npm run bootstrap` | Prepare dependencies, user environment, and diagnostics |
| `npm run doctor` | Check tools, auth, configuration, dependencies, and port 3000 |
| `npm run dev:local` | Run the local MCP server and app build watcher |
| `.\scripts\start-dev.ps1` | Run the server plus a public tunnel |
| `npm run build` | Type-check server and app, then create the single-file MCP App |
| `npm run test:smoke` | Exercise tools, app resource, goal state, and live Career Coach MCP |
| `atk validate -i false` | Validate the Microsoft 365 app package |
| `atk provision --env dev` | Package, upload, and publish the development agent |

## Environment variables

| Variable | Location | Purpose |
| --- | --- | --- |
| `PORT` | Process environment | Local MCP port; defaults to `3000` |
| `PLUGIN_SERVER_URL` | `env/.env.dev.user` or process environment | Public HTTPS MCP URL ending in `/mcp` |
| `CAREER_COACH_MCP_URL` | Process environment | Optional Career Coach override; defaults to the public endpoint |
| `TEAMS_APP_ID` | `env/.env.dev` | Generated by provisioning |
| `TEAMS_APP_TENANT_ID` | `env/.env.dev` | Generated tenant identifier |
| `M365_TITLE_ID` | `env/.env.dev` | Generated Microsoft 365 title identifier |
| `M365_APP_ID` | `env/.env.dev` | Generated Microsoft 365 app identifier |

`env/.env.dev.user`, `appPackage/build`, `appPackage/.generated`, `dist`, and `node_modules` are ignored by Git. Do not commit tokens, credentials, generated app packages, tunnel credentials, or tenant-specific user files.

## Runtime behavior

- `open_goal_planner` serves the four-step MCP App resource.
- `save_goal` calls Career Coach MCP only after submission.
- `get_goal` returns process-local goal and recommendation state.
- Restarting the server clears saved goals.
- The smoke test intentionally calls the live Career Coach MCP; it requires internet access and fails when that service is unavailable.

## Troubleshooting

**`devtunnel` is not recognized**

Install Dev Tunnels, restart the terminal, and confirm `devtunnel --version`. For local-only work, use `npm run dev:local`.

**Port 3000 is already in use**

Run `Get-NetTCPConnection -LocalPort 3000 -State Listen` to identify the listener. Reuse the running server, stop it, or pass another port to `start-dev.ps1` and set `PORT` consistently.

**Microsoft 365 says the tool is unavailable**

Confirm the tunnel is running, `PLUGIN_SERVER_URL` ends in `/mcp`, the public smoke test succeeds, and the generated package contains that complete URL. Reprovision after changing the URL or manifest version, then start a new Copilot chat.

**Agent starters or instructions look stale**

Increment `appPackage/manifest.json` version, provision again, and open a new chat. Microsoft 365 may cache prior package metadata.

**Career Coach recommendations fail**

Check access to `https://mcp.aicareercoach.org/mcp/`. The trailing slash is required for the upstream endpoint. There is intentionally no local recommendation fallback.