import React from "react";
import { describe, it, expect } from "vitest";
import { vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MobileMenu from "./MobileMenu";
import { ThemeProvider } from "@dt/ThemeProvider";
import i18n from "../../i18n";
import { I18nextProvider } from "react-i18next";

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => "/work/client"),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

// Helper render with providers
const renderWithProviders = (
  ui: React.ReactElement,
  route: string = "/work/client",
) => {
  mockUsePathname.mockReturnValue(route);
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{ui}</ThemeProvider>
    </I18nextProvider>,
  );
};

describe("MobileMenu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders localized labels and applies active state", () => {
    renderWithProviders(
      <MobileMenu isOpen onNavigate={() => {}} />,
      "/work/client",
    );

    // Ensure key localized labels appear (English defaults)
    expect(
      screen.getByRole("heading", { level: 2, name: /menu/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.t("navHome"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("navWork"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("navAbout"))).toBeInTheDocument();

    // Active state: work should be active given subpath /work/client
    expect(
      screen.getByRole("link", { name: i18n.t("navWork") }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("exact root route marks home active", () => {
    renderWithProviders(<MobileMenu isOpen onNavigate={() => {}} />, "/");
    const homeLink = screen.getByText(i18n.t("navHome")).closest("a");
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});
