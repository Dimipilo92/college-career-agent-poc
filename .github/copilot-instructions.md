# Repository instructions

- Keep COACH integration behind the MCP tool boundary; do not infer undocumented production schemas.
- Keep this project a thin experience layer over Career Coach; do not duplicate coaching logic locally.
- Keep reviewed Figma assets under `src/ui/` for task-specific MCP App surfaces.
- Do not register an MCP App resource unless the reviewed Figma flow specifically requires an embedded surface.
- Keep `docs/feature-matrix.md` current and use its extension point for each feature.
- Use the official MCP TypeScript SDK patterns linked from the README.
- Run `npm run check`, `npm run test:smoke`, and `atk validate -i false` after relevant changes.