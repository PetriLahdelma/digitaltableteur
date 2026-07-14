/**
 * MobileDrawer focus trap (finding #6).
 *
 * Inerting #main-content did not contain Tab, so keyboard focus could walk out
 * of the open drawer to the header/footer controls behind it. These tests lock
 * in Tab/Shift+Tab containment and Escape-to-close.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("gsap", () => ({
  gsap: {
    context: (fn?: () => void) => {
      fn?.();
      return { revert: () => {} };
    },
    fromTo: () => {},
    set: () => {},
  },
}));

vi.mock("../../lib/translation", () => ({
  useTranslate: () => (key: string, fallback?: string) => fallback ?? key,
}));

vi.mock("../../lib/linkComponent", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("../../components/NavLink", () => ({
  NavLink: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { MobileDrawer } from "./MobileDrawer";

const navItems = [
  { href: "/work", label: "navWork", exact: false },
  { href: "/about", label: "navAbout", exact: false },
];

function renderDrawer(overrides: Record<string, unknown> = {}) {
  return render(
    <MobileDrawer
      isOpen
      onClose={vi.fn()}
      navItems={navItems}
      currentLang="en"
      onLanguageChange={vi.fn()}
      onThemeToggle={vi.fn()}
      theme="light"
      {...overrides}
    />,
  );
}

function panelFocusables() {
  const panel = screen.getByRole("dialog");
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    ),
  );
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe("MobileDrawer focus trap (#6)", () => {
  it("has multiple focusable controls inside the panel", () => {
    renderDrawer();
    expect(panelFocusables().length).toBeGreaterThan(2);
  });

  it("wraps Tab from the last control back to the first", () => {
    renderDrawer();
    const focusable = panelFocusables();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(first);
  });

  it("wraps Shift+Tab from the first control back to the last", () => {
    renderDrawer();
    const focusable = panelFocusables();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first.focus();
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("pulls focus back into the panel if it lands outside", () => {
    renderDrawer();
    const outside = document.createElement("button");
    outside.textContent = "outside";
    document.body.appendChild(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);

    fireEvent.keyDown(window, { key: "Tab" });
    const panel = screen.getByRole("dialog");
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    renderDrawer({ onClose });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
