import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({ name: "college-career-smoke-test", version: "0.1.0" });
const endpoint = process.env.MCP_SERVER_URL ?? "http://localhost:3000/mcp";

try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));

  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name);
  const requiredTools = [
    "GetCareerCoachingGuidance",
    "GetCareerCoachingTopics",
    "CareerAssessment",
    "ONetOccupationProfile",
    "InterviewPrep"
  ];
  const missingTools = requiredTools.filter((toolName) => !toolNames.includes(toolName));
  if (missingTools.length > 0) {
    throw new Error(`Missing required Career Coach tools: ${missingTools.join(", ")}`);
  }
  if (tools.tools.some((tool) => tool._meta?.ui)) {
    throw new Error("A conversational tool unexpectedly references an MCP App resource.");
  }

  const topics = await client.callTool({ name: "GetCareerCoachingTopics", arguments: {} });
  if (!Array.isArray(topics.structuredContent?.topics)) {
    throw new Error("Career Coach did not return its published topics.");
  }
  const topicIds = topics.structuredContent.topics.map((topic) => topic.id);
  if (!topicIds.includes("networking_basics")) {
    throw new Error("The Figma demo topic is not published by Career Coach.");
  }
  const guidance = await client.callTool({
    name: "GetCareerCoachingGuidance",
    arguments: { topic_id: "networking_basics" }
  });
  if (guidance.structuredContent?.id !== "networking_basics" || typeof guidance.structuredContent.guidance !== "string") {
    throw new Error("Career Coach guidance was not proxied unchanged.");
  }
  console.log(`Smoke test passed: ${toolNames.length} Career Coach tools; proxy workflow verified.`);
} finally {
  await client.close();
}