import { App } from "@modelcontextprotocol/ext-apps";
import "./experimental-goal-planner.css";

interface Recommendation { id: string; title: string; duration: string; description: string; }
interface Goal { pathways: string[]; support: string[]; focus: string; cadence: string; }
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

function escapeHtml(value: string): string {
  const node = document.createElement("span");
  node.textContent = value;
  return node.innerHTML;
}

function renderOptions(options: string[], selected: string[], dataAttribute: string): string {
  return options.map((option, index) => `<button class="option ${selected.includes(option) ? "selected" : ""}" ${dataAttribute}="${escapeHtml(option)}"><span class="option-number">${index + 1}</span><span>${escapeHtml(option)}</span></button>`).join("");
}

function navigation(primaryLabel: string, primaryId: string, disabled: boolean, canSkip = false): string {
  return `<footer>${currentStep > 0 ? `<button id="back">Back</button>` : ""}<div class="forward-actions">${canSkip ? `<button id="skip">Skip</button>` : ""}<button class="primary" id="${primaryId}" ${disabled ? "disabled" : ""}>${primaryLabel}</button></div></footer>`;
}

function renderStep(): void {
  if (currentStep < choiceSteps.length) {
    const step = choiceSteps[currentStep];
    const selected = draft[step.field];
    root.innerHTML = `<section class="planner">
      <header><div><span>Get customized results</span><h1>${escapeHtml(step.title)} <small>(${step.hint})</small></h1></div><strong>${currentStep + 1} of 4</strong></header>
      <div class="options">${renderOptions(step.options, selected, "data-choice")}</div>
      ${navigation("Next", "next", selected.length === 0)}
    </section>`;
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
    root.innerHTML = `<section class="planner">
      <header><div><span>Get customized results</span><h1>What are you working toward?</h1></div><strong>3 of 4</strong></header>
      <p>Any specific interests that you’re interested in applying to a career? For example: math, public speaking, art, or teaching others.</p>
      <textarea id="focus" rows="4" placeholder="Type an answer">${escapeHtml(draft.focus)}</textarea>
      ${navigation("Next", "next", false, true)}
    </section>`;
  } else {
    const cadences = ["Daily", "Weekly", "Every two weeks", "Monthly"];
    root.innerHTML = `<section class="planner">
      <header><div><span>Get customized results</span><h1>How often do you want to set milestones for this plan?</h1></div><strong>4 of 4</strong></header>
      <div class="options two-columns">${renderOptions(cadences.map((value) => value === "Weekly" ? "Weekly (recommended)" : value), draft.cadence === "Weekly" ? ["Weekly (recommended)"] : [draft.cadence], "data-cadence")}</div>
      ${navigation("Submit", "submit", !draft.cadence, true)}
      <p id="status" role="status"></p>
    </section>`;
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