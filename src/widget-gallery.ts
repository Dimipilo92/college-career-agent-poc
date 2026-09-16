import {
  renderChoiceList,
  renderElicitationFooter,
  renderElicitationPanel,
  type ElicitationChoice
} from "./elicitation-widget";
import { experienceCatalog } from "./experiences/catalog";
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
}

render();