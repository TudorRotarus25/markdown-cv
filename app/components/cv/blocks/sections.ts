export interface Section {
  title: string;
  content: HTMLElement[];
}

/**
 * Split top-level children into a header (everything before the first h2)
 * and an array of sections (h2 followed by its content until the next h2).
 * Stray <hr> and <br> elements are dropped.
 */
export function collectSections(elements: HTMLElement[]): {
  header: HTMLElement[];
  sections: Section[];
} {
  const header: HTMLElement[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const el of elements) {
    const tag = el.tagName;
    if (tag === "HR") continue;

    if (tag === "H2") {
      current = { title: el.textContent?.trim() ?? "", content: [] };
      sections.push(current);
      continue;
    }

    if (current) {
      current.content.push(el);
    } else {
      header.push(el);
    }
  }

  return { header, sections };
}

export function normalizeSectionName(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
