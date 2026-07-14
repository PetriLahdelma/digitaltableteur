/**
 * SiteFooter — C4: cookie preferences can be reopened from the footer.
 *
 * The footer exposes a "Cookie preferences" trigger that reopens the consent
 * banner via the provider's public API (openBanner), and only appears when a
 * CookieConsentProvider is present. It must never touch stored consent.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const openBanner = vi.fn();
let consentValue: { openBanner: () => void } | null = { openBanner };

vi.mock("../../lib/translation", () => ({
  useTranslate: () => (key: string) =>
    key === "footerCookiePreferences" ? "Cookie preferences" : key,
  useLocalization: () => ({
    language: "en",
    resolvedLanguage: "en",
    translate: (key: string) => key,
  }),
}));

vi.mock("../../lib/cookieConsent", () => ({
  useCookieConsentOptional: () => consentValue,
}));

import { SiteFooter } from "./SiteFooter";

beforeEach(() => {
  openBanner.mockClear();
  consentValue = { openBanner };
});

describe("SiteFooter — C4 cookie preferences reopen", () => {
  it("renders a Cookie preferences trigger when a consent provider is present", () => {
    render(<SiteFooter />);
    expect(
      screen.getByRole("button", { name: /cookie preferences/i }),
    ).toBeInTheDocument();
  });

  it("reopens the consent banner on click without clearing stored consent", () => {
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");
    const clear = vi.spyOn(Storage.prototype, "clear");

    render(<SiteFooter />);
    fireEvent.click(
      screen.getByRole("button", { name: /cookie preferences/i }),
    );

    expect(openBanner).toHaveBeenCalledTimes(1);
    expect(removeItem).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();

    removeItem.mockRestore();
    clear.mockRestore();
  });

  it("omits the trigger when no consent provider is present", () => {
    consentValue = null;
    render(<SiteFooter />);
    expect(
      screen.queryByRole("button", { name: /cookie preferences/i }),
    ).not.toBeInTheDocument();
  });
});
