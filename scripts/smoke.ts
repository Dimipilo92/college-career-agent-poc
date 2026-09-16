import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({ name: "college-career-smoke-test", version: "0.1.0" });
const endpoint = process.env.MCP_SERVER_URL ?? "http://localhost:3000/mcp";

try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));

  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name);
  const expectedTools = [
    "get_goal",
    "save_goal",
    "open_goal_planner",
    "open_coaching_dashboard",
    "start_activity",
    "complete_activity"
  ];
  if (expectedTools.some((toolName) => !toolNames.includes(toolName))) {
    throw new Error(`Unexpected tools: ${toolNames.join(", ")}`);
  }
  const textTools = tools.tools.filter((tool) => ["get_goal", "save_goal", "start_activity", "complete_activity"].includes(tool.name));
  if (textTools.some((tool) => tool._meta?.ui)) {
    throw new Error("A conversational tool unexpectedly references an MCP App resource.");
  }
  const appTool = tools.tools.find((tool) => tool.name === "open_goal_planner");
  if (appTool?._meta?.ui?.resourceUri !== "ui://coach/goal-planner.html") {
    throw new Error("The goal planner is missing its MCP App resource link.");
  }
  const dashboardTool = tools.tools.find((tool) => tool.name === "open_coaching_dashboard");
  if (dashboardTool?._meta?.ui?.resourceUri !== "ui://coach/coaching-dashboard.html") {
    throw new Error("The coaching dashboard is missing its MCP App resource link.");
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
  const activityId = result.structuredContent.activities?.[0]?.id;
  if (typeof activityId !== "string") {
    throw new Error("Saving a goal did not initialize dashboard activities.");
  }

  const started = await client.callTool({ name: "start_activity", arguments: { activityId } });
  if (started.structuredContent?.activities?.[0]?.status !== "active") {
    throw new Error("The recommended activity did not become active.");
  }

  const completed = await client.callTool({ name: "complete_activity", arguments: { activityId } });
  if (completed.structuredContent?.activities?.[0]?.status !== "completed") {
    throw new Error("The active activity did not become completed.");
  }

  const saved = await client.callTool({ name: "get_goal", arguments: {} });
  if (saved.structuredContent?.goal?.focus !== "Build a strong resume and portfolio for art school") {
    throw new Error("The saved goal was not available to the conversational agent.");
  }
  if (saved.structuredContent?.activities?.[0]?.status !== "completed") {
    throw new Error("Activity progress was not available after retrieval.");
  }

  const resource = await client.readResource({ uri: "ui://coach/goal-planner.html" });
  const html = resource.contents[0]?.text;
  if (
    typeof html !== "string" ||
    !html.includes("How would you like the agent to help you?") ||
    !html.includes("How often do you want to set milestones for this plan?") ||
    !html.includes("elicitation-panel") ||
    !html.includes("aria-pressed")
  ) {
    throw new Error("The four-step goal planner resource was not returned.");
  }

  const dashboardResource = await client.readResource({ uri: "ui://coach/coaching-dashboard.html" });
  const dashboardHtml = dashboardResource.contents[0]?.text;
  if (
    typeof dashboardHtml !== "string" ||
    !dashboardHtml.includes("Your coaching plan") ||
    !dashboardHtml.includes("data-start-activity") ||
    !dashboardHtml.includes("data-complete-activity")
  ) {
    throw new Error("The coaching dashboard resource was not returned.");
  }

  console.log(`Smoke test passed: ${toolNames.join(", ")}; goal-to-dashboard activity workflow.`);
} finally {
  await client.close();
}