import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getCareerCoachRecommendations } from "./careerCoach.js";
import { goalSchema } from "./src/domain/goal.js";
import { createFileGoalStore } from "./src/storage/goal-store.js";

const goalPlannerResourceUri = "ui://coach/goal-planner.html";
const coachingDashboardResourceUri = "ui://coach/coaching-dashboard.html";
const distDirectory = path.join(import.meta.dirname, "dist");

const goalStore = createFileGoalStore(
  process.env.GOAL_STORE_PATH ?? path.join(process.cwd(), ".data", "goal-plan.json")
);

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
      _meta: { ui: { resourceUri: goalPlannerResourceUri } }
    },
    async () => ({
      content: [{ type: "text", text: "The four-step goal planner is ready." }],
      structuredContent: { recommendationSource: "Career Coach MCP" }
    })
  );

  registerAppTool(
    server,
    "open_coaching_dashboard",
    {
      title: "Open coaching dashboard",
      description: "Open the current goal, recommended activities, and progress dashboard.",
      inputSchema: z.object({}),
      _meta: { ui: { resourceUri: coachingDashboardResourceUri } }
    },
    async () => {
      const plan = goalStore.get();
      return {
        content: [{
          type: "text",
          text: plan ? `Opened the coaching dashboard for: ${plan.goal.focus}` : "Set a goal before opening the coaching dashboard."
        }],
        structuredContent: plan ? { ...plan } : { activities: [], recommendationSource: "Career Coach MCP" }
      };
    }
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
          activities: plan?.activities ?? [],
          recommendationSource: plan?.recommendationSource ?? "Career Coach MCP"
        }
      };
    }
  );

  server.registerTool(
    "start_activity",
    {
      title: "Start a recommended activity",
      description: "Move a recommended activity into the active section of the coaching dashboard.",
      inputSchema: z.object({ activityId: z.string().min(1) })
    },
    async ({ activityId }) => {
      const plan = goalStore.get();
      const activity = plan?.activities.find((candidate) => candidate.id === activityId);
      if (!plan || !activity) {
        return { content: [{ type: "text", text: "That activity is no longer available." }], isError: true };
      }
      if (activity.status === "recommended") {
        activity.status = "active";
        activity.startedAt = new Date().toISOString();
        goalStore.save(plan);
      }
      return {
        content: [{ type: "text", text: `Started activity: ${activity.title}` }],
        structuredContent: { ...plan }
      };
    }
  );

  server.registerTool(
    "complete_activity",
    {
      title: "Complete an active activity",
      description: "Mark an active coaching activity complete and update dashboard progress.",
      inputSchema: z.object({ activityId: z.string().min(1) })
    },
    async ({ activityId }) => {
      const plan = goalStore.get();
      const activity = plan?.activities.find((candidate) => candidate.id === activityId);
      if (!plan || !activity) {
        return { content: [{ type: "text", text: "That activity is no longer available." }], isError: true };
      }
      if (activity.status !== "active") {
        return { content: [{ type: "text", text: "Start this activity before completing it." }], isError: true };
      }
      activity.status = "completed";
      activity.completedAt = new Date().toISOString();
      goalStore.save(plan);
      return {
        content: [{ type: "text", text: `Completed activity: ${activity.title}` }],
        structuredContent: { ...plan }
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
      const activities = recommendations.map((recommendation) => ({
        ...recommendation,
        status: "recommended" as const
      }));
      const plan = { goal, recommendations, activities, recommendationSource: "Career Coach MCP" };
      goalStore.save(plan);
      return {
        content: [{ type: "text", text: `Saved goal: ${goal.focus}` }],
        structuredContent: plan
      };
    }
  );

  registerAppResource(
    server,
    goalPlannerResourceUri,
    goalPlannerResourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [{
        uri: goalPlannerResourceUri,
        mimeType: RESOURCE_MIME_TYPE,
        text: await fs.readFile(path.join(distDirectory, "experimental-goal-planner.html"), "utf-8")
      }]
    })
  );

  registerAppResource(
    server,
    coachingDashboardResourceUri,
    coachingDashboardResourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [{
        uri: coachingDashboardResourceUri,
        mimeType: RESOURCE_MIME_TYPE,
        text: await fs.readFile(path.join(distDirectory, "coaching-dashboard.html"), "utf-8")
      }]
    })
  );

  return server;
}