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
  it("renders an All tab plus one tab per tag inside a labelled tablist", () => {
    render(
      <BlogCategoryFilter tags={tags} selectedTag={null} onTagChange={vi.fn()} />,
    );
    expect(
      screen.getByRole("tablist", { name: "Filter by topic" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(tags.length + 1);
    expect(screen.getByRole("tab", { name: "All Posts" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("marks the selected tag as active", () => {
    render(
      <BlogCategoryFilter
        tags={tags}
        selectedTag="Tooling"
        onTagChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("tab", { name: "Tooling" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "All Posts" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("calls onTagChange with the tag or null", async () => {
    const onTagChange = vi.fn();
    render(
      <BlogCategoryFilter tags={tags} selectedTag={null} onTagChange={onTagChange} />,
    );
    await userEvent.click(screen.getByRole("tab", { name: "Design" }));
    expect(onTagChange).toHaveBeenLastCalledWith("Design");
    await userEvent.click(screen.getByRole("tab", { name: "All Posts" }));
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
    // "All Posts" total = 4 + 2 + 1 = 7; each tab shows its own count.
    expect(screen.getByText("(7)")).toBeInTheDocument();
    expect(screen.getByText("(4)")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /All Posts/ })).toBeInTheDocument();
  });

  it("moves between tabs with arrow keys (automatic activation)", async () => {
    const onTagChange = vi.fn();
    render(
      <BlogCategoryFilter tags={tags} selectedTag={null} onTagChange={onTagChange} />,
    );
    const allTab = screen.getByRole("tab", { name: "All Posts" });
    allTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onTagChange).toHaveBeenLastCalledWith("Design");
    await userEvent.keyboard("{ArrowLeft}");
    expect(onTagChange).toHaveBeenLastCalledWith(null);
    await userEvent.keyboard("{End}");
    expect(onTagChange).toHaveBeenLastCalledWith("Process");
  });

  it("uses roving tabindex so only the active tab is in the tab order", () => {
    render(
      <BlogCategoryFilter tags={tags} selectedTag="Design" onTagChange={vi.fn()} />,
    );
    expect(screen.getByRole("tab", { name: "Design" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("tab", { name: "All Posts" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
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
