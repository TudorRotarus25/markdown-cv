import { buildSectionShell } from "./shell";

/**
 * Transform skill paragraphs into a definition list with chips.
 *
 * Input:  <p><strong>Languages:</strong> Java, Python</p>
 * Output: <dl class="skills-grid">
 *           <dt class="skill-label">Languages</dt>
 *           <dd class="skill-tags">
 *             <span class="skill-tag">Java</span>
 *             <span class="skill-tag">Python</span>
 *           </dd>
 *         </dl>
 */
export function buildSkillsSection(
  title: string,
  content: HTMLElement[]
): HTMLElement {
  const section = buildSectionShell(title);
  const dl = document.createElement("dl");
  dl.className = "skills-grid";

  for (const p of content) {
    if (p.tagName !== "P") continue;
    const strong = p.querySelector(":scope > strong");
    if (!strong) continue;

    const labelText = (strong.textContent ?? "").replace(/:$/, "").trim();
    const restText = collectTextAfter(p, strong as HTMLElement).trim();
    const items = restText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!labelText || items.length === 0) continue;

    const dt = document.createElement("dt");
    dt.className = "skill-label";
    dt.textContent = labelText;

    const dd = document.createElement("dd");
    dd.className = "skill-tags";
    for (const item of items) {
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.textContent = item;
      dd.appendChild(tag);
    }

    dl.appendChild(dt);
    dl.appendChild(dd);
  }

  section.appendChild(dl);
  return section;
}

function collectTextAfter(parent: HTMLElement, marker: HTMLElement): string {
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
