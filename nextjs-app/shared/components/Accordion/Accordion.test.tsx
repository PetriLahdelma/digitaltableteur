import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Accordion from "./Accordion";

const items = [
  { id: "1", title: "First Item", content: "First content" },
  { id: "2", title: "Second Item", content: "Second content" },
  { id: "3", title: "Third Item", content: "Third content" },
];

/** Panels stay mounted; open state is read from the trigger + panel wrapper. */
const trigger = (name: RegExp | string) => screen.getByRole("button", { name });
const isOpen = (id: string) =>
  document
    .getElementById(`panel-${id}`)
    ?.closest("[data-open]")
    ?.getAttribute("data-open") === "true";

describe("Accordion", () => {
  it("renders all accordion items", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("First Item")).toBeInTheDocument();
    expect(screen.getByText("Second Item")).toBeInTheDocument();
    expect(screen.getByText("Third Item")).toBeInTheDocument();
  });

  it("keeps every panel mounted for valid aria-controls, closed by default", () => {
    render(<Accordion items={items} />);
    items.forEach((item) => {
      expect(document.getElementById(`panel-${item.id}`)).toBeInTheDocument();
      expect(isOpen(item.id)).toBe(false);
    });
  });

  it("marks closed panels inert and aria-hidden; open panels neither", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const panel1 = document.getElementById("panel-1")!;
    expect(panel1).toHaveAttribute("aria-hidden", "true");
    await user.click(trigger("First Item"));
    expect(panel1).not.toHaveAttribute("aria-hidden");
    expect(panel1).not.toHaveAttribute("inert");
  });

  it("opens item with defaultOpenId", () => {
    render(<Accordion items={items} defaultOpenId="2" />);
    expect(isOpen("2")).toBe(true);
    expect(isOpen("1")).toBe(false);
  });

  it("toggles open and closed on repeated clicks", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    await user.click(trigger("First Item"));
    expect(isOpen("1")).toBe(true);
    await user.click(trigger("First Item"));
    expect(isOpen("1")).toBe(false);
  });

  it("single mode closes the previous item when opening a new one", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpenId="1" />);
    expect(isOpen("1")).toBe(true);
    await user.click(trigger("Second Item"));
    expect(isOpen("1")).toBe(false);
    expect(isOpen("2")).toBe(true);
  });

  it("multiple mode keeps several sections open at once", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} type="multiple" />);
    await user.click(trigger("First Item"));
    await user.click(trigger("Second Item"));
    expect(isOpen("1")).toBe(true);
    expect(isOpen("2")).toBe(true);
  });

  it("supports controlled open state via openIds + onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Accordion
        items={items}
        type="multiple"
        openIds={["1"]}
        onOpenChange={onOpenChange}
      />,
    );
    expect(isOpen("1")).toBe(true);
    // Controlled: click reports intent but does not self-update.
    await user.click(trigger("Second Item"));
    expect(onOpenChange).toHaveBeenCalledWith(["1", "2"]);
    expect(isOpen("2")).toBe(false);
    // Parent applies the new state.
    rerender(
      <Accordion
        items={items}
        type="multiple"
        openIds={["1", "2"]}
        onOpenChange={onOpenChange}
      />,
    );
    expect(isOpen("2")).toBe(true);
  });

  it("does not toggle a disabled item", async () => {
    const user = userEvent.setup();
    const disabledItems = [
      {
        id: "1",
        title: "First Item",
        content: "First content",
        disabled: true,
      },
      { id: "2", title: "Second Item", content: "Second content" },
    ];
    render(<Accordion items={disabledItems} />);
    const first = trigger("First Item");
    expect(first).toBeDisabled();
    await user.click(first);
    expect(isOpen("1")).toBe(false);
  });

  it("applies the variant class", () => {
    const { container, rerender } = render(
      <Accordion items={items} variant="divided" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "divided",
    );
    rerender(<Accordion items={items} variant="contained" />);
    expect((container.firstChild as HTMLElement).className).toContain(
      "contained",
    );
  });

  it("reflects aria-expanded on the trigger", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const first = trigger("First Item");
    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("wires aria-controls to the region panel", () => {
    render(<Accordion items={items} />);
    const first = trigger("First Item");
    expect(first).toHaveAttribute("aria-controls", "panel-1");
    const panel = document.getElementById("panel-1");
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", "trigger-1");
  });

  it("renders content as a React node", () => {
    const complexItems = [
      {
        id: "1",
        title: "Item",
        content: (
          <div>
            <strong>Bold</strong> text
          </div>
        ),
      },
    ];
    render(<Accordion items={complexItems} defaultOpenId="1" />);
    expect(screen.getByText("Bold")).toBeInTheDocument();
  });

  it("renders a chevron icon for each item", () => {
    const { container } = render(<Accordion items={items} />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(items.length);
  });

  it("returns null when no items are provided", () => {
    const { container } = render(<Accordion items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
