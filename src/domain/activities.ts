import type { Recommendation } from "./goal";

export type ActivityStatus = "recommended" | "active" | "completed";

export interface CoachingActivity extends Recommendation {
  status: ActivityStatus;
  startedAt?: string;
  completedAt?: string;
}