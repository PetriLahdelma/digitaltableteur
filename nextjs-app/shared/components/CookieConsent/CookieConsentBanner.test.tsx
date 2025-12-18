import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CookieConsentBanner from "./CookieConsentBanner";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "cookieConsent.bannerLabel": "Cookie Consent Banner",
        "cookieConsent.expandBanner": "Expand Banner",
        "cookieConsent.acceptEssentialButton": "Accept Essential",
        "cookieConsent.acceptAllButton": "Accept All",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("../../lib/cookieConsent", () => ({
  useCookieConsent: () => ({
    acceptAll: vi.fn(),
    acceptEssentialOnly: vi.fn(),
  }),
}));

describe("CookieConsentBanner", () => {
  it("renders banner with correct region role", () => {
    render(<CookieConsentBanner onExpand={vi.fn()} />);
    expect(
      screen.getByRole("region", { name: "Cookie Consent Banner" }),
    ).toBeInTheDocument();
  });

  it("renders expand button", () => {
    render(<CookieConsentBanner onExpand={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Expand Banner" }),
    ).toBeInTheDocument();
  });

  it("renders accept essential button", () => {
    render(<CookieConsentBanner onExpand={vi.fn()} />);
    expect(screen.getByText("Accept Essential")).toBeInTheDocument();
  });

  it("renders accept all button", () => {
    render(<CookieConsentBanner onExpand={vi.fn()} />);
    expect(screen.getByText("Accept All")).toBeInTheDocument();
  });

  it("calls onExpand when expand button clicked", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    render(<CookieConsentBanner onExpand={onExpand} />);

    await user.click(screen.getByRole("button", { name: "Expand Banner" }));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("has proper accessible name on expand button", () => {
    render(<CookieConsentBanner onExpand={vi.fn()} />);
    const expandButton = screen.getByRole("button", { name: "Expand Banner" });
    expect(expandButton).toHaveAttribute("aria-label", "Expand Banner");
  });
});
