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

  it("renders copy link button", () => {
    renderSocialShare();
    expect(screen.getByLabelText("Copy to clipboard")).toBeInTheDocument();
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

  it("copies URL to clipboard when copy button is clicked", async () => {
    const mockWriteText = vi.spyOn(navigator.clipboard, "writeText");
    renderSocialShare();

    const copyButton = screen.getByLabelText("Copy to clipboard");
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(mockWriteText).toHaveBeenCalledWith(defaultProps.url);
  });

  it("shows toast after copying to clipboard", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderSocialShare();

    const copyButton = screen.getByLabelText("Copy to clipboard");
    await act(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Link copied!")).toBeInTheDocument();
    });
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
