import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Header from "./Header";

// Stub ResizeObserver to avoid crashes in jsdom
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const mockChangeLanguage = vi.fn();
const mockT = vi.fn(
  (key: string, maybeOptionsOrFallback?: unknown, maybeFallback?: unknown) => {
    if (typeof maybeOptionsOrFallback === "string")
      return maybeOptionsOrFallback;
    if (typeof maybeFallback === "string") return maybeFallback;
    return key;
  },
);
const mockCycleTheme = vi.fn(() => "dark");
const mockOnThemeCycle = vi.fn();
const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => "/work"),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: "en", changeLanguage: mockChangeLanguage },
  }),
}));

vi.mock("../../hooks/usePersistentTheme", () => ({
  usePersistentTheme: () => ({
    theme: "light",
    cycleTheme: mockCycleTheme,
  }),
}));

describe("Header", () => {
  const testNavItems = [
    { to: "/", label: "Home", exact: true },
    { to: "/work", label: "Work" },
    { to: "/about", label: "About" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).ResizeObserver = ResizeObserverStub;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderHeader = (initialPath = "/work") => {
    mockUsePathname.mockReturnValue(initialPath);
    return render(
      <Header navItems={testNavItems} onThemeCycle={mockOnThemeCycle} />,
    );
  };

  it("renders nav items and marks active link", () => {
    renderHeader("/work");
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("changes language when language button clicked", () => {
    renderHeader("/about");
    const fiButton = screen.getByRole("button", { name: /langfi/i });
    fireEvent.click(fiButton);
    expect(mockChangeLanguage).toHaveBeenCalledWith("fi");
  });

  it("cycles theme and announces change", () => {
    renderHeader("/about");
    const toggle = screen.getByRole("button", { name: /toggleDarkMode/i });
    fireEvent.click(toggle);
    expect(mockCycleTheme).toHaveBeenCalledTimes(1);
    expect(mockOnThemeCycle).toHaveBeenCalledWith("dark");
    expect(
      screen.getByText(/headerThemeAnnouncement/i, { exact: false }),
    ).toBeInTheDocument();
  });

  it("opens mobile menu when toggle clicked", () => {
    renderHeader("/about");
    const mobileToggle = screen.getByRole("button", {
      name: /open navigation/i,
    });
    expect(mobileToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute("aria-expanded", "true");
  });
});
