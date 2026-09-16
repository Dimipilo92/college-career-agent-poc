import {
  renderChoiceList,
  renderElicitationFooter,
  renderElicitationPanel,
  type ElicitationChoice
} from "./elicitation-widget";
import { renderCoachingDashboard } from "./coaching-dashboard-view";
import type { GoalPlan } from "./domain/goal";
import { experienceCatalog } from "./experiences/catalog";
import "./coaching-dashboard.css";
import "./experimental-goal-planner.css";

const galleryElement = document.querySelector<HTMLElement>("#gallery");
if (!galleryElement) throw new Error("Widget gallery root not found");
const gallery: HTMLElement = galleryElement;

const choices: ElicitationChoice[] = [
  { label: "Explore career paths but not actively applying" },
  { label: "Get help with my job search, applications, and interviews" },
  { label: "Transition to a new field or role" }
];
const selected: string[] = [];
const dashboardFixture: GoalPlan = {
  goal: {
    pathways: ["Explore career paths but not actively applying"],
    support: ["Practice", "Accountability"],
    focus: "Build a strong portfolio for art school",
    cadence: "Weekly"
  },
  recommendations: [],
  recommendationSource: "Career Coach MCP",
  activities: [
    {
      id: "portfolio-review",
      title: "Review your portfolio story",
      duration: "15-20 min",
      description: "Choose three pieces and write one sentence about the skill each one demonstrates.",
      status: "recommended"
    },
    {
      id: "program-research",
      title: "Compare two art programs",
      duration: "20 min",
      description: "Capture portfolio requirements, dates, and one question to ask each program.",
      status: "active",
      startedAt: "2026-09-15T17:00:00.000Z"
    },
    {
      id: "goal-outline",
      title: "Outline your application goal",
      duration: "10 min",
      description: "Turn your interests into a concrete application milestone.",
      status: "completed",
      completedAt: "2026-09-14T17:00:00.000Z"
    }
  ]
};

function render(): void {
  const catalog = experienceCatalog.map((experience) => `<li>
    <span class="experience-status ${experience.status}">${experience.status}</span>
    <strong>${experience.title}</strong>
    <code>${experience.scaffoldPath}</code>
  </li>`).join("");

  gallery.innerHTML = `<div class="gallery-page">
    <div class="gallery-heading">
      <span>Experience scaffold</span>
      <h1>Elicitation panel</h1>
    </div>
    ${renderElicitationPanel({
      title: "How would you like the agent to help you? (Select all that apply)",
      currentStep: 1,
      totalSteps: 4,
      content: renderChoiceList(choices, selected, "data-gallery-choice"),
      footer: renderElicitationFooter("Next", "gallery-next", selected.length === 0, false, false, true)
    })}
    <div class="gallery-heading dashboard-gallery-heading">
      <span>Main workflow</span>
      <h1>Coaching dashboard</h1>
    </div>
    ${renderCoachingDashboard(dashboardFixture)}
    <section class="experience-catalog" aria-labelledby="experience-catalog-title">
      <h2 id="experience-catalog-title">Experience extension points</h2>
      <ul>${catalog}</ul>
    </section>
  </div>`;

  gallery.querySelectorAll<HTMLButtonElement>("[data-gallery-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.galleryChoice;
      if (!value) return;
      const index = selected.indexOf(value);
      index >= 0 ? selected.splice(index, 1) : selected.push(value);
      render();
    });
  });
  gallery.querySelectorAll<HTMLButtonElement>("[data-start-activity]").forEach((button) => {
    button.addEventListener("click", () => {
      const activity = dashboardFixture.activities.find((candidate) => candidate.id === button.dataset.startActivity);
      if (activity) activity.status = "active";
      render();
    });
  });
  gallery.querySelectorAll<HTMLButtonElement>("[data-complete-activity]").forEach((button) => {
    button.addEventListener("click", () => {
      const activity = dashboardFixture.activities.find((candidate) => candidate.id === button.dataset.completeActivity);
      if (activity) activity.status = "completed";
      render();
    });
  });
}

render();