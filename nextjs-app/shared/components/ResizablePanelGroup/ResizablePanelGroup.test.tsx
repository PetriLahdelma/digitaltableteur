import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { ResizablePanelGroup } from "./ResizablePanelGroup";

expect.extend(toHaveNoViolations);

const panels = [
  {
    id: "left",
    ariaLabel: "Left panel",
    content: "Left",
    initialSize: 40,
    minSize: 20,
  },
  {
    id: "right",
    ariaLabel: "Right panel",
    content: "Right",
    initialSize: 60,
    minSize: 20,
  },
];

describe("ResizablePanelGroup", () => {
  it("renders named regions and a value-bearing separator", () => {
    render(<ResizablePanelGroup panels={panels} />);
    expect(
      screen.getByRole("region", { name: "Left panel" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
  });

  it("resizes adjacent panels with arrow, Home, and End keys", async () => {
    const user = userEvent.setup();
    const onSizesChange = vi.fn();
    render(
      <ResizablePanelGroup panels={panels} onSizesChange={onSizesChange} />,
    );
    const separator = screen.getByRole("separator");
    separator.focus();

    await user.keyboard("{ArrowRight}");
    expect(separator).toHaveAttribute("aria-valuenow", "45");
    await user.keyboard("{Home}");
    expect(separator).toHaveAttribute("aria-valuenow", "20");
    await user.keyboard("{End}");
    expect(separator).toHaveAttribute("aria-valuenow", "80");
    expect(onSizesChange).toHaveBeenCalled();
  });

  it("returns null for fewer than two panels", () => {
    const { container } = render(<ResizablePanelGroup panels={[panels[0]]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<ResizablePanelGroup panels={panels} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
