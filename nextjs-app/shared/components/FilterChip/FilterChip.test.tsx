import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { FilterChip } from "./FilterChip";

expect.extend(toHaveNoViolations);

describe("FilterChip", () => {
  it("renders a toggle button reflecting pressed state", () => {
    const { rerender } = render(<FilterChip pressed={false}>All</FilterChip>);
    const chip = screen.getByRole("button", { name: "All" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    rerender(<FilterChip pressed>All</FilterChip>);
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(
      <FilterChip pressed={false} onClick={onClick}>
        Branding
      </FilterChip>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Branding" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders the count suffix in the accessible name", () => {
    render(
      <FilterChip pressed={false} count={7}>
        Design systems
      </FilterChip>,
    );
    expect(
      screen.getByRole("button", { name: "Design systems (7)" }),
    ).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    const { container } = render(
      <FilterChip pressed={false} variant="underline" size="lg">
        Tag
      </FilterChip>,
    );
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toMatch(/underline/);
    expect(cls).toMatch(/lg/);
  });

  it("is a non-submitting button", () => {
    render(<FilterChip pressed={false}>All</FilterChip>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("has no axe violations inside a labelled group", async () => {
    const { container } = render(
      <div role="group" aria-label="Filter by topic">
        <FilterChip pressed>All</FilterChip>
        <FilterChip pressed={false} count={3}>
          Design systems
        </FilterChip>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
