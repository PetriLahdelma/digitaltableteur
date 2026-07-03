import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { NavLink } from "./NavLink";

expect.extend(toHaveNoViolations);

const usePathnameMock = vi.hoisted(() => vi.fn<() => string | null>());

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

describe("NavLink", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("marks a prefix-matched route active via aria-current", () => {
    usePathnameMock.mockReturnValue("/work/case-study");
    render(<NavLink href="/work">Work</NavLink>);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark a different route active", () => {
    usePathnameMock.mockReturnValue("/about");
    render(<NavLink href="/work">Work</NavLink>);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("exact requires the full pathname to match", () => {
    usePathnameMock.mockReturnValue("/work/case-study");
    render(
      <NavLink href="/work" exact>
        Work
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("prefix matching would mark root active everywhere; exact prevents it", () => {
    usePathnameMock.mockReturnValue("/contact");
    render(
      <NavLink href="/" exact>
        Home
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("treats a null pathname (SSR/outside app router) as inactive", () => {
    usePathnameMock.mockReturnValue(null);
    render(<NavLink href="/work">Work</NavLink>);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("applies the active class pair by route state", () => {
    usePathnameMock.mockReturnValue("/work");
    render(
      <NavLink href="/work" activeClassName="is-active" inactiveClassName="is-idle">
        Work
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "Work" });
    expect(link.className).toContain("is-active");
    expect(link.className).not.toContain("is-idle");
  });

  it("has no axe violations inside a labelled nav", async () => {
    usePathnameMock.mockReturnValue("/work");
    const { container } = render(
      <nav aria-label="Primary">
        <NavLink href="/work">Work</NavLink>
        <NavLink href="/about">About</NavLink>
      </nav>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
