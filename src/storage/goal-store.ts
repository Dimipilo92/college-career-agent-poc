import type { GoalPlan } from "../domain/goal.js";

export interface GoalStore {
  get(): GoalPlan | undefined;
  save(plan: GoalPlan): void;
}

export function createInMemoryGoalStore(): GoalStore {
  let currentPlan: GoalPlan | undefined;

  return {
    get: () => currentPlan,
    save: (plan) => {
      currentPlan = plan;
    }
  };
}