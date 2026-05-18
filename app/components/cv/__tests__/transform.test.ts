import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { transformCv } from "../transform";

async function renderCvHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}

describe("transformCv against the real cv.md", () => {
  let rendered: HTMLDivElement;

  beforeEach(async () => {
    const md = readFileSync(join(process.cwd(), "cv.md"), "utf-8");
    const html = await renderCvHtml(md);
    const host = document.createElement("div");
    host.innerHTML = html;
    rendered = transformCv(host);
  });

  it("produces a .cv-rendered container", () => {
    expect(rendered.className).toBe("cv-rendered");
  });

  it("renders the header with name, tagline (with accent dot), and contact", () => {
    const header = rendered.querySelector("header.cv-header");
    expect(header).not.toBeNull();
    expect(header!.querySelector(".cv-name")?.textContent).toBe("Tudor Rotarus");
    expect(header!.querySelector(".cv-tagline .accent-dot")).not.toBeNull();
    expect(header!.querySelectorAll(".cv-contact-row").length).toBeGreaterThan(0);
  });

  it("renders a Summary section with .cv-summary", () => {
    const summary = rendered.querySelector(".cv-summary");
    expect(summary).not.toBeNull();
    expect(summary!.textContent).toMatch(/Senior software engineer/);
  });

  it("transforms Technical skills into <dl> with chips", () => {
    const dl = rendered.querySelector("dl.skills-grid");
    expect(dl).not.toBeNull();
    const labels = Array.from(dl!.querySelectorAll("dt.skill-label")).map(
      (el) => el.textContent
    );
    expect(labels).toContain("Languages");
    expect(labels).toContain("Infrastructure");
    expect(labels).toContain("Data");

    const tags = Array.from(dl!.querySelectorAll("dd.skill-tags .skill-tag"))
      .map((el) => el.textContent);
    expect(tags).toContain("Java");
    expect(tags).toContain("Kubernetes");
    expect(tags).toContain("Airflow");
  });

  it("transforms each company into an <article> with banner and roles", () => {
    const articles = rendered.querySelectorAll(
      "article.experience-company"
    );
    expect(articles.length).toBe(4); // Skyscanner, MatchesFashion, Qumu, SportPursuit

    const skyscanner = articles[0];
    const banner = skyscanner.querySelector(".exp-company-banner");
    expect(banner!.querySelector(".exp-company-name")?.textContent).toBe(
      "Skyscanner"
    );
    expect(banner!.querySelector(".exp-tenure")?.textContent).toBe("6 years");
  });

  it("splits role headers into period and location", () => {
    const firstRole = rendered.querySelector(
      "article.experience-company .exp-role"
    );
    expect(firstRole).not.toBeNull();
    const period = firstRole!.querySelector(".role-period")?.textContent ?? "";
    const location = firstRole!.querySelector(".role-location")?.textContent ?? "";
    expect(period).toMatch(/Aug 2022/);
    expect(period).toMatch(/Present/);
    expect(location).toBe("London, UK");
    expect(firstRole!.querySelector(".role-title")?.textContent).toBe(
      "Senior software engineer"
    );
  });

  it("preserves bullets inside the role body", () => {
    const bullets = rendered.querySelectorAll(
      "article.experience-company .exp-role .role-bullets li"
    );
    expect(bullets.length).toBeGreaterThanOrEqual(5);
    expect(bullets[0].textContent).toMatch(/baggage price/);
  });

  it("groups Skyscanner's two roles under one company article", () => {
    const skyscanner = rendered.querySelector("article.experience-company")!;
    const roles = skyscanner.querySelectorAll(".exp-role");
    expect(roles.length).toBe(2);
    const titles = Array.from(roles).map(
      (r) => r.querySelector(".role-title")?.textContent
    );
    expect(titles).toEqual([
      "Senior software engineer",
      "Software engineer II",
    ]);
  });

  it("renders Education and Languages inside a shared cv-footer grid", () => {
    const footer = rendered.querySelector(".cv-footer");
    expect(footer).not.toBeNull();
    expect(footer!.querySelector(".education-item .edu-school")?.textContent).toBe(
      "University of Bucharest"
    );
    expect(footer!.querySelector(".education-item .edu-period")?.textContent)
      .toMatch(/2013/);

    const langs = Array.from(
      footer!.querySelectorAll(".language-item")
    ).map((el) => ({
      name: el.querySelector(".lang-name")?.textContent,
      level: el.querySelector(".lang-level")?.textContent,
    }));
    expect(langs).toEqual([
      { name: "English", level: "Full professional" },
      { name: "Romanian", level: "Native" },
      { name: "Portuguese", level: "Conversational" },
    ]);
  });

  it("contains no italic styling-prone <em> elements in the rendered output", () => {
    expect(rendered.querySelectorAll("em").length).toBe(0);
  });
});
