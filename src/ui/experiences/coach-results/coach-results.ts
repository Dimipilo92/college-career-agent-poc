import { App } from "@modelcontextprotocol/ext-apps";
import "./coach-results.css";

interface CoachResultItem {
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  url: string;
}

interface CoachResultsPresentation {
  title: string;
  summary: string;
  items: CoachResultItem[];
  sourceNote: string;
}

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("App root not found");

const app = new App({ name: "Compass Career Coach results", version: "0.1.0" });

function escapeHtml(value: string): string {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function safeSourceUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function render(presentation: CoachResultsPresentation): void {
  const items = presentation.items.map((item) => {
    const details = item.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("");
    const sourceUrl = safeSourceUrl(item.url);
    const link = sourceUrl
      ? `<a href="${sourceUrl.replaceAll("&", "&amp;").replaceAll("\"", "&quot;")}" target="_blank" rel="noreferrer">View source</a>`
      : "";
    return `<article class="result-card">
      <header>
        <h2>${escapeHtml(item.title)}</h2>
        ${item.subtitle ? `<p class="subtitle">${escapeHtml(item.subtitle)}</p>` : ""}
      </header>
      <p>${escapeHtml(item.description)}</p>
      ${details ? `<ul>${details}</ul>` : ""}
      ${link}
    </article>`;
  }).join("");

  root.innerHTML = `<section class="results-panel">
    <header class="results-heading">
      <p class="eyebrow">Career Coach</p>
      <h1>${escapeHtml(presentation.title)}</h1>
      ${presentation.summary ? `<p>${escapeHtml(presentation.summary)}</p>` : ""}
    </header>
    <div class="results-grid">${items}</div>
    ${presentation.sourceNote ? `<footer>${escapeHtml(presentation.sourceNote)}</footer>` : ""}
  </section>`;
}

app.ontoolresult = (result) => {
  const presentation = result.structuredContent as CoachResultsPresentation | undefined;
  if (presentation?.items?.length) render(presentation);
};

app.connect().catch((error: unknown) => {
  root.textContent = error instanceof Error ? error.message : "Unable to display Career Coach results.";
});