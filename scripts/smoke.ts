import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({ name: "college-career-smoke-test", version: "0.1.0" });
const endpoint = process.env.MCP_SERVER_URL ?? "http://localhost:3000/mcp";

try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));

  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name);
  if (!toolNames.includes("get_goal") || !toolNames.includes("save_goal") || !toolNames.includes("open_goal_planner")) {
    throw new Error(`Unexpected tools: ${toolNames.join(", ")}`);
  }
  const textTools = tools.tools.filter((tool) => tool.name === "get_goal" || tool.name === "save_goal");
  if (textTools.some((tool) => tool._meta?.ui)) {
    throw new Error("A conversational tool unexpectedly references an MCP App resource.");
  }
  const appTool = tools.tools.find((tool) => tool.name === "open_goal_planner");
  if (appTool?._meta?.ui?.resourceUri !== "ui://coach/goal-planner.html") {
    throw new Error("The goal planner is missing its MCP App resource link.");
  }

  const result = await client.callTool({
    name: "save_goal",
    arguments: {
      pathways: ["Explore career paths"],
      support: ["Practice"],
      focus: "Build a strong resume and portfolio for art school",
      cadence: "Weekly"
    }
  });
  if (!result.structuredContent || !Array.isArray(result.structuredContent.recommendations)) {
    throw new Error("Saving a goal did not return recommendations.");
  }
  if (result.structuredContent.recommendationSource !== "Career Coach MCP") {
    throw new Error("Recommendations did not come from Career Coach MCP.");
  }
  if (result.structuredContent.recommendations.some((recommendation) => typeof recommendation.description !== "string")) {
    throw new Error("Career Coach recommendations were malformed.");
  }

  const saved = await client.callTool({ name: "get_goal", arguments: {} });
  if (saved.structuredContent?.goal?.focus !== "Build a strong resume and portfolio for art school") {
    throw new Error("The saved goal was not available to the conversational agent.");
  }

  const resource = await client.readResource({ uri: "ui://coach/goal-planner.html" });
  const html = resource.contents[0]?.text;
  if (typeof html !== "string" || !html.includes("How would you like the agent to help you?") || !html.includes("How often do you want to set milestones for this plan?")) {
    throw new Error("The four-step goal planner resource was not returned.");
  }

  console.log(`Smoke test passed: ${toolNames.join(", ")}; four-step app with conversational fallback.`);
} finally {
  await client.close();
}