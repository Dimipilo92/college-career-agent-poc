# Experience modules

Each user-visible MCP App experience owns one directory under this folder. Delivered behavior stays in place while new experiences are developed alongside it.

## Add an experience

1. Choose a row from `docs/feature-matrix.md`.
2. Create the row's `src/experiences/<experience-name>/` directory.
3. Export an `ExperienceDefinition` from `index.ts`.
4. Add the definition to `catalog.ts`.
5. Add a representative render state to `widget-gallery.ts`.
6. Add a dedicated MCP tool and `ui://coach/...` resource when the UI is approved.
7. Extend `scripts/smoke.ts` to cover the new tool and resource.
8. Advance the matrix status in the same change.

Keep reusable view primitives in `src/`, business contracts in `src/domain/`, and persistence behind `src/storage/`. Do not remove or repurpose an existing experience to introduce another one.