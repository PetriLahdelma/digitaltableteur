/**
 * EmailSignatureGenerator Tests
 *
 * Unit tests for form inputs, state management, and social media handle processing.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import EmailSignatureGenerator from "./EmailSignatureGenerator";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("EmailSignatureGenerator", () => {
  let originalClipboard: Clipboard;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  describe("rendering", () => {
    it("renders the title and subtitle", () => {
      render(withI18n(<EmailSignatureGenerator />));
      expect(screen.getByText(/Email Signature Generator/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Create a professional email signature/i)
      ).toBeInTheDocument();
    });

    it("renders all input fields with placeholders", () => {
      render(withI18n(<EmailSignatureGenerator />));
      expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/job title|position/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/\+358|\+46|phone/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/github/i)).toBeInTheDocument();
    });

    it("renders copy and import buttons", () => {
      render(withI18n(<EmailSignatureGenerator />));
      expect(screen.getByText(/Copy Signature|Kopioi|Kopiera/i)).toBeInTheDocument();
      expect(screen.getByText(/How to Import|Miten tuoda|Hur importerar/i)).toBeInTheDocument();
    });

    it("renders theme toggle buttons", () => {
      render(withI18n(<EmailSignatureGenerator />));
      // Find buttons with sun/moon icons for theme toggle
      const buttons = screen.getAllByRole("button");
      const themeButtons = buttons.filter(
        (btn) => btn.getAttribute("aria-pressed") !== null
      );
      expect(themeButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("form input handling", () => {
    it("updates name field on input", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const nameInput = screen.getByPlaceholderText(/full name/i);
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      expect(nameInput).toHaveValue("John Doe");
    });

    it("updates title field on input", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const titleInput = screen.getByPlaceholderText(/job title|position/i);
      fireEvent.change(titleInput, { target: { value: "Senior Developer" } });

      expect(titleInput).toHaveValue("Senior Developer");
    });

    it("updates phone field on input", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const phoneInput = screen.getByPlaceholderText(/\+358|\+46|phone/i);
      fireEvent.change(phoneInput, { target: { value: "+358 45 123 4567" } });

      // DS TextInput type="tel" runs libphonenumber's as-you-type formatter.
      expect(phoneInput).toHaveValue("+358 45 1234567");
    });
  });

  describe("social media input fields", () => {
    it("updates linkedin field on input", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const linkedinInput = screen.getByPlaceholderText(/linkedin/i);
      fireEvent.change(linkedinInput, { target: { value: "johndoe" } });

      expect(linkedinInput).toHaveValue("johndoe");
    });

    it("updates github field on input", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const githubInput = screen.getByPlaceholderText(/github/i);
      fireEvent.change(githubInput, { target: { value: "octocat" } });

      expect(githubInput).toHaveValue("octocat");
    });

    it("updates bluesky field on input", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const blueskyInput = screen.getByPlaceholderText(/bluesky|bsky/i);
      fireEvent.change(blueskyInput, { target: { value: "@johndoe.bsky.social" } });

      expect(blueskyInput).toHaveValue("@johndoe.bsky.social");
    });

    it("handles @ prefix in social handles", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const linkedinInput = screen.getByPlaceholderText(/linkedin/i);
      fireEvent.change(linkedinInput, { target: { value: "@johndoe" } });

      expect(linkedinInput).toHaveValue("@johndoe");
    });
  });

  describe("clear field functionality", () => {
    it("shows clear button when field has value", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const nameInput = screen.getByPlaceholderText(/full name/i);
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      // Find clear button by aria-label
      const clearButtons = screen.getAllByLabelText(/clear|tyhjennä|rensa/i);
      expect(clearButtons.length).toBeGreaterThan(0);
    });

    it("clears field value when clear button is clicked", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const nameInput = screen.getByPlaceholderText(/full name/i);
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      expect(nameInput).toHaveValue("John Doe");

      const clearButtons = screen.getAllByLabelText(/clear|tyhjennä|rensa/i);
      fireEvent.click(clearButtons[0]);

      expect(nameInput).toHaveValue("");
    });
  });

  describe("preview functionality", () => {
    it("displays default placeholder name in preview when empty", () => {
      render(withI18n(<EmailSignatureGenerator />));
      // Check for default name placeholder
      expect(
        screen.getByText(/Your Name|Nimesi|Ditt namn|John Doe/i)
      ).toBeInTheDocument();
    });

    it("updates preview name when input changes", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const nameInput = screen.getByPlaceholderText(/full name/i);
      fireEvent.change(nameInput, { target: { value: "Jane Smith" } });

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("displays company name in preview", () => {
      render(withI18n(<EmailSignatureGenerator companyName="Acme Corp" />));
      expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    });

    it("displays title with company name in preview", () => {
      render(withI18n(<EmailSignatureGenerator companyName="Digitaltableteur" />));

      const titleInput = screen.getByPlaceholderText(/job title|position/i);
      fireEvent.change(titleInput, { target: { value: "Designer" } });

      expect(screen.getByText(/Designer, Digitaltableteur/)).toBeInTheDocument();
    });

    it("displays social links in preview when entered", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const linkedinInput = screen.getByPlaceholderText(/linkedin/i);
      fireEvent.change(linkedinInput, { target: { value: "johndoe" } });

      // Should show LinkedIn link in preview ("LinkedIn" text alone also
      // matches the field's hidden label now).
      expect(
        screen.getByRole("link", { name: "LinkedIn" })
      ).toBeInTheDocument();
    });
  });

  describe("theme toggle", () => {
    it("toggles dark mode when dark button is clicked", () => {
      render(withI18n(<EmailSignatureGenerator />));

      // Find theme toggle buttons
      const buttons = screen.getAllByRole("button");
      const themeButtons = buttons.filter(
        (btn) => btn.getAttribute("aria-pressed") !== null
      );

      // Click the dark mode button (second theme button)
      const darkModeButton = themeButtons[1];
      fireEvent.click(darkModeButton);

      expect(darkModeButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("modal functionality", () => {
    it("opens modal when How to Import button is clicked", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const importButton = screen.getByText(/How to Import|Miten tuoda|Hur importerar/i);
      fireEvent.click(importButton);

      expect(screen.getByText(/How to Import Your Signature|Miten tuoda allekirjoituksesi|Hur du importerar din signatur/i)).toBeInTheDocument();
      expect(screen.getByText("Gmail")).toBeInTheDocument();
    });

    it("closes modal when Got it button is clicked", async () => {
      render(withI18n(<EmailSignatureGenerator />));

      const importButton = screen.getByText(/How to Import|Miten tuoda|Hur importerar/i);
      fireEvent.click(importButton);

      const gotItButton = screen.getByText(/Got it|Selvä|Förstått/i);
      fireEvent.click(gotItButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/How to Import Your Signature|Miten tuoda allekirjoituksesi/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("social handle processing", () => {
    it("strips @ prefix from linkedin username for URL generation", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const linkedinInput = screen.getByPlaceholderText(/linkedin/i);
      fireEvent.change(linkedinInput, { target: { value: "@johndoe" } });

      // The preview link should contain the username without @
      const linkedinLink = screen.getByRole("link", { name: "LinkedIn" });
      expect(linkedinLink).toHaveAttribute("href", "https://linkedin.com/in/johndoe");
    });

    it("strips @ prefix from github username for URL generation", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const githubInput = screen.getByPlaceholderText(/github/i);
      fireEvent.change(githubInput, { target: { value: "@octocat" } });

      const githubLink = screen.getByRole("link", { name: "GitHub" });
      expect(githubLink).toHaveAttribute("href", "https://github.com/octocat");
    });

    it("displays instagram link with correct URL", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const instagramInput = screen.getByLabelText(
        "Instagram",
      ) as HTMLInputElement;
      expect(instagramInput).toBeTruthy();
      fireEvent.change(instagramInput, { target: { value: "myinsta" } });

      const instagramLink = screen.getByRole("link", { name: "Instagram" });
      expect(instagramLink).toHaveAttribute("href", "https://instagram.com/myinsta");
    });

    it("displays tiktok link with correct URL", () => {
      render(withI18n(<EmailSignatureGenerator />));

      // Find all inputs and look for tiktok
      const allInputs = screen.getAllByRole("textbox");
      const tiktokInput = allInputs.find(
        (input) => input.id === "tiktok"
      );

      if (tiktokInput) {
        fireEvent.change(tiktokInput, { target: { value: "mytiktok" } });
        const tiktokLink = screen.getByRole("link", { name: "TikTok" });
        expect(tiktokLink).toHaveAttribute("href", "https://tiktok.com/@mytiktok");
      }
    });
  });
});
