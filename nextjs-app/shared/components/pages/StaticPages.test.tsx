import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils/render";
import { CookiePolicyPage } from "@dt-pages/CookiePolicy/CookiePolicyPage";
import { CookiePolicyFullEnPage } from "@dt-pages/CookiePolicy/CookiePolicyFullEnPage";
import { CookiePolicyFullFiPage } from "@dt-pages/CookiePolicy/CookiePolicyFullFiPage";
import { CookiePolicyFullSvPage } from "@dt-pages/CookiePolicy/CookiePolicyFullSvPage";
import { AiUsagePage } from "@dt-pages/AiUsagePage/AiUsagePage";
import { AboutPage } from "@dt-pages/AboutPage/AboutPage";
import { HomePage } from "@dt-pages/Home/HomePage";
import { ImprintPage } from "@dt-pages/ImprintPage/ImprintPage";

describe("Static content pages", () => {
  it("renders cookie policy variants", () => {
    renderWithProviders(<CookiePolicyPage />);
    expect(screen.getByText(/Cookie policy/i)).toBeInTheDocument();

    renderWithProviders(<CookiePolicyFullEnPage />);
    renderWithProviders(<CookiePolicyFullFiPage />);
    renderWithProviders(<CookiePolicyFullSvPage />);
    expect(screen.getAllByText(/Privacy Policy|Tietosuojakäytäntö|Sekretesspolicy/i).length).toBeGreaterThan(0);
  });

  it("renders AI usage page heading", () => {
    renderWithProviders(<AiUsagePage />);
    expect(
      screen.getByRole("heading", {
        name: /AI use & transparency statement/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders imprint page", () => {
    renderWithProviders(<ImprintPage />);
    expect(screen.getByText(/Imprint/i)).toBeInTheDocument();
    expect(screen.getByText(/2264455-2/)).toBeInTheDocument();
  });

  it("renders about page", () => {
    renderWithProviders(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: /Strategy to scale/i }),
    ).toBeInTheDocument();
  });

  it("renders home page hero", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
