/**
 * Transform raw markdown-rendered HTML into the structured CV design.
 *
 * Input:  a host element containing remark-rehype output (h1, p, hr, h2, h3,
 *         p with strong, ul, etc).
 * Output: a new <div class="cv-rendered"> with header + sections + footer-grid,
 *         ready to be styled by cv.css.
 *
 * Designed to be tolerant: missing sections are skipped, unknown content
 * falls through as a generic block.
 */

import { buildHeader } from "./blocks/header";
import { buildSummarySection } from "./blocks/summary";
import { buildSkillsSection } from "./blocks/skills";
import { buildExperienceSection } from "./blocks/experience";
import { buildEducationSection } from "./blocks/education";
import { buildLanguagesSection } from "./blocks/languages";
import { collectSections, normalizeSectionName } from "./blocks/sections";

export function transformCv(rawHost: HTMLElement): HTMLDivElement {
  const rendered = document.createElement("div");
  rendered.className = "cv-rendered";

  const elements = Array.from(rawHost.children) as HTMLElement[];
  const { header, sections } = collectSections(elements);

  if (header.length > 0) {
    rendered.appendChild(buildHeader(header));
  }

  // Education + Languages are placed inside a shared footer-grid wrapper.
  let footerGrid: HTMLDivElement | null = null;
  const ensureFooter = () => {
    if (footerGrid) return footerGrid;
    footerGrid = document.createElement("div");
    footerGrid.className = "cv-footer";
    rendered.appendChild(footerGrid);
    return footerGrid;
  };

  for (const section of sections) {
    const name = normalizeSectionName(section.title);
    if (name === "summary") {
      rendered.appendChild(buildSummarySection(section.title, section.content));
    } else if (name === "technical-skills" || name === "skills") {
      rendered.appendChild(buildSkillsSection(section.title, section.content));
    } else if (name === "work-experience" || name === "experience") {
      rendered.appendChild(
        buildExperienceSection(section.title, section.content)
      );
    } else if (name === "education") {
      ensureFooter().appendChild(
        buildEducationSection(section.title, section.content)
      );
    } else if (name === "languages") {
      ensureFooter().appendChild(
        buildLanguagesSection(section.title, section.content)
      );
    } else {
      // Unknown section: passthrough as a generic section so content isn't lost.
      const sectionEl = document.createElement("section");
      sectionEl.className = "cv-section";
      const label = document.createElement("h2");
      label.className = "section-label";
      label.textContent = section.title;
      sectionEl.appendChild(label);
      for (const node of section.content) sectionEl.appendChild(node.cloneNode(true));
      rendered.appendChild(sectionEl);
    }
  }

  return rendered;
}
