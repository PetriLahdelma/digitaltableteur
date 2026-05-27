import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import CookieConsent from "@dt/CookieConsent";
import { CookieConsentProvider } from "../../lib/cookieConsent";

// Minimal i18n mock: return keys as-is
const mockT = vi.fn((key: string) => key);
const mockI18n = { language: "en" };
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT, i18n: mockI18n }),
}));

// In-memory localStorage for consent persistence
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

  it("renders modal when no cookie consent is stored", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    expect(
      screen.getByRole("heading", { name: /cookieConsent.title/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/cookieConsent.description/i)).toBeInTheDocument();
  });

  it("does not render modal when cookie consent exists", async () => {
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
        screen.queryByRole("heading", { name: /cookieConsent.title/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("renders action buttons", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    expect(
      screen.getByRole("button", { name: /cookieConsent.customizeButton/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /cookieConsent.acceptEssentialButton/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cookieConsent.acceptAllButton/i }),
    ).toBeInTheDocument();
  });

  it("handles accept all button click", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /cookieConsent.acceptAllButton/i }),
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
        name: /cookieConsent.acceptEssentialButton/i,
      }),
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "dt-cookie-consent",
      expect.stringContaining("\"essential\":true"),
    );
  });

  it("renders cookie policy link", () => {
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    const policyLink = screen.getByRole("link", {
      name: /cookieConsent.policyLinkText/i,
    });
    expect(policyLink).toHaveAttribute("href", "/privacy-policy");
  });
});
