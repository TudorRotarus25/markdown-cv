"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Toolbar from "./Toolbar";
import { transformCv } from "./cv/transform";

const A4_PAGE_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 15;
const USABLE_PAGE_HEIGHT_MM = A4_PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2;
const MM_TO_PX = 3.7795;
const USABLE_PAGE_HEIGHT_PX = USABLE_PAGE_HEIGHT_MM * MM_TO_PX;

interface CvPreviewProps {
  initialHtml: string;
  initialHash: string;
}

/**
 * Section-aware page break detection. Iterates the top-level structured
 * children produced by transformCv (header, sections) and finds positions
 * where a child overflows the current page.
 */
function findSectionAwareBreaks(container: HTMLElement): number[] {
  const children = container.children;
  const breaks: number[] = [];
  let currentPageBottom = USABLE_PAGE_HEIGHT_PX;

  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    const childTop = child.offsetTop;
    const childBottom = childTop + child.offsetHeight;

    if (childBottom > currentPageBottom) {
      if (
        childTop < currentPageBottom &&
        childTop > currentPageBottom - USABLE_PAGE_HEIGHT_PX * 0.15
      ) {
        breaks.push(childTop);
        currentPageBottom = childTop + USABLE_PAGE_HEIGHT_PX;
      } else if (childTop >= currentPageBottom) {
        breaks.push(currentPageBottom);
        currentPageBottom += USABLE_PAGE_HEIGHT_PX;
        i--;
      } else {
        breaks.push(currentPageBottom);
        currentPageBottom += USABLE_PAGE_HEIGHT_PX;
        i--;
      }
    }
  }

  return breaks;
}

export default function CvPreview({ initialHtml, initialHash }: CvPreviewProps) {
  const [html, setHtml] = useState(initialHtml);
  const [hash, setHash] = useState(initialHash);
  const [pageCount, setPageCount] = useState(1);
  const [breakPositions, setBreakPositions] = useState<number[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const rawHostRef = useRef<HTMLDivElement>(null);

  const calculatePageBreaks = useCallback(() => {
    if (!contentRef.current) return;
    const inner = contentRef.current.querySelector(
      ".cv-rendered"
    ) as HTMLElement | null;
    if (!inner) return;

    const breaks = findSectionAwareBreaks(inner);
    setBreakPositions(breaks);
    setPageCount(breaks.length + 1);
  }, []);

  // Poll for cv.md changes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/cv");
        const data = await res.json();
        if (data.hash !== hash) {
          setHash(data.hash);
          setHtml(data.html);
        }
      } catch {
        // silently ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [hash]);

  // Run the transformation when html changes
  useEffect(() => {
    if (!rawHostRef.current || !contentRef.current) return;

    const rendered = transformCv(rawHostRef.current);

    // Replace the rendered host
    const oldRendered = contentRef.current.querySelector(".cv-rendered");
    if (oldRendered) oldRendered.remove();
    contentRef.current.appendChild(rendered);

    requestAnimationFrame(() => {
      calculatePageBreaks();
    });
  }, [html, calculatePageBreaks]);

  useEffect(() => {
    window.addEventListener("resize", calculatePageBreaks);
    return () => window.removeEventListener("resize", calculatePageBreaks);
  }, [calculatePageBreaks]);

  return (
    <>
      <Toolbar pageCount={pageCount} fileName="cv.md" />
      <div className="cv-paper">
        <div className="cv-content" ref={contentRef}>
          {/* Hidden host that holds the raw markdown HTML; transform reads from here */}
          <div
            ref={rawHostRef}
            className="cv-raw"
            style={{ display: "none" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {/* The transformed, designed CV is appended into .cv-content as .cv-rendered */}
        </div>
        {breakPositions.map((pos, i) => (
          <div
            key={i}
            className="page-break-indicator"
            style={{ top: `${pos}px` }}
          >
            <span className="page-break-label">Page {i + 2}</span>
          </div>
        ))}
      </div>
    </>
  );
}
