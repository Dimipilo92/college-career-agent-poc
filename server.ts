import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getCareerCoachRecommendations } from "./careerCoach.js";
import { goalSchema } from "./src/domain/goal.js";
import { createInMemoryGoalStore } from "./src/storage/goal-store.js";

const resourceUri = "ui://coach/goal-planner.html";
const distDirectory = path.join(import.meta.dirname, "dist");

const goalStore = createInMemoryGoalStore();

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
    async () => {
      const plan = goalStore.get();
      return {
        content: [{ type: "text", text: plan ? `Current goal: ${plan.goal.focus}` : "No goal has been saved yet." }],
        structuredContent: {
          goal: plan?.goal,
          recommendations: plan?.recommendations ?? [],
          recommendationSource: plan?.recommendationSource ?? "Career Coach MCP"
        }
      };
    }
  );

  server.registerTool(
    "save_goal",
    {
      title: "Save a college or career goal",
      description: "Save the answers collected during a conversational goal-setting flow and return recommended activities from Career Coach MCP.",
      inputSchema: goalSchema
    },
    async (goal) => {
      const recommendations = await getCareerCoachRecommendations(goal);
      const plan = { goal, recommendations, recommendationSource: "Career Coach MCP" };
      goalStore.save(plan);
      return {
        content: [{ type: "text", text: `Saved goal: ${goal.focus}` }],
        structuredContent: plan
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