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
import { SocialShare } from "@dt/SocialShare";
import i18n from "../../i18n";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
  share: vi.fn().mockResolvedValue(undefined),
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

  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("en");
  });

  it("renders all social media links", () => {
    renderSocialShare();

    expect(
      screen.getByRole("link", { name: "Share on LinkedIn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Share on Instagram" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Share on Twitter" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Share on Facebook" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Share on Reddit" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Share on WhatsApp" }),
    ).toBeInTheDocument();
  });

  it("renders share button when native share is supported", () => {
    renderSocialShare();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("falls back to the localized heading when heading is an empty string", () => {
    // `heading || t("shareHeading")` (not `??`) — an empty-string heading, incl.
    // the "" the Storybook controls args-enhancer seeds, must not drop the
    // section's accessible name. With `??` the label was "" and the <section>
    // lost its region role entirely; with `||` it falls back to t("shareHeading").
    renderSocialShare({ ...defaultProps, heading: "", variant: "article" });
    const region = screen.getByRole("region");
    expect(region.getAttribute("aria-label")).toBeTruthy();
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
    expect(
      screen.getByRole("button", { name: /copy to clipboard/i }),
    ).toBeInTheDocument();

    // Restore original navigator
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: originalNavigator,
    });
  });

  it("generates correct Twitter share URL", () => {
    renderSocialShare();
    const twitterLink = screen.getByRole("link", { name: "Share on Twitter" });
    const expectedUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      defaultProps.url,
    )}&text=${encodeURIComponent(defaultProps.title)}`;
    expect(twitterLink).toHaveAttribute("href", expectedUrl);
  });

  it("generates correct Facebook share URL", () => {
    renderSocialShare();
    const facebookLink = screen.getByRole("link", { name: "Share on Facebook" });
    const expectedUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      defaultProps.url,
    )}`;
    expect(facebookLink).toHaveAttribute("href", expectedUrl);
  });

  it("calls native share API when share button is clicked", async () => {
    // Ensure navigator.share exists for this test
    if (!navigator.share) {
      Object.defineProperty(navigator, "share", {
        writable: true,
        value: vi.fn().mockResolvedValue(undefined),
      });
    }
    const mockShare = vi.spyOn(navigator, "share").mockResolvedValue(undefined);
    renderSocialShare();

    const shareButton = screen.getByRole("button", { name: /share/i });
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
    // Ensure navigator.share exists for this test
    if (!navigator.share) {
      Object.defineProperty(navigator, "share", {
        writable: true,
        value: vi.fn().mockRejectedValue(new Error("Share failed")),
      });
    }
    const mockShare = vi
      .spyOn(navigator, "share")
      .mockRejectedValue(new Error("Share failed"));
    const mockWriteText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    renderSocialShare();

    const shareButton = screen.getByRole("button", {
      name: /^share$/i,
    });
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

    const copyButton = screen.getByRole("button", {
      name: /copy to clipboard/i,
    });
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

  it("falls back to document.execCommand when clipboard API is unavailable", async () => {
    const originalNavigator = global.navigator;
    const mockNavigator = { ...originalNavigator } as any;
    delete mockNavigator.share;
    delete mockNavigator.clipboard;
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: mockNavigator,
    });

    const docWithExec = document as Document & {
      execCommand?: (commandId: string) => boolean;
    };
    const originalExecCommand = docWithExec.execCommand;
    const execMock = vi.fn().mockReturnValue(true);
    docWithExec.execCommand = execMock;

    renderSocialShare();

    const copyButton = screen.getByRole("button", {
      name: /copy to clipboard/i,
    });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(execMock).toHaveBeenCalledWith("copy");

    if (originalExecCommand) {
      docWithExec.execCommand = originalExecCommand;
    } else {
      Reflect.deleteProperty(docWithExec, "execCommand");
    }

    Object.defineProperty(global, "navigator", {
      writable: true,
      value: originalNavigator,
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
      share: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("shows toast after copying to clipboard via native share fallback", async () => {
    // Ensure navigator.share exists and is mockable for this test
    if (!navigator.share) {
      Object.defineProperty(navigator, "share", {
        writable: true,
        value: vi.fn().mockRejectedValue(new Error("Share failed")),
      });
    }
    global.navigator.share = vi
      .fn()
      .mockRejectedValue(new Error("Share failed"));

    // Ensure navigator.clipboard exists
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
    }
    const mockWriteText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    renderSocialShare();

    const shareButton = screen.getByRole("button", { name: /share/i });
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
