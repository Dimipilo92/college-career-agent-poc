import { z } from "zod";

export const goalSchema = z.object({
  pathways: z.array(z.string()).min(1),
  support: z.array(z.string()).min(1),
  focus: z.string().min(1),
  cadence: z.string().min(1),
  resumeUrl: z.string().optional()
});

export type Goal = z.infer<typeof goalSchema>;
export type GoalContext = Pick<Goal, "pathways" | "support" | "focus">;

export interface Recommendation {
  id: string;
  title: string;
  duration: string;
  description: string;
}

export interface GoalPlan {
  goal: Goal;
  recommendations: Recommendation[];
  recommendationSource: string;
}