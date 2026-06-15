import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import NavMenuList, { NavMenuItem } from "@dt/NavMenuList";

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => "/"),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

const items: NavMenuItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
];

describe("NavMenuList", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderNav = (pathname: string) => {
    mockUsePathname.mockReturnValue(pathname);
    return render(<NavMenuList items={items} />);
  };

  it("renders all items", () => {
    renderNav("/");
    items.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("applies active class for exact match", () => {
    renderNav("/");
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });

  it("applies active class for prefix match", () => {
    renderNav("/work/client");
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
