import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callCareerCoachTool, listCareerCoachTools } from "./src/integrations/career-coach.js";

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

  return server;
}