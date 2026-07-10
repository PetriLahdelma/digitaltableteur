import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProjectNav } from "./ProjectNav";

expect.extend(toHaveNoViolations);

// t(key, fallback) -> return the fallback so labels are readable.
vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string) => fallback ?? key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

describe("ProjectNav", () => {
  it("renders a labelled navigation landmark with a back-to-work link", () => {
    render(<ProjectNav currentSlug="project-spine" />);

    expect(
      screen.getByRole("navigation", { name: "Project navigation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to work/i }),
    ).toHaveAttribute("href", "/work");
  });

  it("renders previous and next project links for a mid-sequence project", () => {
    render(<ProjectNav currentSlug="project-spine" />);

    const prev = screen.getByRole("link", { name: /previous project/i });
    const next = screen.getByRole("link", { name: /next project/i });
    expect(prev).toHaveAttribute("href", expect.stringContaining("/work/"));
    expect(next).toHaveAttribute("href", expect.stringContaining("/work/"));
  });

  it("disables the previous control on the first project", () => {
    render(<ProjectNav currentSlug="dsharp-design-system" />);

    expect(
      screen.queryByRole("link", { name: /previous project/i }),
    ).not.toBeInTheDocument();
    // The disabled placeholder is announced as aria-disabled.
    expect(
      document.querySelector('[aria-disabled="true"]'),
    ).toBeInTheDocument();
  });

  it("disables the next control on the last project", () => {
    render(<ProjectNav currentSlug="finnish-transport-agency" />);

    expect(
      screen.queryByRole("link", { name: /next project/i }),
    ).not.toBeInTheDocument();
  });

  it("applies a custom className to the nav", () => {
    render(<ProjectNav currentSlug="project-spine" className="custom-nav" />);

    expect(screen.getByRole("navigation")).toHaveClass("custom-nav");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProjectNav currentSlug="project-spine" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
