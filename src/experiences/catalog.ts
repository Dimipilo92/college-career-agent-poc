import { coachingDashboardExperience } from "./coaching-dashboard";
import { goalPlannerExperience } from "./goal-planner";
import { resumeHandoffExperience } from "./resume-handoff";

export type ExperienceStatus = "delivered" | "scaffolded" | "planned";

export interface ExperienceDefinition {
  id: string;
  title: string;
  status: ExperienceStatus;
  scaffoldPath: string;
  description: string;
  toolName?: string;
  resourceUri?: string;
}

export const experienceCatalog: ExperienceDefinition[] = [
  goalPlannerExperience,
  resumeHandoffExperience,
  coachingDashboardExperience,
  {
    id: "activity-library",
    title: "Activity library",
    status: "planned",
    scaffoldPath: "src/experiences/activity-library/",
    description: "Offer goal-filtered activities without reverting to a generic menu."
  },
  {
    id: "flashcards",
    title: "Flashcards",
    status: "planned",
    scaffoldPath: "src/experiences/flashcards/",
    description: "Deliver an interactive practice activity with recorded progress."
  },
  {
    id: "career-quiz",
    title: "Career-interest quiz",
    status: "planned",
    scaffoldPath: "src/experiences/career-quiz/",
    description: "Generate explainable career matches that can seed a goal."
  },
  {
    id: "occupation-comparison",
    title: "Occupation comparison",
    status: "planned",
    scaffoldPath: "src/experiences/occupation-comparison/",
    description: "Compare two occupations across agreed dimensions."
  },
  {
    id: "mock-interview",
    title: "Mock interview",
    status: "planned",
    scaffoldPath: "src/experiences/mock-interview/",
    description: "Run guided interview practice and return actionable feedback."
  },
  {
    id: "media-feedback",
    title: "Picture and voice feedback",
    status: "planned",
    scaffoldPath: "src/experiences/media-feedback/",
    description: "Review supported media with explicit user consent."
  },
  {
    id: "bootcamp",
    title: "Guided bootcamp journey",
    status: "planned",
    scaffoldPath: "src/experiences/bootcamp/",
    description: "Track milestones and next actions across a multi-week plan."
  }
];