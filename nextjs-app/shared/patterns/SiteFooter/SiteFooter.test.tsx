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
import styles from "./SiteFooter.module.css";

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

/**
 * Stacked, the four columns ran 1328px against an 844px viewport. Visit,
 * Billing and Explore are dropped below tablet because each is reachable
 * elsewhere on a phone; Legal is the only one with no other home, so it must
 * stay visible at every width. jsdom applies no Tailwind CSS, so assert on the
 * responsive classes rather than computed visibility.
 */
describe("SiteFooter — mobile column inventory", () => {
  function columnFor(headingKey: string, container: HTMLElement) {
    const heading = [...container.querySelectorAll("p")].find(
      (p) => p.textContent === headingKey,
    );
    expect(heading, `no column heading for ${headingKey}`).toBeDefined();
    return heading!.parentElement as HTMLElement;
  }

  it.each(["footerAddressTitle", "footerBillingTitle", "footerExploreTitle"])(
    "%s column carries the below-tablet hide",
    (headingKey) => {
      const { container } = render(<SiteFooter />);
      const column = columnFor(headingKey, container);
      expect(styles.mobileHidden).toBeTruthy();
      expect(column.className).toContain(styles.mobileHidden);
    },
  );

  it("keeps the Legal column visible at every width", () => {
    const { container } = render(<SiteFooter />);
    const column = columnFor("footerLegalTitle", container);
    expect(column.className).not.toContain(styles.mobileHidden);
  });

  it("still renders the dropped columns' content for tablet and desktop", () => {
    render(<SiteFooter />);
    // Hidden by CSS, not removed: the markup must survive for wider viewports.
    expect(screen.getByText("footerBillingEInvoiceLabel")).toBeInTheDocument();
    expect(screen.getByText("navPricing")).toBeInTheDocument();
    expect(screen.getByText("mail@digitaltableteur.com")).toBeInTheDocument();
  });
});
