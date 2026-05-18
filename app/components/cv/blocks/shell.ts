/**
 * Build a <section class="cv-section"> with an h2.section-label header.
 * Used by every section block builder for consistent structure.
 */
export function buildSectionShell(title: string): HTMLElement {
  const section = document.createElement("section");
  section.className = "cv-section";
  const label = document.createElement("h2");
  label.className = "section-label";
  label.textContent = title;
  section.appendChild(label);
  return section;
}
