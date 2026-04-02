"use client";

interface ToolbarProps {
  pageCount: number;
  fileName: string;
}

export default function Toolbar({ pageCount, fileName }: ToolbarProps) {
  const isWithinTarget = pageCount <= 2;

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="toolbar-file">{fileName}</span>
      </div>
      <div className="toolbar-right">
        <span
          className={`toolbar-badge ${isWithinTarget ? "toolbar-badge-ok" : "toolbar-badge-over"}`}
        >
          {pageCount} {pageCount === 1 ? "page" : "pages"}
        </span>
        <button className="toolbar-export" onClick={() => window.print()}>
          Export PDF
        </button>
      </div>
    </div>
  );
}
