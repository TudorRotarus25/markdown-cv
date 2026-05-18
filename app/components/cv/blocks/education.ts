import { buildSectionShell } from "./shell";

/**
 * Build the Education section.
 *
 * Input format (per entry):
 *   <h3>University of Bucharest</h3>
 *   <p>Bachelor's degree, computer science | 2013 – 2016</p>
 *
 * Output:
 *   <div class="education-item">
 *     <div>
 *       <h3 class="edu-school">University of Bucharest</h3>
 *       <div class="edu-period">2013 — 2016</div>
 *     </div>
 *     <p class="edu-degree">Bachelor's degree, computer science</p>
 *   </div>
 */
export function buildEducationSection(
  title: string,
  content: HTMLElement[]
): HTMLElement {
  const section = buildSectionShell(title);

  let i = 0;
  while (i < content.length) {
    const el = content[i];
    if (el.tagName !== "H3") {
      i++;
      continue;
    }
    const next = content[i + 1];
    const detailP = next && next.tagName === "P" ? next : null;
    section.appendChild(buildEducationItem(el, detailP));
    i += detailP ? 2 : 1;
  }

  return section;
}

function buildEducationItem(
  h3: HTMLElement,
  detailP: HTMLElement | null
): HTMLElement {
  const item = document.createElement("div");
  item.className = "education-item";

  const left = document.createElement("div");
  const school = document.createElement("h3");
  school.className = "edu-school";
  school.textContent = h3.textContent ?? "";
  left.appendChild(school);

  let degree = "";
  let period = "";
  if (detailP) {
    const text = (detailP.textContent ?? "").trim();
    const parts = text.split("|").map((s) => s.trim());
    for (const part of parts) {
      if (
        /\b(19|20)\d{2}\b/.test(part) ||
        /[—–-]/.test(part) ||
        /present/i.test(part)
      ) {
        period = period ? `${period} ${part}` : part;
      } else {
        degree = degree ? `${degree} ${part}` : part;
      }
    }
  }

  if (period) {
    const periodEl = document.createElement("div");
    periodEl.className = "edu-period";
    periodEl.textContent = period;
    left.appendChild(periodEl);
  }
  item.appendChild(left);

  const degreeEl = document.createElement("p");
  degreeEl.className = "edu-degree";
  degreeEl.textContent = degree;
  item.appendChild(degreeEl);

  return item;
}
