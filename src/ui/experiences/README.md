# Experimental UI experiences

No custom UI experience is active. The agent currently uses native Copilot conversation and the live Career Coach tool catalog.

For a future Figma-approved MCP App, create `src/ui/experiences/<experience-id>/` and keep its implementation, assets, and tests together. Register it in `server.ts` only when it is ready to ship. Shared elicitation primitives are available in `src/ui/elicitation/`.

Current design candidates are **Set a goal**, **Explore careers**, and **Compare careers**. The exported Figma boards are design references, not implemented product behavior.