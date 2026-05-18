import { buildSectionShell } from "./shell";

/**
 * Flatten every skill paragraph into a single list of chips.
 *
 * Input  (one or more paragraphs):
 *   <p><strong>Languages:</strong> Java, Python</p>
 *   <p><strong>Infrastructure:</strong> AWS, Kubernetes, Docker, gRPC</p>
 *
 * Output:
 *   <ul class="skill-list">
 *     <li class="skill-tag">Java</li>
 *     <li class="skill-tag">Python</li>
 *     <li class="skill-tag">AWS</li>
 *     …
 *   </ul>
 *
 * Category labels in the source (Languages, Infrastructure, …) are discarded;
 * they remain useful for organising cv.md but the rendered design is flat.
 */
export function buildSkillsSection(
  title: string,
  content: HTMLElement[]
): HTMLElement {
  const section = buildSectionShell(title);
  const list = document.createElement("ul");
  list.className = "skill-list";

  for (const p of content) {
    if (p.tagName !== "P") continue;
    const items = collectChips(p);
    for (const item of items) {
      const tag = document.createElement("li");
      tag.className = "skill-tag";
      tag.textContent = item;
      list.appendChild(tag);
    }
  }

  section.appendChild(list);
  return section;
}

function collectChips(p: HTMLElement): string[] {
  const strong = p.querySelector(":scope > strong");
  const restText = strong ? textAfter(p, strong as HTMLElement) : (p.textContent ?? "");
  return restText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function textAfter(parent: HTMLElement, marker: HTMLElement): string {
  let found = false;
  let text = "";
  for (const node of Array.from(parent.childNodes)) {
    if (!found) {
      if (node === marker) found = true;
      continue;
    }
    text += node.textContent ?? "";
  }
  return text;
}
