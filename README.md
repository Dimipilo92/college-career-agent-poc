# College & Career Agent prototype

A declarative Microsoft 365 Copilot agent that follows the Figma's conversational goal-setting flow. Plain MCP tools preserve the prototype contract while sourcing coaching topics and guidance from Career Coach MCP.

## Included scenario

- Guided four-step goal intake in an MCP App
- Numbered multi-select choices, free text, Back, Skip, and Submit controls
- Career Coach recommended activities presented after submission
- Coaching dashboard with recommended, active, and completed activities
- Durable local goal state with Start and Complete activity actions
- Optional conversational fallback launched from **Set a goal (text)**
- Dynamic MCP tool discovery from the declarative agent

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

To build and review MCP App UI without a host handshake, run `npm run dev:widgets` and open `http://127.0.0.1:5173/widget-gallery.html`. New Figma experience chunks should reuse the primitives in `src/elicitation-widget.ts` and add a representative state to the gallery.

Use the [feature delivery matrix](docs/feature-matrix.md) to choose the next slice. Delivered paths remain in place; scaffolded work has a typed module under `src/experiences/`, and planned work identifies its future module before implementation begins.

Run the iteration guardrail before submitting a change:

```powershell
npm run check
```

This compiles the server and widgets, checks unique experience IDs, verifies that every delivered or scaffolded catalog path exists, and ensures delivered MCP Apps declare their tool and resource registrations.

See [Development environment](docs/development-environment.md) for the complete workstation setup, authentication, public tunnel, provisioning, validation, environment variables, and troubleshooting workflow.

## Test in Microsoft 365 Copilot

Microsoft 365 Copilot cannot call localhost directly. Create a persistent anonymous dev tunnel for port 3000, set `PLUGIN_SERVER_URL` in `env/.env.dev.user` to the tunnel's HTTPS `/mcp` URL, and provision the agent with Agents Toolkit.

The tester must be signed into Microsoft 365, have Copilot access, and belong to a tenant where custom app upload is enabled. Anonymous MCP authentication is for development only; a deployed version requires OAuth 2.1 or Microsoft Entra SSO.

## Prototype boundaries

- `save_goal` keeps the Career Coach MCP schema behind the prototype's recommendation contract.
- `get_goal` lets the conversational agent review the durable local goal, recommendations, and activity progress.
- `open_goal_planner` serves the primary four-step MCP App experience.
- `open_coaching_dashboard` serves the main progress and next-action MCP App experience.
- Recommendations come from the public, read-only Career Coach MCP; local JSON persistence is single-user development state only.
- Production identity, authorization, tenant-scoped storage, notifications, and COACH schemas remain intentionally undefined.

## References

- [Build a declarative agent plugin from MCP](https://learn.microsoft.com/microsoft-365/copilot/extensibility/build-mcp-plugins)
- [Debug MCP plugins with dev tunnels](https://learn.microsoft.com/microsoft-365/copilot/extensibility/plugin-debug-local)
- [Career Coach MCP](https://mcp.aicareercoach.org/docs)