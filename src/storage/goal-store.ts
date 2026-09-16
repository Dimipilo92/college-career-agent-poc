import type { GoalPlan } from "../domain/goal.js";
import fs from "node:fs";
import path from "node:path";

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

export function createFileGoalStore(filePath: string): GoalStore {
  return {
    get: () => {
      try {
        const plan = JSON.parse(fs.readFileSync(filePath, "utf-8")) as GoalPlan;
        plan.activities ??= plan.recommendations.map((recommendation) => ({
          ...recommendation,
          status: "recommended"
        }));
        return plan;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
        throw error;
      }
    },
    save: (plan) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const temporaryPath = `${filePath}.${process.pid}.tmp`;
      fs.writeFileSync(temporaryPath, JSON.stringify(plan, null, 2), "utf-8");
      fs.renameSync(temporaryPath, filePath);
    }
  };
}