import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import * as ReactRouter from "react-router-dom";
import { render, screen } from "@testing-library/react";
import NavMenuList, { NavMenuItem } from "@dt/NavMenuList";

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
    vi.spyOn(ReactRouter, "useLocation").mockReturnValue({
      pathname,
      search: "",
      hash: "",
      state: null,
      key: "test",
    });
    return render(
      <MemoryRouter initialEntries={[pathname]}>
        <NavMenuList items={items} />
      </MemoryRouter>,
    );
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
