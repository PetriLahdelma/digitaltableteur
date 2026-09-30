import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CookieConsentBanner from "./CookieConsentBanner";

vi.mock("../../lib/translation", () => {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "cookieConsent.bannerLabel": "Cookie preferences",
      "cookieConsent.bannerSummary":
        "We use cookies to improve your experience.",
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

    await user.click(
      screen.getByRole("button", { name: "Customize settings" }),
    );
    expect(onCustomize).toHaveBeenCalledTimes(1);
  });

  it("reserves measured document space without double-counting existing padding", () => {
    const offsetHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "offsetHeight",
    );
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get: () => 220,
    });
    document.body.style.paddingBlockEnd = "12px";

    const { unmount } = render(<CookieConsentBanner onCustomize={vi.fn()} />);

    expect(document.body.style.getPropertyValue("--cookie-banner-height")).toBe(
      "220px",
    );
    expect(
      Number.parseFloat(getComputedStyle(document.body).paddingBlockEnd),
    ).toBe(232);

    unmount();
    expect(document.body.style.paddingBlockEnd).toBe("12px");
    document.body.style.removeProperty("padding-block-end");
    if (offsetHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetHeight",
        offsetHeight,
      );
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
    }
  });

  it("scrolls an underlying focused control clear when the banner overlaps it", () => {
    const outside = document.createElement("button");
    outside.textContent = "Underlying action";
    outside.scrollIntoView = vi.fn();
    document.body.appendChild(outside);

    render(<CookieConsentBanner onCustomize={vi.fn()} />);
    const banner = screen.getByRole("region", { name: "Cookie preferences" });
    vi.spyOn(banner, "getBoundingClientRect").mockReturnValue({
      top: 620,
      bottom: 844,
      left: 0,
      right: 390,
      width: 390,
      height: 224,
      x: 0,
      y: 620,
      toJSON: () => ({}),
    });
    vi.spyOn(outside, "getBoundingClientRect").mockReturnValue({
      top: 759,
      bottom: 813,
      left: 20,
      right: 180,
      width: 160,
      height: 54,
      x: 20,
      y: 759,
      toJSON: () => ({}),
    });

    outside.focus();

    expect(outside.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "center",
      inline: "nearest",
    });
  });
});
