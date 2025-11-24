import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import i18n from "../../i18n";
import { CookiePolicyPage } from "./CookiePolicy/CookiePolicyPage";
import { CookiePolicyFullEnPage } from "./CookiePolicy/CookiePolicyFullEnPage";
import { CookiePolicyFullFiPage } from "./CookiePolicy/CookiePolicyFullFiPage";
import { CookiePolicyFullSvPage } from "./CookiePolicy/CookiePolicyFullSvPage";
import { AiUsagePage } from "./AiUsagePage/AiUsagePage";
import { AboutPage } from "./AboutPage/AboutPage";
import { HomePage } from "./Home/HomePage";

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

  it("renders about and home pages", () => {
    render(withI18n(<AboutPage />));
    expect(screen.getByText(/small consultancy/i)).toBeInTheDocument();

    render(withI18n(<HomePage />));
    expect(
      screen.getByText(/We design the future of intelligent products/i),
    ).toBeInTheDocument();
  });
});
