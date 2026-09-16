import type { ExperienceDefinition } from "../catalog";

export const goalPlannerExperience: ExperienceDefinition = {
  id: "goal-planner",
  title: "Goal planner",
  status: "delivered",
  scaffoldPath: "src/experiences/goal-planner/",
  description: "Four-step visual intake with a conversational fallback.",
  toolName: "open_goal_planner",
  resourceUri: "ui://coach/goal-planner.html"
};