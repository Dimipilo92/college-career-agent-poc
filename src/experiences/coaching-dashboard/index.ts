import type { CoachingActivity } from "../../domain/activities";
import type { Goal } from "../../domain/goal";
import type { ExperienceDefinition } from "../catalog";

export const coachingDashboardExperience: ExperienceDefinition = {
  id: "coaching-dashboard",
  title: "Coaching dashboard",
  status: "delivered",
  scaffoldPath: "src/experiences/coaching-dashboard/",
  description: "Show the goal and recommended, active, and completed activities.",
  toolName: "open_coaching_dashboard",
  resourceUri: "ui://coach/coaching-dashboard.html"
};

export interface CoachingDashboardModel {
  goal: Goal;
  activities: CoachingActivity[];
  recommendationSource: string;
}