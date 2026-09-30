/**
 * MobileDrawer focus trap (finding #6).
 *
 * Inerting #main-content did not contain Tab, so keyboard focus could walk out
 * of the open drawer to the header/footer controls behind it. These tests lock
 * in Tab/Shift+Tab containment and Escape-to-close.
 */

import React, { useState } from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
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
    panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
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

    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
  });

  it("wraps Shift+Tab from the first control back to the last", () => {
    renderDrawer();
    const focusable = panelFocusables();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first.focus();
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("pulls focus back into the panel if it lands outside", () => {
    renderDrawer();
    const outside = document.createElement("button");
    outside.textContent = "outside";
    document.body.appendChild(outside);
    outside.focus();
    const panel = screen.getByRole("dialog");
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    renderDrawer({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the close control fixed while navigation and footer controls scroll", () => {
    renderDrawer();
    const panel = screen.getByRole("dialog");
    const closeButton = screen.getByRole("button", { name: /close/i });
    const scrollRegion = panel.querySelector(
      "[data-mobile-drawer-scroll-region]",
    );

    expect(panel.className).toContain("max-h-dvh");
    expect(scrollRegion).toHaveClass("min-h-0", "overflow-y-auto");
    expect(scrollRegion).not.toContainElement(closeButton);
  });

  it("exposes the currently selected language", () => {
    renderDrawer({ currentLang: "fi" });

    expect(screen.getByRole("button", { name: /^FI/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /^EN/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("closes and releases modal isolation when the desktop breakpoint matches", () => {
    let desktopListener: ((event: MediaQueryListEvent) => void) | undefined;
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn((query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((_type, listener) => {
            if (query === "(min-width: 1024px)") {
              desktopListener = listener as (
                event: MediaQueryListEvent,
              ) => void;
            }
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
      ),
    });

    function ResponsiveDrawer() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <main data-background>Page content</main>
          <MobileDrawer
            isOpen={open}
            onClose={() => setOpen(false)}
            navItems={navItems}
            currentLang="en"
            onLanguageChange={vi.fn()}
            onThemeToggle={vi.fn()}
            theme="light"
          />
        </>
      );
    }

    render(<ResponsiveDrawer />);
    const background = document.querySelector("[data-background]");
    expect(background).toHaveAttribute("inert");

    act(() => desktopListener?.({ matches: true } as MediaQueryListEvent));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(background).not.toHaveAttribute("inert");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  // Regression guard. Button sizes its glyphs from --btn-icon-size, but the
  // rule lives in @layer components, so a Tailwind size-* utility on the icon
  // (emitted into @layer utilities) silently wins by layer order. The drawer
  // shipped size-5 on the close X and size-4 on the theme toggle, pinning them
  // at 20px and 16px inside a 44px touch target long after the platinum uplift
  // raised the token to 24px. jsdom computes no layer cascade, so assert on the
  // class instead: the icons must not carry their own size utility.
  describe("icon sizing is left to the design system", () => {
    it.each([
      ["Close menu", /close/i],
      ["Theme toggle", /theme/i],
    ])("%s icon has no size-* utility class", (_name, labelPattern) => {
      renderDrawer();
      const button = screen
        .getAllByRole("button")
        .find((b) => labelPattern.test(b.getAttribute("aria-label") ?? ""));
      expect(button).toBeDefined();

      const svg = button!.querySelector("svg");
      expect(svg).not.toBeNull();

      const classes = (svg!.getAttribute("class") ?? "").split(/\s+/);
      const sizeUtilities = classes.filter((c) => /^(size|[wh])-\d/.test(c));
      expect(sizeUtilities).toEqual([]);
    });
  });
});
