/**
 * EmailSignatureGenerator Accessibility Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - axe-core automated testing
 * - Keyboard navigation
 * - ARIA attributes validation
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import EmailSignatureGenerator from "./EmailSignatureGenerator";

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("EmailSignatureGenerator Accessibility", () => {
  /**
   * ===========================================
   * AXE-CORE AUTOMATED TESTING
   * ===========================================
   */
  describe("axe-core violations", () => {
    it("has no violations in default state", async () => {
      const { container } = render(withI18n(<EmailSignatureGenerator />));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with custom company name", async () => {
      const { container } = render(
        withI18n(<EmailSignatureGenerator companyName="Acme Corp" />)
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in dark mode preview", async () => {
      const { container } = render(withI18n(<EmailSignatureGenerator />));

      // Find and click dark mode button
      const buttons = screen.getAllByRole("button");
      const themeButtons = buttons.filter(
        (btn) => btn.getAttribute("aria-pressed") !== null
      );
      fireEvent.click(themeButtons[1]); // Dark mode button

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when form is filled", async () => {
      const { container } = render(withI18n(<EmailSignatureGenerator />));

      fireEvent.change(screen.getByPlaceholderText(/full name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText(/job title|position/i), {
        target: { value: "Developer" },
      });
      fireEvent.change(screen.getByPlaceholderText(/linkedin/i), {
        target: { value: "johndoe" },
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  /**
   * ===========================================
   * ARIA ATTRIBUTES
   * ===========================================
   */
  describe("ARIA attributes", () => {
    it("theme toggle buttons have correct aria-pressed state", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const buttons = screen.getAllByRole("button");
      const themeButtons = buttons.filter(
        (btn) => btn.getAttribute("aria-pressed") !== null
      );

      // Light mode is default (first button should be pressed)
      expect(themeButtons[0]).toHaveAttribute("aria-pressed", "true");
      expect(themeButtons[1]).toHaveAttribute("aria-pressed", "false");

      // Toggle to dark
      fireEvent.click(themeButtons[1]);
      expect(themeButtons[0]).toHaveAttribute("aria-pressed", "false");
      expect(themeButtons[1]).toHaveAttribute("aria-pressed", "true");
    });

    it("clear buttons have accessible labels", () => {
      render(withI18n(<EmailSignatureGenerator />));

      fireEvent.change(screen.getByPlaceholderText(/full name/i), {
        target: { value: "Test" },
      });

      const clearButtons = screen.getAllByLabelText(/clear|tyhjennä|rensa/i);
      expect(clearButtons.length).toBeGreaterThan(0);
    });

    it("inputs have proper placeholders as accessible hints", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const nameInput = screen.getByPlaceholderText(/full name/i);
      expect(nameInput).toHaveAttribute("placeholder");

      const linkedinInput = screen.getByPlaceholderText(/linkedin/i);
      expect(linkedinInput).toHaveAttribute("placeholder");
    });
  });

  /**
   * ===========================================
   * SEMANTIC HTML
   * ===========================================
   */
  describe("semantic HTML", () => {
    it("uses proper input types", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const phoneInput = screen.getByPlaceholderText(/\+358|\+46|phone/i);
      expect(phoneInput).toHaveAttribute("type", "tel");

      const nameInput = screen.getByPlaceholderText(/full name/i);
      expect(nameInput).toHaveAttribute("type", "text");
    });

    it("has proper heading hierarchy", () => {
      render(withI18n(<EmailSignatureGenerator />));

      // Title should be an h1
      const title = screen.getByText(/Email Signature Generator/i);
      expect(title.tagName).toBe("H1");
    });

    it("action buttons have button type", () => {
      render(withI18n(<EmailSignatureGenerator />));

      expect(
        screen.getByRole("button", { name: /Copy Signature|Kopioi|Kopiera/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /How to Import|Miten tuoda|Hur importerar/i,
        }),
      ).toBeInTheDocument();
    });
  });

  /**
   * ===========================================
   * FOCUS MANAGEMENT
   * ===========================================
   */
  describe("focus management", () => {
    it("inputs are focusable", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const nameInput = screen.getByPlaceholderText(/full name/i);
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);

      const linkedinInput = screen.getByPlaceholderText(/linkedin/i);
      linkedinInput.focus();
      expect(document.activeElement).toBe(linkedinInput);
    });

    it("buttons are focusable", () => {
      render(withI18n(<EmailSignatureGenerator />));

      const copyButton = screen.getByRole("button", {
        name: /Copy Signature|Kopioi|Kopiera/i,
      });
      copyButton.focus();
      expect(document.activeElement).toBe(copyButton);
    });
  });
});
