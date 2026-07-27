import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { VirtualListItem } from "./VirtualListItem";

expect.extend(toHaveNoViolations);

// role="listitem" is only valid inside a list.
const inList = (ui: React.ReactNode) => (
  <div role="list" aria-label="Results">
    {ui}
  </div>
);

describe("VirtualListItem", () => {
  it("is a listitem carrying its position metadata", () => {
    render(
      inList(
        <VirtualListItem posInSet={5} setSize={1000}>
          Component result 5
        </VirtualListItem>,
      ),
    );
    const row = screen.getByRole("listitem");
    expect(row).toHaveAttribute("aria-posinset", "5");
    expect(row).toHaveAttribute("aria-setsize", "1000");
    expect(row).toHaveTextContent("Component result 5");
  });

  it("composes the ListItem chrome (icon, meta, selected check)", () => {
    render(
      inList(
        <VirtualListItem
          posInSet={1}
          setSize={3}
          icon={<span data-testid="icon" />}
          meta={<span>meta</span>}
          selected
        >
          Row
        </VirtualListItem>,
      ),
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("meta")).toBeInTheDocument();
  });

  it("applies the windowing position style from VirtualList", () => {
    render(
      inList(
        <VirtualListItem
          posInSet={2}
          setSize={3}
          style={{ position: "absolute", transform: "translateY(96px)" }}
        >
          Row
        </VirtualListItem>,
      ),
    );
    const row = screen.getByRole("listitem");
    expect(row.style.transform).toBe("translateY(96px)");
    expect(row.style.position).toBe("absolute");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      inList(
        <VirtualListItem
          posInSet={1}
          setSize={10}
          icon={<span aria-hidden="true" />}
          meta={<span>New</span>}
        >
          Component result 1
        </VirtualListItem>,
      ),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
