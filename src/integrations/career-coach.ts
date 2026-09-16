import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";

const endpoint = process.env.CAREER_COACH_MCP_URL ?? "https://mcp.aicareercoach.org/mcp/";
let toolCatalogPromise: Promise<Tool[]> | undefined;

async function withCareerCoach<T>(action: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ name: "college-career-agent-poc", version: "0.1.0" });

  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
    return await action(client);
  } finally {
    await client.close();
  }
}

export function listCareerCoachTools(): Promise<Tool[]> {
  toolCatalogPromise ??= withCareerCoach(async (client) => (await client.listTools()).tools)
    .catch((error: unknown) => {
      toolCatalogPromise = undefined;
      throw error;
    });
  return toolCatalogPromise;
}

export async function callCareerCoachTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
  return withCareerCoach(async (client) => await client.callTool({ name, arguments: args }) as CallToolResult);
}