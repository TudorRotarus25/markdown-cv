/**
 * Build the CV header from the raw elements before the first <h2>.
 *
 * Expected raw input:
 *   <h1>Name</h1>
 *   <p>Tagline | Sub</p>
 *   <p>email | phone | location</p>
 *
 * The tagline paragraph is split on " | " and rendered with an accent dot
 * before the first segment and dot dividers between subsequent segments.
 * The contact paragraph is split on " | " and each segment becomes a row
 * with an inferred label (Email / Phone / Based).
 */
export function buildHeader(elements: HTMLElement[]): HTMLElement {
  const header = document.createElement("header");
  header.className = "cv-header";

  const main = document.createElement("div");
  header.appendChild(main);

  const h1 = elements.find((e) => e.tagName === "H1");
  if (h1) {
    const name = document.createElement("h1");
    name.className = "cv-name";
    name.textContent = h1.textContent ?? "";
    main.appendChild(name);
  }

  const paragraphs = elements.filter((e) => e.tagName === "P");
  const taglineP = paragraphs[0];
  const contactP = paragraphs[1];

  if (taglineP) main.appendChild(buildTagline(taglineP));
  if (contactP) header.appendChild(buildContact(contactP));

  return header;
}

function buildTagline(p: HTMLElement): HTMLElement {
  const tagline = document.createElement("p");
  tagline.className = "cv-tagline";

  const dot = document.createElement("span");
  dot.className = "accent-dot";
  dot.setAttribute("aria-hidden", "true");
  tagline.appendChild(dot);

  const segments = (p.textContent ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  segments.forEach((segment, idx) => {
    if (idx > 0) {
      const divider = document.createElement("span");
      divider.className = "divider";
      divider.setAttribute("aria-hidden", "true");
      divider.textContent = "·";
      tagline.appendChild(divider);
    }
    tagline.appendChild(document.createTextNode(segment));
  });

  return tagline;
}

function buildContact(p: HTMLElement): HTMLElement {
  const contact = document.createElement("address");
  contact.className = "cv-contact";

  const segments = parseContactSegments(p);

  segments.forEach(({ label, node }) => {
    const row = document.createElement("div");
    row.className = "cv-contact-row";
    if (label) {
      const labelSpan = document.createElement("span");
      labelSpan.className = "label";
      labelSpan.textContent = label;
      row.appendChild(labelSpan);
    }
    row.appendChild(node);
    contact.appendChild(row);
  });

  return contact;
}

interface ContactSegment {
  label: string;
  node: Node;
}

function parseContactSegments(p: HTMLElement): ContactSegment[] {
  // Split the paragraph by " | " text occurrences while preserving anchor tags.
  // Strategy: walk children; accumulate fragments separated by "|".
  const result: ContactSegment[] = [];
  let buffer: Node[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const fragment = document.createDocumentFragment();
    for (const n of buffer) fragment.appendChild(n);
    const textForLabel = (fragment.textContent ?? "").trim();
    result.push({ label: inferContactLabel(textForLabel), node: fragment });
    buffer = [];
  };

  const childNodes = Array.from(p.childNodes);
  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text.includes("|")) {
        if (text.trim()) {
          buffer.push(document.createTextNode(text.trim()));
        }
        continue;
      }
      const parts = text.split("|");
      parts.forEach((part, i) => {
        const trimmed = part.trim();
        if (trimmed) buffer.push(document.createTextNode(trimmed));
        if (i < parts.length - 1) flush();
      });
    } else {
      buffer.push(node.cloneNode(true));
    }
  }
  flush();

  return result;
}

function inferContactLabel(text: string): string {
  if (/@/.test(text)) return "Email";
  if (/^[+\d\s()-]+$/.test(text)) return "Phone";
  if (/^https?:\/\//i.test(text) || /(linkedin|github|gitlab)/i.test(text)) {
    return "Link";
  }
  return "Based";
}
