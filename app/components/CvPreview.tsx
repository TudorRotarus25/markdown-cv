"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Toolbar from "./Toolbar";

// A4: 297mm height, with 15mm top+bottom margins = 267mm usable
// At 96dpi: 1mm ≈ 3.7795px, so 267mm ≈ 1009px usable per page
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
 * Find section-aware page break positions.
 * Instead of breaking at a fixed pixel grid, we find the top-level sections
 * (h2 or hr elements) and ensure breaks fall between sections, not inside them.
 */
function findSectionAwareBreaks(container: HTMLElement): number[] {
  // Get all top-level block children that act as section boundaries
  const children = container.children;
  const breaks: number[] = [];
  let currentPageBottom = USABLE_PAGE_HEIGHT_PX;

  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    const childTop = child.offsetTop;
    const childBottom = childTop + child.offsetHeight;

    // If this element overflows the current page
    if (childBottom > currentPageBottom) {
      // Place the break just before this element (at its top edge)
      // Unless the element starts before the page boundary (it straddles it)
      if (childTop < currentPageBottom && childTop > currentPageBottom - USABLE_PAGE_HEIGHT_PX * 0.15) {
        // Element starts near the bottom of the page — push break before it
        breaks.push(childTop);
        currentPageBottom = childTop + USABLE_PAGE_HEIGHT_PX;
      } else if (childTop >= currentPageBottom) {
        // Element starts after the page boundary — break at the boundary
        breaks.push(currentPageBottom);
        currentPageBottom += USABLE_PAGE_HEIGHT_PX;
        // Re-check this element against the new page
        i--;
      } else {
        // Element is large and starts well before the boundary — break at boundary
        breaks.push(currentPageBottom);
        currentPageBottom += USABLE_PAGE_HEIGHT_PX;
        i--;
      }
    }
  }

  return breaks;
}

/**
 * Wrap each company's positions in a .company-group div.
 * Finds h3 elements (company names), then collects all siblings until the next h3 or hr,
 * wraps them in a container with a vertical timeline line.
 */
function wrapCompanyGroups(container: HTMLElement) {
  // Remove any existing wrappers first (for re-runs)
  container.querySelectorAll(".company-group").forEach((group) => {
    const parent = group.parentNode!;
    while (group.firstChild) {
      parent.insertBefore(group.firstChild, group);
    }
    parent.removeChild(group);
  });

  const h3s = Array.from(container.querySelectorAll("h3"));
  for (const h3 of h3s) {
    const siblings: Element[] = [];
    let next = h3.nextElementSibling;
    while (next && next.tagName !== "H3" && next.tagName !== "HR" && next.tagName !== "H2") {
      siblings.push(next);
      next = next.nextElementSibling;
    }
    if (siblings.length === 0) continue;

    const wrapper = document.createElement("div");
    wrapper.className = "company-group";
    h3.parentNode!.insertBefore(wrapper, siblings[0]);
    for (const sib of siblings) {
      wrapper.appendChild(sib);
    }
  }
}

export default function CvPreview({ initialHtml, initialHash }: CvPreviewProps) {
  const [html, setHtml] = useState(initialHtml);
  const [hash, setHash] = useState(initialHash);
  const [pageCount, setPageCount] = useState(1);
  const [breakPositions, setBreakPositions] = useState<number[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const calculatePageBreaks = useCallback(() => {
    if (!contentRef.current) return;
    const inner = contentRef.current.firstElementChild as HTMLElement;
    if (!inner) return;

    const breaks = findSectionAwareBreaks(inner);
    setBreakPositions(breaks);
    setPageCount(breaks.length + 1);
  }, []);

  // Poll for changes
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
        // Silently ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [hash]);

  // Wrap company groups and recalculate page breaks when HTML changes
  useEffect(() => {
    if (!contentRef.current) return;
    const inner = contentRef.current.firstElementChild as HTMLElement;
    if (inner) wrapCompanyGroups(inner);
    requestAnimationFrame(() => {
      calculatePageBreaks();
    });
  }, [html, calculatePageBreaks]);

  // Recalculate on window resize
  useEffect(() => {
    window.addEventListener("resize", calculatePageBreaks);
    return () => window.removeEventListener("resize", calculatePageBreaks);
  }, [calculatePageBreaks]);

  return (
    <>
      <Toolbar pageCount={pageCount} fileName="cv.md" />
      <div className="cv-paper">
        <div className="cv-content" ref={contentRef}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
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
