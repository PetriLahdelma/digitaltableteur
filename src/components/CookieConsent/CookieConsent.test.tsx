import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import CookieConsent from "./CookieConsent";

// Mock react-i18next
const mockT = vi.fn((key: string) => {
  const translations: { [key: string]: string } = {
    cookieConsentTitle: "Cookie Consent",
    cookieConsentText: "We use cookies to enhance your experience.",
    cookieConsentReadOur: "Read our",
    cookiePolicyLink: "Cookie Policy",
    cookieConsentToLearnMore: "to learn more.",
    cookieConsentAiButton: "AI Use",
    cookieAcceptEssential: "Accept Essential Only",
    cookieAcceptAll: "Accept All",
  };
  return translations[key] || key;
});

const mockI18n = {
  language: "en",
};

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

// Mock window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
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
    render(<CookieConsent />);
    expect(screen.getByText("Cookie Consent")).toBeInTheDocument();
    expect(
      screen.getByText(/We use cookies to enhance your experience/),
    ).toBeInTheDocument();
  });

  it("does not render modal when cookie consent exists", () => {
    localStorageMock.getItem.mockReturnValue("accepted");
    render(<CookieConsent />);
    expect(screen.queryByText("Cookie Consent")).not.toBeInTheDocument();
  });

  it("renders all action buttons", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("button", { name: "AI Use" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Accept Essential Only" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Accept All" }),
    ).toBeInTheDocument();
  });

  it("handles accept all button click", () => {
    render(<CookieConsent />);
    const acceptAllButton = screen.getByRole("button", { name: "Accept All" });
    fireEvent.click(acceptAllButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "cookieConsent",
      "accepted",
    );
  });

  it("handles essential only button click", () => {
    render(<CookieConsent />);
    const essentialButton = screen.getByRole("button", {
      name: "Accept Essential Only",
    });
    fireEvent.click(essentialButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "cookieConsent",
      "essential-only",
    );
  });

  it("redirects to AI use page when AI button clicked", () => {
    render(<CookieConsent />);
    const aiButton = screen.getByRole("button", { name: "AI Use" });
    fireEvent.click(aiButton);

    expect(mockLocation.href).toBe("/ai-use");
  });

  it("renders cookie policy link with correct English href", () => {
    mockI18n.language = "en";
    render(<CookieConsent />);
    const policyLink = screen.getByRole("link", { name: "Cookie Policy" });
    expect(policyLink).toHaveAttribute("href", "/cookie-policy-full");
  });

  it("renders cookie policy link with correct Finnish href", () => {
    mockI18n.language = "fi";
    render(<CookieConsent />);
    const policyLink = screen.getByRole("link", { name: "Cookie Policy" });
    expect(policyLink).toHaveAttribute("href", "/cookie-policy-full-fi");
  });

  it("renders cookie policy link with correct Swedish href", () => {
    mockI18n.language = "sv";
    render(<CookieConsent />);
    const policyLink = screen.getByRole("link", { name: "Cookie Policy" });
    expect(policyLink).toHaveAttribute("href", "/cookie-policy-full-sv");
  });

  it("renders complete cookie consent text with policy link", () => {
    render(<CookieConsent />);
    expect(screen.getByText(/Read our/)).toBeInTheDocument();
    expect(screen.getByText(/to learn more/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Cookie Policy" }),
    ).toBeInTheDocument();
  });
});
