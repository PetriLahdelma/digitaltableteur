import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { NextHeader } from "./NextHeader";

const { mockUsePathname, mockCycleTheme, mockUsePersistentTheme } = vi.hoisted(
  () => {
    const mockCycleTheme = vi.fn(() => "dark");
    const mockUsePathname = vi.fn(() => "/");
    const mockUsePersistentTheme = vi.fn(() => ({
      theme: "light",
      cycleTheme: mockCycleTheme,
    }));
    return { mockUsePathname, mockCycleTheme, mockUsePersistentTheme };
  },
);

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("../../hooks/usePersistentTheme", () => ({
  usePersistentTheme: mockUsePersistentTheme,
}));

vi.mock("@/providers/ToastProvider", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

function renderHeader() {
  return render(
    <I18nextProvider i18n={i18n}>
      <NextHeader />
    </I18nextProvider>,
  );
}

describe("NextHeader", () => {
  beforeEach(() => {
    mockCycleTheme.mockClear();
    mockUsePathname.mockReturnValue("/");
    mockUsePersistentTheme.mockReturnValue({
      theme: "light",
      cycleTheme: mockCycleTheme,
    });
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
    window.dispatchEvent(new Event("resize"));
  });

  it("renders main navigation links", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders logo link to home", () => {
    renderHeader();
    const logo = screen.getByRole("link", { name: /Digitaltableteur logo/i });
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders theme toggle", () => {
    renderHeader();
    expect(
      screen.getByRole("button", { name: /Toggle dark mode/i }),
    ).toBeInTheDocument();
  });

  it("cycles theme when theme button is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /Toggle dark mode/i }));
    expect(mockCycleTheme).toHaveBeenCalledTimes(1);
  });

  it("renders language switcher buttons", () => {
    renderHeader();
    expect(
      screen.getByRole("button", { name: /Switch to English/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Switch to Suomi/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Switch to Svenska/i }),
    ).toBeInTheDocument();
  });

  it("highlights active navigation item", () => {
    mockUsePathname.mockReturnValue("/work");
    renderHeader();
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens mobile menu from mobile menu button", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });
    window.dispatchEvent(new Event("resize"));

    renderHeader();
    const openButton = screen.getByRole("button", { name: /Open navigation/i });
    expect(openButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(openButton);
    expect(openButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
