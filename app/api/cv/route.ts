import { parseCvMarkdown, getCvHash } from "@/app/lib/markdown";

export const dynamic = "force-dynamic";

export async function GET() {
  const [html, hash] = await Promise.all([
    parseCvMarkdown(),
    Promise.resolve(getCvHash()),
  ]);

  return Response.json({ html, hash });
}
