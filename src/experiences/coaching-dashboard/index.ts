import type { CoachingActivity } from "../../domain/activities";
import type { Goal } from "../../domain/goal";
import type { ExperienceDefinition } from "../catalog";

export const coachingDashboardExperience: ExperienceDefinition = {
  id: "coaching-dashboard",
  title: "Coaching dashboard",
  status: "scaffolded",
  scaffoldPath: "src/experiences/coaching-dashboard/",
  description: "Show the goal and recommended, active, and completed activities."
};

export interface CoachingDashboardModel {
  goal: Goal;
  activities: CoachingActivity[];
  recommendationSource: string;
}