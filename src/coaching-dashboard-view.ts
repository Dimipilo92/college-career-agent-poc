import type { CoachingActivity, ActivityStatus } from "./domain/activities";
import type { GoalPlan } from "./domain/goal";
import { escapeHtml } from "./elicitation-widget";

const sections: Array<{ status: ActivityStatus; title: string; empty: string }> = [
  { status: "active", title: "In progress", empty: "Start a recommended activity when you are ready." },
  { status: "recommended", title: "Recommended next", empty: "You have started every recommendation." },
  { status: "completed", title: "Completed", empty: "Completed activities will collect here." }
];

function renderActivity(activity: CoachingActivity): string {
  const action = activity.status === "recommended"
    ? `<button class="activity-action" type="button" data-start-activity="${escapeHtml(activity.id)}">Start</button>`
    : activity.status === "active"
      ? `<button class="activity-action primary" type="button" data-complete-activity="${escapeHtml(activity.id)}">Complete</button>`
      : `<span class="completion-mark" aria-label="Completed">✓</span>`;
  const timing = activity.status === "completed" ? "Completed" : activity.duration;

  return `<article class="activity-card">
    <div class="activity-copy">
      <span class="activity-meta">${escapeHtml(timing)}</span>
      <h3>${escapeHtml(activity.title)}</h3>
      <p>${escapeHtml(activity.description)}</p>
    </div>
    ${action}
  </article>`;
}

export function renderCoachingDashboard(plan?: GoalPlan, statusMessage = ""): string {
  if (!plan?.goal) {
    return `<section class="dashboard-shell dashboard-empty">
      <span class="eyebrow">Your coaching plan</span>
      <h1>Start with a goal</h1>
      <p>Set a college or career goal to receive focused activities and track your progress.</p>
    </section>`;
  }

  const completed = plan.activities.filter((activity) => activity.status === "completed").length;
  const total = plan.activities.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const sectionMarkup = sections.map((section) => {
    const activities = plan.activities.filter((activity) => activity.status === section.status);
    return `<section class="activity-section" aria-labelledby="${section.status}-title">
      <div class="section-heading">
        <h2 id="${section.status}-title">${section.title}</h2>
        <span>${activities.length}</span>
      </div>
      ${activities.length > 0
        ? `<div class="activity-list">${activities.map(renderActivity).join("")}</div>`
        : `<p class="empty-message">${section.empty}</p>`}
    </section>`;
  }).join("");

  return `<section class="dashboard-shell">
    <header class="goal-header">
      <div>
        <span class="eyebrow">Your coaching plan</span>
        <h1>${escapeHtml(plan.goal.focus)}</h1>
        <p>${escapeHtml(plan.goal.cadence)} milestones · Guidance from ${escapeHtml(plan.recommendationSource)}</p>
      </div>
      <div class="progress-summary" aria-label="${completed} of ${total} activities completed">
        <strong>${progress}%</strong>
        <span>${completed} of ${total} complete</span>
      </div>
    </header>
    <div class="progress-track" aria-hidden="true"><span style="width:${progress}%"></span></div>
    <p class="dashboard-status" role="status" aria-live="polite">${escapeHtml(statusMessage)}</p>
    <div class="dashboard-content">${sectionMarkup}</div>
  </section>`;
}
