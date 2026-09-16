# Feature delivery matrix

This matrix tracks the thin Career Coach wrapper and Figma-derived interaction surfaces.

## Status definitions

| Status | Meaning |
| --- | --- |
| Delivered | Implemented, documented, and covered by the build or smoke test. |
| Scaffolded | Extension point and contract exist; product behavior remains to be added. |
| Planned | Product intent is known, but its contract or dependency still needs definition. |

## Delivery matrix

| Experience | Status | Existing baseline | Additive extension point | Acceptance check |
| --- | --- | --- | --- | --- |
| Career Coach catalog | Delivered | The live upstream catalog is discovered and proxied without local coaching logic | `src/integrations/career-coach.ts` | Smoke test finds representative guidance, assessment, occupation, and interview tools. |
| Career Coach guidance | Delivered | Guidance passes through without local coaching logic | `GetCareerCoachingGuidance` | Smoke test verifies the upstream topic ID and guidance. |
| Conversational shell | Delivered | Copilot selects specialized COACH tools or published topic guidance | `appPackage/instruction.txt` | Agent asks only what is needed to route or follow COACH guidance. |
| Complex task UI | Planned | Figma references and elicitation primitives are inactive | `src/ui/experiences/` | Add a reviewed, tested MCP App only when the interaction requires one. |
| Remote MCP hosting | Scaffolded | Streamable HTTP endpoint and environment-driven port already work | `infra/` and deployment pipeline | Authenticated HTTPS endpoint passes the existing smoke test outside localhost. |
| Authentication and authorization | Planned | Development endpoint is intentionally anonymous | HTTP middleware in `main.ts` and tenant app registration | Requests require an accepted tenant/user token and reject invalid audiences. |

## Extension rules

1. Keep coaching logic in Career Coach; local tools should proxy or present it.
2. Do not add a fixed intake flow unless the product requirements explicitly call for one.
3. Register an MCP App resource only for a reviewed complex interaction.
4. Preserve reviewed Figma UI assets under `src/ui/` even when they are not active runtime surfaces.
5. Extend `scripts/smoke.ts` for every new tool or contract change.
6. Update this matrix in the same change that advances a feature status.