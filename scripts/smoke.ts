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
  const appTools = tools.tools.filter((tool) => tool._meta?.ui);
  if (appTools.length !== 1 || appTools[0].name !== "present_coach_results") {
    throw new Error("The expected Career Coach results MCP App tool is not registered.");
  }
  if (appTools[0]._meta?.ui?.resourceUri !== "ui://compass/coach-results.html") {
    throw new Error("The presentation tool references an unexpected MCP App resource.");
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

  const presentation = await client.callTool({
    name: "present_coach_results",
    arguments: {
      title: "Healthcare career comparison",
      summary: "Grounded sample data for the presentation contract.",
      items: [
        {
          title: "Respiratory therapist",
          subtitle: "Option one",
          description: "Supports patients with breathing and cardiopulmonary conditions.",
          details: ["Career Coach fact one"],
          url: "https://example.com/one"
        },
        {
          title: "Radiologic technologist",
          subtitle: "Option two",
          description: "Performs diagnostic imaging procedures.",
          details: ["Career Coach fact two"],
          url: "https://example.com/two"
        }
      ],
      sourceNote: "Presented from Career Coach results."
    }
  });
  if (!Array.isArray(presentation.structuredContent?.items) || presentation.structuredContent.items.length !== 2) {
    throw new Error("The Career Coach results presentation payload was not returned.");
  }

  const resource = await client.readResource({ uri: "ui://compass/coach-results.html" });
  const hasAppHtml = resource.contents.some((content) => "text" in content && content.text.includes("Compass Career Coach results"));
  if (!hasAppHtml) {
    throw new Error("The Career Coach results MCP App resource was not returned.");
  }

  console.log(`Smoke test passed: ${toolNames.length - 1} Career Coach tools and one presentation tool; host-orchestration contract verified.`);
} finally {
  await client.close();
}