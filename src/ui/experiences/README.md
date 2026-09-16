# UI experiences

The `coach-results` MCP App is active for comparisons and result sets. Copilot first calls Career Coach, then maps 2-6 grounded options into `present_coach_results`. The app is read-only and does not call Career Coach itself.

For a future Figma-approved MCP App, create `src/ui/experiences/<experience-id>/` and keep its implementation, assets, and tests together. Register it in `server.ts` only when it is ready to ship. Shared elicitation primitives are available in `src/ui/elicitation/`.

Additional design candidates are **Set a goal** and **Explore careers**. The exported Figma boards are design references, not implemented product behavior.