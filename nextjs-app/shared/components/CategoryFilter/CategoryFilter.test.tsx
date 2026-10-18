import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { CategoryFilter } from "./CategoryFilter";

expect.extend(toHaveNoViolations);

const categories = [
  { value: "all", label: "All" },
  { value: "web", label: "Web" },
  { value: "brand", label: "Brand" },
];

describe("CategoryFilter", () => {
  it("renders one toggle button per category inside a labelled group", () => {
    render(
      <CategoryFilter
        categories={categories}
        activeCategory="all"
        onCategoryChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("group", { name: "Filter projects by category" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(categories.length);
  });

  it("marks the active category as pressed, exactly one at a time", () => {
    render(
      <CategoryFilter
        categories={categories}
        activeCategory="web"
        onCategoryChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Web" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const pressed = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(1);
  });

  it("calls onCategoryChange when a filter is activated", async () => {
    const onCategoryChange = vi.fn();
    render(
      <CategoryFilter
        categories={categories}
        activeCategory="all"
        onCategoryChange={onCategoryChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Brand" }));
    expect(onCategoryChange).toHaveBeenLastCalledWith("brand");
  });

  it.each(["pills", "underline", "minimal"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = render(
        <CategoryFilter
          categories={categories}
          activeCategory="web"
          onCategoryChange={vi.fn()}
          variant={variant}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );

  it("collapses to the active chip behind a leading disclosure button", async () => {
    const onCategoryChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CategoryFilter
        categories={categories}
        activeCategory="web"
        onCategoryChange={onCategoryChange}
        collapsible
        disclosureLabel="All categories"
      />,
    );
    const toggle = screen.getByRole("button", { name: "All categories" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getAllByRole("button")[0]).toBe(toggle);

    await user.click(toggle);
    expect(toggle).toHaveFocus();
    expect(screen.getAllByRole("button")).toHaveLength(categories.length + 1);

    await user.click(screen.getByRole("button", { name: "Brand" }));
    expect(onCategoryChange).toHaveBeenCalledWith("brand");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("has no axe violations when collapsible", async () => {
    const { container } = render(
      <CategoryFilter
        categories={categories}
        activeCategory="all"
        onCategoryChange={vi.fn()}
        collapsible
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
