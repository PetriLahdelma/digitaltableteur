import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import CookieConsent from "@dt/CookieConsent";
import { CookieConsentProvider } from "../../lib/cookieConsent";

// Minimal i18n mock: return keys as-is
const mockT = vi.fn((key: string) => key);
const mockI18n = { language: "en" };
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT, i18n: mockI18n }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockI18n.language = "en";
  });

  afterEach(() => {
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
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

  it("does not render modal when cookie consent exists", () => {
    localStorageMock.getItem.mockReturnValue("accepted");
    render(
      <CookieConsentProvider autoShow>
        <CookieConsent />
      </CookieConsentProvider>,
    );
    expect(
      screen.queryByRole("heading", { name: /cookieConsent.title/i }),
    ).not.toBeInTheDocument();
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
      "cookieConsent",
      "accepted",
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
      "cookieConsent",
      "essential-only",
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
