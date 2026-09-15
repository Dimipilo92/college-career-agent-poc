import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getCareerCoachRecommendations, type Recommendation } from "./careerCoach.js";

const resourceUri = "ui://coach/goal-planner.html";
const distDirectory = path.join(import.meta.dirname, "dist");

const goalSchema = z.object({
  pathways: z.array(z.string()).min(1),
  support: z.array(z.string()).min(1),
  focus: z.string().min(1),
  cadence: z.string().min(1),
  resumeUrl: z.string().optional()
});

type Goal = z.infer<typeof goalSchema>;

let savedGoal: Goal | undefined;
let savedRecommendations: Recommendation[] = [];

export function createServer(): McpServer {
  const server = new McpServer({
    name: "College and Career COACH Prototype",
    version: "0.1.0"
  });

  registerAppTool(
    server,
    "open_goal_planner",
    {
      title: "Open goal planner",
      description: "Open the primary four-step visual goal planner for setting a new college or career goal.",
      inputSchema: z.object({}),
      _meta: { ui: { resourceUri } }
    },
    async () => ({
      content: [{ type: "text", text: "The four-step goal planner is ready." }],
      structuredContent: { recommendationSource: "Career Coach MCP" }
    })
  );

  server.registerTool(
    "get_goal",
    {
      title: "Get the current college or career goal",
      description: "Return the current goal and its recommended activities, if a goal has been saved.",
      inputSchema: z.object({})
    },
    async () => ({
      content: [{ type: "text", text: savedGoal ? `Current goal: ${savedGoal.focus}` : "No goal has been saved yet." }],
      structuredContent: { goal: savedGoal, recommendations: savedRecommendations, recommendationSource: "Career Coach MCP" }
    })
  );

  server.registerTool(
    "save_goal",
    {
      title: "Save a college or career goal",
      description: "Save the answers collected during a conversational goal-setting flow and return recommended activities from Career Coach MCP.",
      inputSchema: goalSchema
    },
    async (goal) => {
      savedGoal = goal;
      savedRecommendations = await getCareerCoachRecommendations(goal);
      return {
        content: [{ type: "text", text: `Saved goal: ${goal.focus}` }],
        structuredContent: { goal, recommendations: savedRecommendations, recommendationSource: "Career Coach MCP" }
      };
    }
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [{
        uri: resourceUri,
        mimeType: RESOURCE_MIME_TYPE,
        text: await fs.readFile(path.join(distDirectory, "experimental-goal-planner.html"), "utf-8")
      }]
    })
  );

  return server;
}