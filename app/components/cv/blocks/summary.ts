import { buildSectionShell } from "./shell";

/**
 * Wrap the summary paragraph(s) into a styled section.
 * Uses the first paragraph; additional paragraphs are appended as separate
 * <p class="cv-summary"> blocks.
 */
export function buildSummarySection(
  title: string,
  content: HTMLElement[]
): HTMLElement {
  const section = buildSectionShell(title);

  const paragraphs = content.filter((c) => c.tagName === "P");
  for (const p of paragraphs) {
    const styled = document.createElement("p");
    styled.className = "cv-summary";
    // Preserve inline children (strong, em removed, links).
    while (p.firstChild) styled.appendChild(p.firstChild);
    section.appendChild(styled);
  }

  return section;
}
