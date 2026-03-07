import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import i18n from "../../i18n";
import { CookiePolicyPage } from "@dt/CookiePolicy/CookiePolicyPage";
import { CookiePolicyFullEnPage } from "@dt/CookiePolicy/CookiePolicyFullEnPage";
import { CookiePolicyFullFiPage } from "@dt/CookiePolicy/CookiePolicyFullFiPage";
import { CookiePolicyFullSvPage } from "@dt/CookiePolicy/CookiePolicyFullSvPage";
import { AiUsagePage } from "@dt/AiUsagePage/AiUsagePage";
import { AboutPage } from "@dt/AboutPage/AboutPage";
import { HomePage } from "@dt/Home/HomePage";
import { ImprintPage } from "@dt-pages/ImprintPage";

const withI18n = (ui: React.ReactElement) => (
  <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
);

describe("Static content pages", () => {
  it("renders cookie policy variants", () => {
    render(withI18n(<CookiePolicyPage />));
    expect(screen.getByText(/Cookie Policy/i)).toBeInTheDocument();

    render(withI18n(<CookiePolicyFullEnPage />));
    render(withI18n(<CookiePolicyFullFiPage />));
    render(withI18n(<CookiePolicyFullSvPage />));
    expect(screen.getAllByText(/Cookie Policy/i).length).toBeGreaterThan(0);
  });

  it("renders AI usage page and triggers back handler", () => {
    const onBack = vi.fn();
    render(withI18n(<AiUsagePage onBack={onBack} />));
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it("renders imprint page", () => {
    render(withI18n(<ImprintPage />));
    expect(screen.getByText(/Imprint/i)).toBeInTheDocument();
    expect(screen.getByText(/2264455-2/)).toBeInTheDocument();
  });

  it("renders about and home pages", () => {
    render(withI18n(<AboutPage />));
    expect(screen.getByText(/creative consultancy/i)).toBeInTheDocument();

    render(withI18n(<HomePage />));
    // HomePage now uses randomized titles from homeHeroGradientTitleOptions
    // Just verify that some hero content is present
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
