import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { SocialShare } from "./SocialShare";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock i18next for testing
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        const translations: Record<string, string> = {
          shareOnInstagram: "Share on Instagram",
          shareOnTwitter: "Share on Twitter",
          shareOnFacebook: "Share on Facebook",
          shareOnReddit: "Share on Reddit",
          shareOnWhatsapp: "Share on WhatsApp",
          copyLinkToClipboard: "Copy to clipboard",
          linkCopied: "Link copied!",
        };
        return translations[key] || key;
      },
    }),
  };
});

describe("SocialShare", () => {
  const defaultProps = {
    url: "https://example.com/test",
    title: "Test Article",
  };

  const renderSocialShare = (props = defaultProps) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <SocialShare {...props} />
      </I18nextProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all social media links", () => {
    renderSocialShare();

    expect(screen.getByLabelText("Share on Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on Twitter")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on Reddit")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on WhatsApp")).toBeInTheDocument();
  });

  it("renders share button when native share is supported", () => {
    renderSocialShare();
    expect(screen.getByLabelText("share")).toBeInTheDocument();
  });

  test("renders copy link button when native share is not supported", () => {
    // Mock navigator to not have share property
    const originalNavigator = global.navigator;
    const mockNavigator = { ...originalNavigator } as any;
    delete mockNavigator.share;
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: mockNavigator,
    });

    renderSocialShare();
    
    // When navigator.share is unavailable, button should show copy functionality
    expect(screen.getByLabelText("Copy to clipboard")).toBeInTheDocument();

    // Restore original navigator
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: originalNavigator,
    });
  });

  it("generates correct Twitter share URL", () => {
    renderSocialShare();
    const twitterLink = screen.getByLabelText("Share on Twitter");
    const expectedUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      defaultProps.url,
    )}&text=${encodeURIComponent(defaultProps.title)}`;
    expect(twitterLink).toHaveAttribute("href", expectedUrl);
  });

  it("generates correct Facebook share URL", () => {
    renderSocialShare();
    const facebookLink = screen.getByLabelText("Share on Facebook");
    const expectedUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      defaultProps.url,
    )}`;
    expect(facebookLink).toHaveAttribute("href", expectedUrl);
  });

  it("calls native share API when share button is clicked", async () => {
    const mockShare = vi.spyOn(navigator, "share").mockResolvedValue();
    renderSocialShare();

    const shareButton = screen.getByLabelText("share");
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(mockShare).toHaveBeenCalledWith({
      title: defaultProps.title,
      url: defaultProps.url,
      text: defaultProps.title,
    });
  });

  it("falls back to copy when native share fails", async () => {
    const mockShare = vi.spyOn(navigator, "share").mockRejectedValue(new Error("Share failed"));
    const mockWriteText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderSocialShare();

    const shareButton = screen.getByLabelText("share");
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(mockShare).toHaveBeenCalled();
    expect(mockWriteText).toHaveBeenCalledWith(defaultProps.url);
  });

  test("copies URL to clipboard when copy button is clicked (no native share)", async () => {
    // Mock navigator to not have share property
    const originalNavigator = global.navigator;
    const mockNavigator = { ...originalNavigator } as any;
    delete mockNavigator.share;
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: mockNavigator,
    });
    
    const mockWriteText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();

    renderSocialShare();

    const copyButton = screen.getByLabelText("Copy to clipboard");
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(mockWriteText).toHaveBeenCalledWith("https://example.com/test");

    mockWriteText.mockRestore();
    
    // Restore original navigator
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: originalNavigator,
    });
  });

  it("shows toast after copying to clipboard via native share fallback", async () => {
    // Ensure navigator.share exists and is mockable for this test
    global.navigator.share = vi
      .fn()
      .mockRejectedValue(new Error("Share failed"));
    const mockWriteText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    
    renderSocialShare();

    const shareButton = screen.getByLabelText("share");
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(mockWriteText).toHaveBeenCalledWith("https://example.com/test");

    await waitFor(() => {
      expect(screen.getByText("Link copied!")).toBeInTheDocument();
    });
    
    mockWriteText.mockRestore();
  });

  it("all external links have correct attributes", () => {
    renderSocialShare();

    const externalLinks = screen.getAllByRole("link");
    externalLinks.forEach((link) => {
      if (link.getAttribute("href")?.startsWith("http")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
  });
});
