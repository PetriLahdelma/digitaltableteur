import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import CookieConsent from "@dt/CookieConsent";
import { CookieConsentProvider } from "../../lib/cookieConsent";

const mockT = vi.fn((key: string) => key);
const mockI18n = { language: "en" };
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT, i18n: mockI18n }),
}));

const consentStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => consentStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    consentStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete consentStore[key];
  }),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

const sampleConsent = JSON.stringify({
  version: 1,
  timestamp: "2026-01-01T00:00:00.000Z",
  language: "en",
  categories: {
    essential: true,
    analytics: true,
    marketing: true,
    functional: true,
  },
});

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(consentStore)) {
      delete consentStore[key];
    }
    mockI18n.language = "en";
  });

  it("renders compact banner when no cookie consent is stored", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    expect(
      screen.getByRole("region", { name: /cookie preferences/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cookies improve your experience/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /cookie preferences/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render banner when cookie consent exists", async () => {
    consentStore["dt-cookie-consent"] = sampleConsent;
    localStorageMock.getItem.mockImplementation(
      (key: string) => consentStore[key] ?? null,
    );
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /cookie preferences/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("renders action buttons on the compact banner", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    expect(
      screen.getByRole("button", { name: /customize settings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /only essential/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /accept all/i }),
    ).toBeInTheDocument();
  });

  it("opens settings modal from customize button", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /customize settings/i }),
    );
    expect(
      screen.getByRole("heading", { name: /cookie consent/i }),
    ).toBeInTheDocument();
  });

  it("handles accept all button click", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /accept all/i }),
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "dt-cookie-consent",
      expect.stringContaining("\"analytics\":true"),
    );
  });

  it("handles essential only button click", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /only essential/i,
      }),
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "dt-cookie-consent",
      expect.stringContaining("\"essential\":true"),
    );
  });

  it("renders cookie policy link on the banner", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    const policyLink = screen.getByRole("link", {
      name: /cookie policy/i,
    });
    expect(policyLink).toHaveAttribute("href", "/privacy-policy");
  });
});
