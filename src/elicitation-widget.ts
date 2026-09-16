import chevronIcon from "./assets/chevron.svg";
import editIcon from "./assets/edit.svg";

export interface ElicitationChoice {
  label: string;
  value?: string;
}

export interface ElicitationPanelOptions {
  title: string;
  currentStep: number;
  totalSteps: number;
  content: string;
  footer?: string;
}

export function escapeHtml(value: string): string {
  const node = document.createElement("span");
  node.textContent = value;
  return node.innerHTML;
}

export function renderElicitationPanel(options: ElicitationPanelOptions): string {
  return `<section class="elicitation-panel">
    <header class="elicitation-titlebar">
      <h1>${escapeHtml(options.title)}</h1>
      <div class="elicitation-title-actions">
        <span class="pagination">${options.currentStep} of ${options.totalSteps}<img src="${chevronIcon}" alt="" width="16" height="16"></span>
      </div>
    </header>
    <div class="elicitation-content">${options.content}</div>
    ${options.footer ?? ""}
  </section>`;
}

export function renderChoiceList(
  choices: ElicitationChoice[],
  selected: string[],
  dataAttribute: string
): string {
  const items = choices.map((choice, index) => {
    const value = choice.value ?? choice.label;
    const isSelected = selected.includes(value);
    return `<button class="elicitation-choice${isSelected ? " selected" : ""}" type="button" ${dataAttribute}="${escapeHtml(value)}" aria-pressed="${isSelected}">
      <span class="choice-number">${index + 1}</span>
      <span class="choice-label">${escapeHtml(choice.label)}</span>
    </button>`;
  }).join("");

  return `<div class="choice-list">${items}</div>`;
}

export function renderElicitationFooter(
  primaryLabel: string,
  primaryId: string,
  disabled: boolean,
  showBack: boolean,
  canSkip = false,
  canEnterCustomAnswer = false
): string {
  return `<footer class="elicitation-footer">
    <div class="footer-start">${showBack ? `<button class="back-button" id="back" type="button">Back</button>` : ""}</div>
    <button class="custom-answer" id="custom-answer" type="button" aria-label="Type an answer" ${canEnterCustomAnswer ? "" : "disabled"}>
      <img src="${editIcon}" alt="" width="16" height="16">
      <span>Type an answer</span>
    </button>
    <div class="footer-actions">
      ${canSkip ? `<button class="pill-button" id="skip" type="button">Skip</button>` : ""}
      <button class="pill-button primary" id="${primaryId}" type="button" ${disabled ? "disabled" : ""}>${escapeHtml(primaryLabel)}</button>
    </div>
  </footer>`;
}