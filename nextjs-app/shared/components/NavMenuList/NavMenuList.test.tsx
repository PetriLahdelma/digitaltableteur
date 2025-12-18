import React from "react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import NavMenuList, { NavMenuItem } from "@dt/NavMenuList";

const items: NavMenuItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
];

describe("NavMenuList", () => {
  it("renders all items", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavMenuList items={items} />
      </MemoryRouter>,
    );
    items.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("applies active class for exact match", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavMenuList items={items} />
      </MemoryRouter>,
    );
    const homeLink = screen.getByText("Home");
    expect(homeLink.getAttribute("aria-current")).toBe("page");
  });

  it("applies active class for prefix match", () => {
    render(
      <MemoryRouter initialEntries={["/work/client"]}>
        <NavMenuList items={items} />
      </MemoryRouter>,
    );
    const workLink = screen.getByText("Work");
    expect(workLink.getAttribute("aria-current")).toBe("page");
  });
});
