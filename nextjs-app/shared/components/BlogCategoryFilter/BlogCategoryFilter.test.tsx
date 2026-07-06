import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { BlogCategoryFilter } from "./BlogCategoryFilter";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

const tags = ["Design", "Tooling", "Process"];

describe("BlogCategoryFilter", () => {
  it("renders an All filter plus one per tag inside a labelled group", () => {
    render(
      <BlogCategoryFilter tags={tags} selectedTag={null} onTagChange={vi.fn()} />,
    );
    expect(
      screen.getByRole("group", { name: "Filter by topic" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(tags.length + 1);
    expect(screen.getByRole("button", { name: "All Posts" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("marks the selected tag as pressed", () => {
    render(
      <BlogCategoryFilter
        tags={tags}
        selectedTag="Tooling"
        onTagChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Tooling" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All Posts" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("keeps exactly one filter pressed at a time (single-select)", () => {
    render(
      <BlogCategoryFilter tags={tags} selectedTag="Design" onTagChange={vi.fn()} />,
    );
    const pressed = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveAccessibleName("Design");
  });

  it("calls onTagChange with the tag or null", async () => {
    const onTagChange = vi.fn();
    render(
      <BlogCategoryFilter tags={tags} selectedTag={null} onTagChange={onTagChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Design" }));
    expect(onTagChange).toHaveBeenLastCalledWith("Design");
    await userEvent.click(screen.getByRole("button", { name: "All Posts" }));
    expect(onTagChange).toHaveBeenLastCalledWith(null);
  });

  it("shows per-tag counts when enabled", () => {
    render(
      <BlogCategoryFilter
        tags={tags}
        selectedTag={null}
        onTagChange={vi.fn()}
        showCounts
        tagCounts={{ Design: 4, Tooling: 2, Process: 1 }}
      />,
    );
    // "All Posts" total = 4 + 2 + 1 = 7; each filter shows its own count.
    expect(screen.getByText("(7)")).toBeInTheDocument();
    expect(screen.getByText("(4)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /All Posts/ }),
    ).toBeInTheDocument();
  });

  it.each(["pills", "underline", "minimal"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = render(
        <BlogCategoryFilter
          tags={tags}
          selectedTag="Design"
          onTagChange={vi.fn()}
          variant={variant}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
