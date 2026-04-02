import { readFileSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

const CV_PATH = join(process.cwd(), "cv.md");

export async function parseCvMarkdown(): Promise<string> {
  const content = readFileSync(CV_PATH, "utf-8");
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);
  return String(result);
}

export function getCvHash(): string {
  const content = readFileSync(CV_PATH, "utf-8");
  return createHash("md5").update(content).digest("hex");
}
