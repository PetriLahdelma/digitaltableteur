import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CookieConsentBanner from "./CookieConsentBanner";

vi.mock("../../lib/translation", () => {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "cookieConsent.bannerLabel": "Cookie preferences",
      "cookieConsent.bannerSummary": "We use cookies to improve your experience.",
      "cookieConsent.policyLinkText": "cookie policy",
      "cookieConsent.customizeButton": "Customize settings",
      "cookieConsent.acceptEssentialButton": "Only essential",
      "cookieConsent.acceptAllButton": "Accept all",
    };
    return translations[key] || key;
  };
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

vi.mock("../../lib/cookieConsent", () => ({
  useCookieConsent: () => ({
    acceptAll: vi.fn(),
    acceptEssentialOnly: vi.fn(),
  }),
}));

describe("CookieConsentBanner", () => {
  it("renders banner with correct region role", () => {
    render(<CookieConsentBanner onCustomize={vi.fn()} />);
    expect(
      screen.getByRole("region", { name: "Cookie preferences" }),
    ).toBeInTheDocument();
  });

  it("renders summary copy and policy link", () => {
    render(<CookieConsentBanner onCustomize={vi.fn()} />);
    expect(
      screen.getByText(/We use cookies to improve your experience/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "cookie policy" })).toHaveAttribute(
      "href",
      "/privacy-policy",
    );
  });

  it("renders customize button", () => {
    render(<CookieConsentBanner onCustomize={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Customize settings" }),
    ).toBeInTheDocument();
  });

  it("renders accept essential button", () => {
    render(<CookieConsentBanner onCustomize={vi.fn()} />);
    expect(screen.getByText("Only essential")).toBeInTheDocument();
  });

  it("renders accept all button", () => {
    render(<CookieConsentBanner onCustomize={vi.fn()} />);
    expect(screen.getByText("Accept all")).toBeInTheDocument();
  });

  it("calls onCustomize when customize button clicked", async () => {
    const user = userEvent.setup();
    const onCustomize = vi.fn();
    render(<CookieConsentBanner onCustomize={onCustomize} />);

    await user.click(screen.getByRole("button", { name: "Customize settings" }));
    expect(onCustomize).toHaveBeenCalledTimes(1);
  });
});
