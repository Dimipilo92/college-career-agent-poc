import { App } from "@modelcontextprotocol/ext-apps";
import {
  escapeHtml,
  renderChoiceList,
  renderElicitationFooter,
  renderElicitationPanel,
  type ElicitationChoice
} from "./elicitation-widget";
import type { Goal, Recommendation } from "./domain/goal";
import "./experimental-goal-planner.css";

interface PlannerResult { goal?: Goal; recommendations?: Recommendation[]; recommendationSource?: string; }

const rootElement = document.querySelector<HTMLElement>("#app");
if (!rootElement) throw new Error("App root not found");
const root: HTMLElement = rootElement;
const app = new App({ name: "College and Career Goal Planner", version: "0.1.0" });
const draft: Goal = { pathways: [], support: [], focus: "", cadence: "" };
let currentStep = 0;

const choiceSteps = [
  {
    title: "How would you like the agent to help you?",
    hint: "Select all that apply",
    field: "pathways" as const,
    options: [
      "Explore career paths but not actively applying",
      "Get help with my job search, applications, and interviews",
      "Transition to a new field or role"
    ]
  },
  {
    title: "What kind of support is most helpful to you right now?",
    hint: "Select all that apply",
    field: "support" as const,
    options: [
      "Career related resources or information",
      "Practice",
      "Accountability",
      "Task support",
      "Feedback and reflection",
      "Encouragement"
    ]
  }
];

function renderOptions(options: string[], selected: string[], dataAttribute: string): string {
  const choices: ElicitationChoice[] = options.map((label) => ({ label }));
  return renderChoiceList(choices, selected, dataAttribute);
}

function navigation(primaryLabel: string, primaryId: string, disabled: boolean, canSkip = false, canEnterCustomAnswer = false): string {
  return renderElicitationFooter(primaryLabel, primaryId, disabled, currentStep > 0, canSkip, canEnterCustomAnswer);
}

function renderStep(): void {
  if (currentStep < choiceSteps.length) {
    const step = choiceSteps[currentStep];
    const selected = draft[step.field];
    root.innerHTML = renderElicitationPanel({
      title: `${step.title} (${step.hint})`,
      currentStep: currentStep + 1,
      totalSteps: 4,
      content: renderOptions(step.options, selected, "data-choice"),
      footer: navigation("Next", "next", selected.length === 0, false, true)
    });
    root.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.choice;
        if (!value) return;
        const index = selected.indexOf(value);
        index >= 0 ? selected.splice(index, 1) : selected.push(value);
        renderStep();
      });
    });
  } else if (currentStep === 2) {
    root.innerHTML = renderElicitationPanel({
      title: "What are you working toward?",
      currentStep: 3,
      totalSteps: 4,
      content: `<p>Any specific interests that you’re interested in applying to a career? For example: math, public speaking, art, or teaching others.</p><textarea id="focus" rows="4" placeholder="Type an answer">${escapeHtml(draft.focus)}</textarea>`,
      footer: navigation("Next", "next", false, true)
    });
  } else {
    const cadences = ["Daily", "Weekly", "Every two weeks", "Monthly"];
    root.innerHTML = renderElicitationPanel({
      title: "How often do you want to set milestones for this plan?",
      currentStep: 4,
      totalSteps: 4,
      content: `<div class="two-columns">${renderOptions(cadences.map((value) => value === "Weekly" ? "Weekly (recommended)" : value), draft.cadence === "Weekly" ? ["Weekly (recommended)"] : [draft.cadence], "data-cadence")}</div><p id="status" role="status"></p>`,
      footer: navigation("Submit", "submit", !draft.cadence, true)
    });
    root.querySelectorAll<HTMLButtonElement>("[data-cadence]").forEach((button) => {
      button.addEventListener("click", () => {
        draft.cadence = button.dataset.cadence?.replace(" (recommended)", "") ?? "";
        renderStep();
      });
    });
  }

  root.querySelector<HTMLButtonElement>("#back")?.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    renderStep();
  });
  root.querySelector<HTMLButtonElement>("#next")?.addEventListener("click", () => {
    if (currentStep === 2) draft.focus = root.querySelector<HTMLTextAreaElement>("#focus")?.value.trim() ?? "";
    currentStep += 1;
    renderStep();
  });
  root.querySelector<HTMLButtonElement>("#custom-answer")?.addEventListener("click", () => {
    currentStep = 2;
    renderStep();
    root.querySelector<HTMLTextAreaElement>("#focus")?.focus();
  });
  root.querySelector<HTMLButtonElement>("#skip")?.addEventListener("click", () => {
    if (currentStep === 2) {
      draft.focus = "Explore education and career opportunities";
      currentStep += 1;
      renderStep();
      return;
    }
    draft.cadence = "Weekly";
    submitGoal();
  });
  root.querySelector<HTMLButtonElement>("#submit")?.addEventListener("click", submitGoal);
}

async function submitGoal(): Promise<void> {
  const status = root.querySelector<HTMLElement>("#status");
  if (status) status.textContent = "Putting your plan together...";
  try {
    const result = await app.callServerTool({ name: "save_goal", arguments: { ...draft } });
    renderResult(result.structuredContent as PlannerResult);
  } catch {
    if (status) status.textContent = "Career Coach is unavailable. Please try again.";
  }
}

function renderResult(result: PlannerResult): void {
  if (!result.goal) return renderStep();
  root.innerHTML = `<section class="planner"><header><div><span>Your goal</span><h1>${escapeHtml(result.goal.focus)}</h1></div><button id="edit">Edit goal</button></header>
    <p>Timeline: ${escapeHtml(result.goal.cadence.toLowerCase())} milestones · Recommendations from ${escapeHtml(result.recommendationSource ?? "Career Coach MCP")}</p>
    <div class="recommendations">${(result.recommendations ?? []).map((item) => `<article><small>${escapeHtml(item.duration)}</small><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></article>`).join("")}</div>
  </section>`;
  root.querySelector<HTMLButtonElement>("#edit")?.addEventListener("click", () => {
    currentStep = 0;
    renderStep();
  });
}

app.ontoolresult = (result) => {
  const data = result.structuredContent as PlannerResult | undefined;
  data?.goal ? renderResult(data) : renderStep();
};

async function start(): Promise<void> {
  await app.connect();
  renderStep();
}

start().catch((error: unknown) => {
  root.textContent = error instanceof Error ? error.message : "Unable to start the goal planner.";
});