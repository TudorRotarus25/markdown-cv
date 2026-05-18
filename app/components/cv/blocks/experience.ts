import { buildSectionShell } from "./shell";

/**
 * Build the Work experience section.
 *
 * Each company is introduced by an <h3> like "Skyscanner (6 years)" — the
 * tenure in parentheses is split out into a banner badge. Roles inside the
 * company are <p><strong>Title</strong>\nLocation | Period</p> followed by
 * an optional context paragraph and a <ul> of bullets.
 *
 * Output structure:
 *   <article class="experience-company">
 *     <header class="exp-company-banner">
 *       <h3 class="exp-company-name">…</h3>
 *       <span class="exp-tenure">…</span>
 *     </header>
 *     <div class="exp-roles">
 *       <div class="exp-role">
 *         <div class="role-meta">…period, location…</div>
 *         <div class="role-body">…title, context, bullets…</div>
 *       </div>
 *     </div>
 *   </article>
 */
export function buildExperienceSection(
  title: string,
  content: HTMLElement[]
): HTMLElement {
  const section = buildSectionShell(title);
  const list = document.createElement("div");
  list.className = "experience-list";

  // Group by h3 boundaries.
  const groups: { header: HTMLElement; body: HTMLElement[] }[] = [];
  let current: { header: HTMLElement; body: HTMLElement[] } | null = null;

  for (const el of content) {
    if (el.tagName === "H3") {
      current = { header: el, body: [] };
      groups.push(current);
    } else if (current) {
      current.body.push(el);
    }
  }

  for (const group of groups) {
    list.appendChild(buildCompany(group.header, group.body));
  }

  section.appendChild(list);
  return section;
}

function buildCompany(h3: HTMLElement, body: HTMLElement[]): HTMLElement {
  const article = document.createElement("article");
  article.className = "experience-company";

  const { name, tenure } = splitCompanyHeading(h3.textContent ?? "");
  article.setAttribute(
    "aria-label",
    tenure ? `${name}, ${tenure}` : name
  );

  const banner = document.createElement("header");
  banner.className = "exp-company-banner";

  const nameEl = document.createElement("h3");
  nameEl.className = "exp-company-name";
  nameEl.textContent = name;
  banner.appendChild(nameEl);

  if (tenure) {
    const tenureEl = document.createElement("span");
    tenureEl.className = "exp-tenure";
    tenureEl.textContent = tenure;
    banner.appendChild(tenureEl);
  }

  article.appendChild(banner);

  const rolesEl = document.createElement("div");
  rolesEl.className = "exp-roles";
  for (const role of splitRoles(body)) {
    rolesEl.appendChild(buildRole(role));
  }
  article.appendChild(rolesEl);

  return article;
}

function splitCompanyHeading(raw: string): { name: string; tenure: string } {
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) return { name: match[1].trim(), tenure: match[2].trim() };
  return { name: raw.trim(), tenure: "" };
}

interface RoleParts {
  titleP: HTMLElement; // the <p><strong>Title</strong>…</p> element
  context?: HTMLElement; // optional following <p>
  bullets?: HTMLElement; // optional following <ul>
}

function splitRoles(body: HTMLElement[]): RoleParts[] {
  const roles: RoleParts[] = [];
  let i = 0;
  while (i < body.length) {
    const el = body[i];
    // Skip stray <br>, <hr> or empty paragraphs between roles
    if (el.tagName === "BR" || el.tagName === "HR") {
      i++;
      continue;
    }
    if (el.tagName === "P" && firstStrong(el)) {
      const role: RoleParts = { titleP: el };
      i++;
      // Optional context paragraph (no leading <strong>) before the bullets
      if (i < body.length && body[i].tagName === "P" && !firstStrong(body[i])) {
        role.context = body[i];
        i++;
      }
      // Optional bullet list
      if (i < body.length && body[i].tagName === "UL") {
        role.bullets = body[i];
        i++;
      }
      roles.push(role);
    } else {
      i++; // unknown element — skip
    }
  }
  return roles;
}

function firstStrong(p: HTMLElement): HTMLElement | null {
  // Returns the <strong> child only if it is the first non-whitespace node.
  for (const node of Array.from(p.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent ?? "").trim() === "") continue;
      return null;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      return (node as HTMLElement).tagName === "STRONG"
        ? (node as HTMLElement)
        : null;
    }
  }
  return null;
}

function buildRole(role: RoleParts): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "exp-role";

  const { title, location, period } = parseRoleHeader(role.titleP);

  const meta = document.createElement("div");
  meta.className = "role-meta";
  if (period) {
    const periodEl = document.createElement("span");
    periodEl.className = "role-period";
    periodEl.textContent = period;
    meta.appendChild(periodEl);
  }
  if (location) {
    const locEl = document.createElement("span");
    locEl.className = "role-location";
    locEl.textContent = location;
    meta.appendChild(locEl);
  }
  wrapper.appendChild(meta);

  const roleBody = document.createElement("div");
  roleBody.className = "role-body";

  const titleEl = document.createElement("h4");
  titleEl.className = "role-title";
  titleEl.textContent = title;
  roleBody.appendChild(titleEl);

  if (role.context) {
    const ctx = document.createElement("p");
    ctx.className = "role-context";
    while (role.context.firstChild) ctx.appendChild(role.context.firstChild);
    roleBody.appendChild(ctx);
  }

  if (role.bullets) {
    const ul = document.createElement("ul");
    ul.className = "role-bullets";
    for (const li of Array.from(role.bullets.children)) {
      if (li.tagName !== "LI") continue;
      const newLi = document.createElement("li");
      while (li.firstChild) newLi.appendChild(li.firstChild);
      ul.appendChild(newLi);
    }
    roleBody.appendChild(ul);
  }

  wrapper.appendChild(roleBody);
  return wrapper;
}

function parseRoleHeader(p: HTMLElement): {
  title: string;
  location: string;
  period: string;
} {
  const strong = firstStrong(p);
  const title = strong ? (strong.textContent ?? "").trim() : "";

  // Collect text after the strong element (the "\nLocation | Period" tail).
  let tail = "";
  let after = false;
  for (const node of Array.from(p.childNodes)) {
    if (!after) {
      if (node === strong) after = true;
      continue;
    }
    tail += node.textContent ?? "";
  }
  const meta = tail
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  // Heuristic: the segment containing "—", "–", a year, or "Present" is the period.
  let location = "";
  let period = "";
  for (const segment of meta) {
    if (
      /\b(19|20)\d{2}\b/.test(segment) ||
      /[—–-]/.test(segment) ||
      /present/i.test(segment)
    ) {
      period = period ? `${period} ${segment}` : segment;
    } else {
      location = location ? `${location} ${segment}` : segment;
    }
  }

  return { title, location, period };
}
