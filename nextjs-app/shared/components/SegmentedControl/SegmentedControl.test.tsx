import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import SegmentedControl, { type SegmentedControlItem } from "./SegmentedControl";

expect.extend(toHaveNoViolations);

const items: SegmentedControlItem[] = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "board", label: "Board" },
];

describe("SegmentedControl", () => {
  it("renders a radiogroup with the selected radio checked and tabbable", () => {
    render(<SegmentedControl items={items} value="grid" onValueChange={() => {}} ariaLabel="View" />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(grid).toHaveAttribute("aria-checked", "true");
    expect(grid).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("tabindex", "-1");
  });

  it("selects on click", () => {
    const onValueChange = vi.fn();
    render(<SegmentedControl items={items} value="list" onValueChange={onValueChange} ariaLabel="View" />);
    fireEvent.click(screen.getByRole("radio", { name: "Board" }));
    expect(onValueChange).toHaveBeenCalledWith("board");
  });

  it("moves selection with arrow keys, wrapping", () => {
    const onValueChange = vi.fn();
    render(<SegmentedControl items={items} value="list" onValueChange={onValueChange} ariaLabel="View" />);
    const list = screen.getByRole("radio", { name: "List" });
    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledWith("grid");
    fireEvent.keyDown(list, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenCalledWith("board");
    fireEvent.keyDown(list, { key: "End" });
    expect(onValueChange).toHaveBeenCalledWith("board");
  });

  it("skips disabled segments in keyboard navigation", () => {
    const onValueChange = vi.fn();
    const withDisabled: SegmentedControlItem[] = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    render(<SegmentedControl items={withDisabled} value="a" onValueChange={onValueChange} ariaLabel="X" />);
    fireEvent.keyDown(screen.getByRole("radio", { name: "A" }), { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledWith("c");
    expect(screen.getByRole("radio", { name: "B" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SegmentedControl items={items} value="list" onValueChange={() => {}} ariaLabel="View" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
