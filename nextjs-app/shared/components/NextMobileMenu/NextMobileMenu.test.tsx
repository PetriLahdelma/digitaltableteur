import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextMobileMenu } from "./NextMobileMenu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock("../../hooks/usePersistentTheme", () => ({
  usePersistentTheme: () => ({
    theme: "light",
    cycleTheme: vi.fn(),
  }),
}));

vi.mock("@/providers/AnimationProvider", () => ({
  useAnimationContext: () => ({
    motionPreference: "reduced",
    isReady: true,
  }),
}));

const mockNavItems = [
  { href: "/", label: "Home", exact: true },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
];

const mockLanguages = [
  { code: "en", label: "English", ariaLabel: "English" },
  { code: "fi", label: "Suomi", ariaLabel: "Suomi" },
];

function renderOpenMenu(
  props: Partial<React.ComponentProps<typeof NextMobileMenu>> = {},
) {
  const { rerender, ...result } = render(
    <NextMobileMenu
      isOpen={false}
      navItems={mockNavItems}
      languages={mockLanguages}
      {...props}
    />,
  );
  rerender(
    <NextMobileMenu
      isOpen
      navItems={mockNavItems}
      languages={mockLanguages}
      {...props}
    />,
  );
  return result;
}

describe("NextMobileMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    renderOpenMenu();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <NextMobileMenu
        isOpen={false}
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    renderOpenMenu();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("renders close button", () => {
    renderOpenMenu();
    expect(
      screen.getByRole("button", { name: /close navigation/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderOpenMenu({ onClose });

    await user.click(
      screen.getByRole("button", { name: /close navigation/i }),
    );

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onNavigate when nav item clicked", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    renderOpenMenu({ onNavigate });

    await user.click(screen.getByRole("link", { name: "About" }));

    expect(onNavigate).toHaveBeenCalled();
  });

  it("renders language buttons", () => {
    renderOpenMenu();
    expect(
      screen.getByRole("button", { name: "English" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Suomi" })).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    renderOpenMenu();
    expect(
      screen.getByRole("button", { name: /cycle theme/i }),
    ).toBeInTheDocument();
  });

  it("uses custom id when provided", () => {
    const { container } = render(
      <NextMobileMenu
        isOpen
        id="custom-menu"
        navItems={mockNavItems}
        languages={mockLanguages}
      />,
    );
    expect(container.querySelector("#custom-menu")).toBeInTheDocument();
  });

  it("marks active link with aria-current", () => {
    renderOpenMenu();
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});
