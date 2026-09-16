# Repository instructions

- Keep COACH integration behind the MCP tool boundary; do not infer undocumented production schemas.
- Preserve the designer-authored conversational goal-setting sequence.
- Treat delivered experiences as additive-only baselines. Add new work through `src/experiences/` and do not remove an existing path to introduce another one.
- Keep `docs/feature-matrix.md` current and use its extension point for each feature.
- Use the official MCP TypeScript SDK patterns linked from the README.
- Run `npm run check`, `npm run test:smoke`, and `atk validate -i false` after relevant changes.