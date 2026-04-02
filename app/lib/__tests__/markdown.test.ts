import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

// Mock fs at module level — vitest hoists this
vi.mock("fs", () => {
  const fn = vi.fn();
  return { readFileSync: fn, default: { readFileSync: fn } };
});

// Must import after vi.mock
const { readFileSync } = await import("fs");
const mockedReadFileSync = vi.mocked(readFileSync);

const SAMPLE_MD = `# John Doe

**Software Engineer**

---

## Experience

### Acme Corp

- Built things
- Led team
`;

beforeEach(() => {
  mockedReadFileSync.mockReturnValue(SAMPLE_MD);
});

describe("parseCvMarkdown", () => {
  it("returns HTML string from markdown", async () => {
    const { parseCvMarkdown } = await import("../markdown");
    const html = await parseCvMarkdown();
    expect(html).toContain("<h1>John Doe</h1>");
    expect(html).toContain("<h2>Experience</h2>");
    expect(html).toContain("<h3>Acme Corp</h3>");
  });

  it("renders bullet points as list items", async () => {
    const { parseCvMarkdown } = await import("../markdown");
    const html = await parseCvMarkdown();
    expect(html).toContain("<li>Built things</li>");
    expect(html).toContain("<li>Led team</li>");
  });

  it("renders bold text as strong tags", async () => {
    const { parseCvMarkdown } = await import("../markdown");
    const html = await parseCvMarkdown();
    expect(html).toContain("<strong>Software Engineer</strong>");
  });

  it("renders horizontal rules", async () => {
    const { parseCvMarkdown } = await import("../markdown");
    const html = await parseCvMarkdown();
    expect(html).toContain("<hr>");
  });

  it("handles GFM tables", async () => {
    mockedReadFileSync.mockReturnValue(
      "| Skill | Level |\n| --- | --- |\n| JS | Expert |"
    );
    const { parseCvMarkdown } = await import("../markdown");
    const html = await parseCvMarkdown();
    expect(html).toContain("<table>");
    expect(html).toContain("<td>JS</td>");
  });

  it("preserves inline HTML via rehype-raw", async () => {
    mockedReadFileSync.mockReturnValue(
      'Hello <span class="custom">world</span>'
    );
    const { parseCvMarkdown } = await import("../markdown");
    const html = await parseCvMarkdown();
    expect(html).toContain('<span class="custom">world</span>');
  });
});

describe("getCvHash", () => {
  it("returns a 32-character hex string", async () => {
    const { getCvHash } = await import("../markdown");
    const hash = getCvHash();
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it("returns consistent hash for same content", async () => {
    const { getCvHash } = await import("../markdown");
    const hash1 = getCvHash();
    const hash2 = getCvHash();
    expect(hash1).toBe(hash2);
  });

  it("matches expected md5 hash", async () => {
    const { getCvHash } = await import("../markdown");
    const expected = createHash("md5").update(SAMPLE_MD).digest("hex");
    const hash = getCvHash();
    expect(hash).toBe(expected);
  });

  it("returns different hash for different content", async () => {
    const { getCvHash } = await import("../markdown");
    const hash1 = getCvHash();
    mockedReadFileSync.mockReturnValue("Different content");
    const hash2 = getCvHash();
    expect(hash1).not.toBe(hash2);
  });
});
