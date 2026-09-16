import type { Recommendation } from "./goal.js";

export type ActivityStatus = "recommended" | "active" | "completed";

export interface CoachingActivity extends Recommendation {
  status: ActivityStatus;
  startedAt?: string;
  completedAt?: string;
}