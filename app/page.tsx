import { parseCvMarkdown, getCvHash } from "@/app/lib/markdown";
import CvPreview from "@/app/components/CvPreview";

export default async function Home() {
  const [html, hash] = await Promise.all([
    parseCvMarkdown(),
    Promise.resolve(getCvHash()),
  ]);

  return (
    <div className="cv-page">
      <CvPreview initialHtml={html} initialHash={hash} />
    </div>
  );
}
