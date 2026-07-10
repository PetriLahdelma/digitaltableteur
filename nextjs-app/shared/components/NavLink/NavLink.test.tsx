import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { NavLink } from "./NavLink";
import {
  NavigationProvider,
  type NavigationRuntime,
} from "../../lib/navigation";

expect.extend(toHaveNoViolations);

const renderWithPathname = (
  pathname: string | null,
  ui: React.ReactElement,
) => {
  const runtime: NavigationRuntime = {
    pathname,
    searchParams: new URLSearchParams(),
    push: () => undefined,
    replace: () => undefined,
  };
  return render(<NavigationProvider runtime={runtime}>{ui}</NavigationProvider>);
};

describe("NavLink", () => {
  it("marks a prefix-matched route active via aria-current", () => {
    renderWithPathname("/work/case-study", <NavLink href="/work">Work</NavLink>);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark a different route active", () => {
    renderWithPathname("/about", <NavLink href="/work">Work</NavLink>);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("exact requires the full pathname to match", () => {
    renderWithPathname(
      "/work/case-study",
      <NavLink href="/work" exact>
        Work
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("prefix matching would mark root active everywhere; exact prevents it", () => {
    renderWithPathname(
      "/contact",
      <NavLink href="/" exact>
        Home
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("treats a null pathname (SSR/outside app router) as inactive", () => {
    renderWithPathname(null, <NavLink href="/work">Work</NavLink>);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("applies the active class pair by route state", () => {
    renderWithPathname(
      "/work",
      <NavLink
        href="/work"
        activeClassName="is-active"
        inactiveClassName="is-idle"
      >
        Work
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "Work" });
    expect(link.className).toContain("is-active");
    expect(link.className).not.toContain("is-idle");
  });

  it("guards its color transition under prefers-reduced-motion", () => {
    renderWithPathname("/work", <NavLink href="/work">Work</NavLink>);
    // reducedMotion:true must be literally honest — the transition-colors
    // fade is neutralised via motion-reduce (matches Pagination / ValueCard).
    expect(screen.getByRole("link", { name: "Work" }).className).toContain(
      "motion-reduce:transition-none",
    );
  });

  it("has no axe violations inside a labelled nav", async () => {
    const { container } = renderWithPathname(
      "/work",
      <nav aria-label="Primary">
        <NavLink href="/work">Work</NavLink>
        <NavLink href="/about">About</NavLink>
      </nav>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
