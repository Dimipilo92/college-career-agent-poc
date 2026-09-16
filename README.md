# Compass Now

A thin Microsoft 365 Copilot experience over Career Coach MCP, with Figma-derived MCP App components reserved for complex interactive tasks.

## Included scenario

- Conversational coaching driven by published Career Coach guidance
- Transparent proxies for the complete live Career Coach tool catalog
- One Figma-aligned **Set a goal** entry point
- An experimental folder for future Figma-backed MCP App experiences

## Run locally

Requirements: Windows, PowerShell 7, Node.js 22, and Microsoft 365 Agents Toolkit (`atk`).

```powershell
.\scripts\bootstrap.ps1
npm run dev:local
```

In another terminal:

```powershell
npm run test:smoke
```

The MCP endpoint is `http://localhost:3000/mcp`. VS Code can connect through `.vscode/mcp.json`.

Run the iteration guardrail before submitting a change:

```powershell
npm run check
```

This type-checks the MCP server and Career Coach proxy.

## Repository structure

```text
appPackage/                 Microsoft 365 agent metadata and instructions
src/integrations/           Career Coach MCP adapter
src/ui/elicitation/         Retained Figma UI kit; not registered at runtime
src/ui/experiences/         Experimental home for future MCP Apps
server.ts                   Dynamic Career Coach MCP proxy
main.ts                     HTTP and stdio transports
```

See [Development environment](docs/development-environment.md) for the complete workstation setup, authentication, public tunnel, provisioning, validation, environment variables, and troubleshooting workflow.

## Test in Microsoft 365 Copilot

Microsoft 365 Copilot cannot call localhost directly. Create a persistent anonymous dev tunnel for port 3000, set `PLUGIN_SERVER_URL` in `env/.env.dev.user` to the tunnel's HTTPS `/mcp` URL, and provision the agent with Agents Toolkit.

The tester must be signed into Microsoft 365, have Copilot access, and belong to a tenant where custom app upload is enabled. Anonymous MCP authentication is for development only; a deployed version requires OAuth 2.1 or Microsoft Entra SSO.

## Prototype boundaries

- The complete live Career Coach tool catalog is discovered and proxied without local routing logic.
- Career Coach guidance drives conversational questions, pacing, and recommendations.
- Future Figma-derived experiences have an explicit experimental home under `src/ui/experiences/`.
- No MCP App resource, local goal store, or fixed intake workflow is currently registered.
- Production identity, authorization, and notifications remain intentionally undefined.

## References

- [Build a declarative agent plugin from MCP](https://learn.microsoft.com/microsoft-365/copilot/extensibility/build-mcp-plugins)
- [Debug MCP plugins with dev tunnels](https://learn.microsoft.com/microsoft-365/copilot/extensibility/plugin-debug-local)
- [Career Coach MCP](https://mcp.aicareercoach.org/docs)