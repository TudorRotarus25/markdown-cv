import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toolbar from "../Toolbar";

describe("Toolbar", () => {
  it("displays the file name", () => {
    render(<Toolbar pageCount={1} fileName="cv.md" />);
    expect(screen.getByText("cv.md")).toBeInTheDocument();
  });

  it("displays singular 'page' for count of 1", () => {
    const { container } = render(<Toolbar pageCount={1} fileName="cv.md" />);
    const badge = container.querySelector(".toolbar-badge")!;
    expect(badge.textContent).toBe("1 page");
  });

  it("displays plural 'pages' for count > 1", () => {
    const { container } = render(<Toolbar pageCount={2} fileName="cv.md" />);
    const badge = container.querySelector(".toolbar-badge")!;
    expect(badge.textContent).toBe("2 pages");
  });

  it("shows green badge when page count is within target (<=2)", () => {
    const { container } = render(<Toolbar pageCount={2} fileName="cv.md" />);
    const badge = container.querySelector(".toolbar-badge")!;
    expect(badge.className).toContain("toolbar-badge-ok");
  });

  it("shows red badge when page count exceeds target (>2)", () => {
    const { container } = render(<Toolbar pageCount={3} fileName="cv.md" />);
    const badge = container.querySelector(".toolbar-badge")!;
    expect(badge.className).toContain("toolbar-badge-over");
  });

  it("renders an Export PDF button", () => {
    const { container } = render(<Toolbar pageCount={1} fileName="cv.md" />);
    const button = container.querySelector(".toolbar-export")!;
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe("Export PDF");
  });

  it("calls window.print when Export PDF is clicked", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const { container } = render(<Toolbar pageCount={1} fileName="cv.md" />);
    const button = container.querySelector(".toolbar-export")!;
    await userEvent.click(button);
    expect(printSpy).toHaveBeenCalledOnce();
    printSpy.mockRestore();
  });
});
