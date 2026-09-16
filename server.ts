import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { callCareerCoachTool, listCareerCoachTools } from "./src/integrations/career-coach.js";

const coachResultsResourceUri = "ui://compass/coach-results.html";
const coachResultItemSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string(),
  description: z.string().min(1),
  details: z.array(z.string().min(1)).max(6),
  url: z.string()
});

export async function createServer(): Promise<McpServer> {
  const server = new McpServer({
    name: "Compass",
    version: "0.1.0"
  });

  for (const tool of await listCareerCoachTools()) {
    server.registerTool(tool.name, {
      title: tool.title,
      description: tool.description,
      inputSchema: z.fromJSONSchema(tool.inputSchema as Parameters<typeof z.fromJSONSchema>[0]),
      annotations: tool.annotations,
      _meta: tool._meta
    }, async (args) => callCareerCoachTool(tool.name, args as Record<string, unknown>));
  }

  registerAppTool(
    server,
    "present_coach_results",
    {
      title: "Present Career Coach results",
      description: "After using Career Coach, present 2-6 grounded careers, programs, or opportunities in an interactive comparison. Copy only facts and links returned by Career Coach. Do not use this tool without a Career Coach result.",
      inputSchema: z.object({
        title: z.string().min(1),
        summary: z.string(),
        items: z.array(coachResultItemSchema).min(2).max(6),
        sourceNote: z.string()
      }),
      _meta: { ui: { resourceUri: coachResultsResourceUri } }
    },
    async (presentation) => ({
      content: [{ type: "text", text: `Presented ${presentation.items.length} grounded options from Career Coach.` }],
      structuredContent: presentation
    })
  );

  registerAppResource(
    server,
    coachResultsResourceUri,
    coachResultsResourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [{
        uri: coachResultsResourceUri,
        mimeType: RESOURCE_MIME_TYPE,
        text: await fs.readFile(path.join(import.meta.dirname, "dist", "coach-results.html"), "utf-8")
      }]
    })
  );

  return server;
}