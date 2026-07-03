import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import EmptyState from "./EmptyState";

expect.extend(toHaveNoViolations);

describe("EmptyState", () => {
  it("renders title as a heading and optional description", () => {
    render(
      <EmptyState title="No results" description="Try another term." />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "No results" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Try another term.")).toBeInTheDocument();
  });

  it("respects headingLevel", () => {
    render(<EmptyState title="Empty" headingLevel="h3" />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Empty" }),
    ).toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(
      <EmptyState title="No projects">
        <button type="button">New project</button>
      </EmptyState>,
    );
    expect(
      screen.getByRole("button", { name: "New project" }),
    ).toBeInTheDocument();
  });

  it("keeps the icon decorative", () => {
    const { container } = render(<EmptyState title="Empty" icon="tray" />);
    const iconWrap = container.querySelector("[aria-hidden='true']");
    expect(iconWrap).not.toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <EmptyState
        icon="magnifying-glass"
        title="No results found"
        description="Try a different search term."
      >
        <button type="button">Clear filters</button>
      </EmptyState>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
