import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NavMenuList, { NavMenuItem } from "@dt/NavMenuList";
import {
  NavigationProvider,
  type NavigationRuntime,
} from "@digitaltableteur/react";

const items: NavMenuItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
];

describe("NavMenuList", () => {
  const renderNav = (pathname: string) => {
    const runtime: NavigationRuntime = {
      pathname,
      searchParams: new URLSearchParams(),
      push: () => undefined,
      replace: () => undefined,
    };
    return render(
      <NavigationProvider runtime={runtime}>
        <NavMenuList items={items} />
      </NavigationProvider>,
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
