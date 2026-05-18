import { buildSectionShell } from "./shell";

/**
 * Build the Languages section.
 *
 * Input format:
 *   <p>
 *     <strong>English</strong> - Full professional |
 *     <strong>Romanian</strong> - Native |
 *     <strong>Portuguese</strong> - Conversational
 *   </p>
 *
 * Output:
 *   <div class="languages-list">
 *     <div class="language-item">
 *       <span class="lang-name">English</span>
 *       <span class="lang-level">Full professional</span>
 *     </div>
 *     …
 *   </div>
 */
export function buildLanguagesSection(
  title: string,
  content: HTMLElement[]
): HTMLElement {
  const section = buildSectionShell(title);

  const items: { name: string; level: string }[] = [];

  for (const p of content) {
    if (p.tagName !== "P") continue;

    let currentName = "";
    let currentLevel = "";
    const flush = () => {
      const name = currentName.trim();
      const level = stripLeadingSeparators(currentLevel).trim();
      if (name) items.push({ name, level });
      currentName = "";
      currentLevel = "";
    };

    for (const node of Array.from(p.childNodes)) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node as HTMLElement).tagName === "STRONG"
      ) {
        if (currentName) flush();
        currentName = (node.textContent ?? "").trim();
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        if (text.includes("|")) {
          const parts = text.split("|");
          parts.forEach((part, idx) => {
            currentLevel += part;
            if (idx < parts.length - 1) flush();
          });
        } else {
          currentLevel += text;
        }
      }
    }
    flush();
  }

  const list = document.createElement("div");
  list.className = "languages-list";
  for (const { name, level } of items) {
    const item = document.createElement("div");
    item.className = "language-item";

    const nameEl = document.createElement("span");
    nameEl.className = "lang-name";
    nameEl.textContent = name;
    item.appendChild(nameEl);

    if (level) {
      const levelEl = document.createElement("span");
      levelEl.className = "lang-level";
      levelEl.textContent = level;
      item.appendChild(levelEl);
    }

    list.appendChild(item);
  }
  section.appendChild(list);

  return section;
}

function stripLeadingSeparators(s: string): string {
  return s.replace(/^[\s\-–—:]+/, "");
}
