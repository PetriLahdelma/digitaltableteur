/**
 * TextInput Component Accessibility Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - axe-core automated testing
 * - Label association
 * - Error state handling with aria-invalid
 * - Keyboard accessibility
 * - Focus management
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { TextInput } from "./TextInput";

expect.extend(toHaveNoViolations);

describe("TextInput Accessibility", () => {
  /**
   * ===========================================
   * AXE-CORE AUTOMATED TESTING
   * ===========================================
   */
  describe("axe-core violations", () => {
    it("has no violations with aria-label", async () => {
      const { container } = render(
        <TextInput aria-label="Email address" placeholder="Enter email" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with associated label", async () => {
      const { container } = render(
        <>
          <label htmlFor="email-input">Email</label>
          <TextInput id="email-input" placeholder="Enter email" />
        </>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in error state", async () => {
      const { container } = render(
        <TextInput aria-label="Email" error aria-invalid="true" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when disabled", async () => {
      const { container } = render(
        <TextInput aria-label="Email" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with start icon", async () => {
      const { container } = render(
        <TextInput
          aria-label="Search"
          startIcon={<span aria-hidden="true">🔍</span>}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with clearable feature", async () => {
      const { container } = render(
        <TextInput aria-label="Search" clearable value="test" />
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
      render(<TextInput aria-label="Email" />);

      await user.tab();

      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("can type text with keyboard", async () => {
      const user = userEvent.setup();
      render(<TextInput aria-label="Email" />);

      await user.tab();
      await user.keyboard("hello@example.com");

      expect(screen.getByRole("textbox")).toHaveValue("hello@example.com");
    });

    it("clear button is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <TextInput
          aria-label="Search"
          clearable
          value="test"
          onClear={onClear}
        />
      );

      // Tab to input, then to clear button
      await user.tab();
      await user.tab();

      const clearButton = screen.getByRole("button", { name: /clear/i });
      expect(clearButton).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onClear).toHaveBeenCalled();
    });

    it("disabled input is not focusable", async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <TextInput aria-label="Email" disabled />
          <button>After</button>
        </>
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();

      await user.tab();
      // Should skip disabled input
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
      render(<TextInput aria-label="Email" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("supports aria-label for accessible name", () => {
      render(<TextInput aria-label="Email address" />);
      expect(screen.getByRole("textbox")).toHaveAccessibleName("Email address");
    });

    it("supports aria-describedby for additional context", () => {
      render(
        <>
          <span id="email-hint">We will never share your email</span>
          <TextInput aria-label="Email" aria-describedby="email-hint" />
        </>
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "email-hint"
      );
    });

    it("supports aria-required for required fields", () => {
      render(<TextInput aria-label="Email" aria-required="true" required />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it("supports placeholder text", () => {
      render(<TextInput aria-label="Email" placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });

    it("indicates disabled state", () => {
      render(<TextInput aria-label="Email" disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
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
        <TextInput aria-label="Email" size="sm" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("medium size has no violations", async () => {
      const { container } = render(
        <TextInput aria-label="Email" size="md" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("large size has no violations", async () => {
      const { container } = render(
        <TextInput aria-label="Email" size="lg" />
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
      render(<TextInput aria-label="Email" />);

      await user.tab();

      const input = screen.getByRole("textbox");
      expect(input).toHaveFocus();
      // Visual focus testing is done via visual regression tests
    });

    it("maintains focus after typing", async () => {
      const user = userEvent.setup();
      render(<TextInput aria-label="Email" />);

      await user.tab();
      await user.keyboard("test");

      expect(screen.getByRole("textbox")).toHaveFocus();
    });
  });
});
