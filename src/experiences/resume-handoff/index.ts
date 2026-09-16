import type { Goal } from "../../domain/goal";
import type { ExperienceDefinition } from "../catalog";

export const resumeHandoffExperience: ExperienceDefinition = {
  id: "resume-handoff",
  title: "Resume handoff",
  status: "scaffolded",
  scaffoldPath: "src/experiences/resume-handoff/",
  description: "Collect and revisit resume context after goal creation."
};

export interface ResumeHandoffModel {
  goal: Goal;
  resumeUrl?: string;
}