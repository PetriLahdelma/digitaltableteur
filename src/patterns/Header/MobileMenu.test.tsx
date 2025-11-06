import React from "react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import MobileMenu from "./MobileMenu";
import { ThemeProvider } from "@dt/ThemeProvider";
import i18n from "../../i18n";
import { I18nextProvider } from "react-i18next";

// Helper render with providers
const renderWithProviders = (
  ui: React.ReactElement,
  route: string = "/work/client",
) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[route]}>
        <ThemeProvider>{ui}</ThemeProvider>
      </MemoryRouter>
    </I18nextProvider>,
  );
};

describe("MobileMenu", () => {
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
    const workLink = screen.getByText(i18n.t("navWork"));
    expect(workLink.getAttribute("aria-current")).toBe("page");
  });

  it("exact root route marks home active", () => {
    renderWithProviders(<MobileMenu isOpen onNavigate={() => {}} />, "/");
    const homeLink = screen.getByText(i18n.t("navHome"));
    expect(homeLink.getAttribute("aria-current")).toBe("page");
  });
});
