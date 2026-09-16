import { App } from "@modelcontextprotocol/ext-apps";
import type { GoalPlan } from "./domain/goal";
import { renderCoachingDashboard } from "./coaching-dashboard-view";
import "./coaching-dashboard.css";

const rootElement = document.querySelector<HTMLElement>("#dashboard");
if (!rootElement) throw new Error("Dashboard root not found");
const root: HTMLElement = rootElement;
const app = new App({ name: "College and Career Coaching Dashboard", version: "0.1.0" });
let currentPlan: GoalPlan | undefined;

function render(statusMessage = ""): void {
  root.innerHTML = renderCoachingDashboard(currentPlan, statusMessage);
  root.querySelectorAll<HTMLButtonElement>("[data-start-activity]").forEach((button) => {
    button.addEventListener("click", () => updateActivity("start_activity", button.dataset.startActivity, "Activity started."));
  });
  root.querySelectorAll<HTMLButtonElement>("[data-complete-activity]").forEach((button) => {
    button.addEventListener("click", () => updateActivity("complete_activity", button.dataset.completeActivity, "Activity completed."));
  });
}

async function updateActivity(toolName: string, activityId: string | undefined, successMessage: string): Promise<void> {
  if (!activityId) return;
  root.querySelectorAll<HTMLButtonElement>("button").forEach((button) => button.disabled = true);
  try {
    const result = await app.callServerTool({ name: toolName, arguments: { activityId } });
    if (result.isError) throw new Error("Activity update failed");
    currentPlan = result.structuredContent as unknown as GoalPlan;
    render(successMessage);
  } catch {
    render("We could not update that activity. Please try again.");
  }
}

app.ontoolresult = (result) => {
  currentPlan = result.structuredContent as unknown as GoalPlan | undefined;
  render();
};

async function start(): Promise<void> {
  await app.connect();
  render();
}

start().catch((error: unknown) => {
  root.textContent = error instanceof Error ? error.message : "Unable to start the coaching dashboard.";
});
