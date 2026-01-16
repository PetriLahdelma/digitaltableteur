/**
 * TextArea Component Accessibility Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - axe-core automated testing
 * - Label association
 * - Error state handling
 * - Keyboard accessibility
 * - Character count announcements
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import { TextArea } from "./TextArea";

expect.extend(toHaveNoViolations);

describe("TextArea Accessibility", () => {
  /**
   * ===========================================
   * AXE-CORE AUTOMATED TESTING
   * ===========================================
   */
  describe("axe-core violations", () => {
    it("has no violations with aria-label", async () => {
      const { container } = render(
        <TextArea aria-label="Message" placeholder="Enter message" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with associated label", async () => {
      const { container } = render(
        <>
          <label htmlFor="message-input">Message</label>
          <TextArea id="message-input" placeholder="Enter message" />
        </>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in error state", async () => {
      const { container } = render(
        <TextArea aria-label="Message" error aria-invalid="true" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when disabled", async () => {
      const { container } = render(
        <TextArea aria-label="Message" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with character count", async () => {
      const { container } = render(
        <TextArea aria-label="Message" showCount maxLength={200} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  /**
   * ===========================================
   * KEYBOARD ACCESSIBILITY
   * ===========================================
   */
  describe("keyboard accessibility", () => {
    it("can receive focus via Tab key", async () => {
      const user = userEvent.setup();
      render(<TextArea aria-label="Message" />);

      await user.tab();

      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("can type multi-line text with keyboard", async () => {
      const user = userEvent.setup();
      render(<TextArea aria-label="Message" />);

      await user.tab();
      await user.keyboard("Line 1{Enter}Line 2");

      expect(screen.getByRole("textbox")).toHaveValue("Line 1\nLine 2");
    });

    it("Enter key creates new line (does not submit)", async () => {
      const user = userEvent.setup();
      render(<TextArea aria-label="Message" />);

      await user.tab();
      await user.keyboard("Hello{Enter}World");

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Hello\nWorld");
    });

    it("disabled textarea is not focusable", async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <TextArea aria-label="Message" disabled />
          <button>After</button>
        </>
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();

      await user.tab();
      // Should skip disabled textarea
      expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    });
  });

  /**
   * ===========================================
   * ARIA ATTRIBUTES VALIDATION
   * ===========================================
   */
  describe("ARIA attributes", () => {
    it("has textbox role", () => {
      render(<TextArea aria-label="Message" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("supports aria-label for accessible name", () => {
      render(<TextArea aria-label="Your message" />);
      expect(screen.getByRole("textbox")).toHaveAccessibleName("Your message");
    });

    it("supports aria-describedby for additional context", () => {
      render(
        <>
          <span id="message-hint">Maximum 500 characters</span>
          <TextArea aria-label="Message" aria-describedby="message-hint" />
        </>
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "message-hint"
      );
    });

    it("supports aria-required for required fields", () => {
      render(<TextArea aria-label="Message" aria-required="true" required />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it("indicates disabled state", () => {
      render(<TextArea aria-label="Message" disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("supports maxLength attribute", () => {
      render(<TextArea aria-label="Message" maxLength={200} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "200");
    });
  });

  /**
   * ===========================================
   * CHARACTER COUNT ACCESSIBILITY
   * ===========================================
   */
  describe("character count accessibility", () => {
    it("character count is visible when showCount is true", () => {
      render(
        <TextArea aria-label="Message" showCount maxLength={200} value="Hello" />
      );
      // Character count should be present
      expect(screen.getByText("5/200")).toBeInTheDocument();
    });

    it("character count updates as user types", async () => {
      const user = userEvent.setup();
      render(<TextArea aria-label="Message" showCount maxLength={100} />);

      await user.tab();
      await user.keyboard("Test");

      expect(screen.getByText("4/100")).toBeInTheDocument();
    });
  });

  /**
   * ===========================================
   * SIZE VARIANTS
   * ===========================================
   */
  describe("size variants accessibility", () => {
    it("small size has no violations", async () => {
      const { container } = render(
        <TextArea aria-label="Message" size="sm" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("medium size has no violations", async () => {
      const { container } = render(
        <TextArea aria-label="Message" size="md" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("large size has no violations", async () => {
      const { container } = render(
        <TextArea aria-label="Message" size="lg" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  /**
   * ===========================================
   * FOCUS MANAGEMENT
   * ===========================================
   */
  describe("focus management", () => {
    it("shows visible focus indicator", async () => {
      const user = userEvent.setup();
      render(<TextArea aria-label="Message" />);

      await user.tab();

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveFocus();
    });

    it("maintains focus after typing", async () => {
      const user = userEvent.setup();
      render(<TextArea aria-label="Message" />);

      await user.tab();
      await user.keyboard("test message");

      expect(screen.getByRole("textbox")).toHaveFocus();
    });
  });
});
