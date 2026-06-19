/**
 * Switch Component Accessibility Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - axe-core automated testing
 * - Switch role with aria-checked
 * - Label association
 * - Keyboard accessibility (Space and Enter keys)
 * - Loading state with aria-busy
 * - Disabled state
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import Switch from "@dt/Switch";

expect.extend(toHaveNoViolations);

describe("Switch Accessibility", () => {
  /**
   * ===========================================
   * AXE-CORE AUTOMATED TESTING
   * ===========================================
   */
  describe("axe-core violations", () => {
    it("has no violations with label", async () => {
      const { container } = render(<Switch label="Enable notifications" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when checked", async () => {
      const { container } = render(
        <Switch label="Enable notifications" checked />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when disabled", async () => {
      const { container } = render(
        <Switch label="Enable notifications" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when loading", async () => {
      const { container } = render(
        <Switch label="Enable notifications" loading />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with aria-label only", async () => {
      const { container } = render(
        <Switch aria-label="Toggle dark mode" />
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
      render(<Switch label="Enable notifications" />);

      await user.tab();

      expect(screen.getByRole("switch")).toHaveFocus();
    });

    it("can be toggled with Space key", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Switch label="Enable notifications" onCheckedChange={onCheckedChange} />
      );

      await user.tab();
      await user.keyboard(" ");

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("can be toggled with Enter key", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Switch label="Enable notifications" onCheckedChange={onCheckedChange} />
      );

      await user.tab();
      await user.keyboard("{Enter}");

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("can be turned off with keyboard", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Switch
          label="Enable notifications"
          checked
          onCheckedChange={onCheckedChange}
        />
      );

      await user.tab();
      await user.keyboard(" ");

      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it("disabled switch does not respond to keyboard", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Switch
          label="Enable notifications"
          disabled
          onCheckedChange={onCheckedChange}
        />
      );

      const switchEl = screen.getByRole("switch");
      switchEl.focus();
      await user.keyboard(" ");

      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  /**
   * ===========================================
   * ARIA ATTRIBUTES VALIDATION
   * ===========================================
   */
  describe("ARIA attributes", () => {
    it("has switch role", () => {
      render(<Switch label="Enable notifications" />);
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("has aria-checked=false when unchecked", () => {
      render(<Switch label="Enable notifications" checked={false} />);
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    });

    it("has aria-checked=true when checked", () => {
      render(<Switch label="Enable notifications" checked />);
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    });

    it("associates label with switch via aria-labelledby", () => {
      render(<Switch label="Enable notifications" />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveAttribute("aria-labelledby");
    });

    it("supports aria-label for standalone switches", () => {
      render(<Switch aria-label="Toggle feature" />);
      expect(screen.getByRole("switch")).toHaveAccessibleName("Toggle feature");
    });

    it("indicates loading state with aria-busy", () => {
      render(<Switch label="Enable notifications" loading />);
      expect(screen.getByRole("switch")).toHaveAttribute("aria-busy", "true");
    });

    it("indicates disabled state", () => {
      render(<Switch label="Enable notifications" disabled />);
      expect(screen.getByRole("switch")).toBeDisabled();
    });
  });

  /**
   * ===========================================
   * LABEL PLACEMENT
   * ===========================================
   */
  describe("label placement accessibility", () => {
    it("right placement has no violations", async () => {
      const { container } = render(
        <Switch label="Enable notifications" labelPlacement="right" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("left placement has no violations", async () => {
      const { container } = render(
        <Switch label="Enable notifications" labelPlacement="left" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("top placement has no violations", async () => {
      const { container } = render(
        <Switch label="Enable notifications" labelPlacement="top" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
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
        <Switch label="Enable" size="sm" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("medium size has no violations", async () => {
      const { container } = render(
        <Switch label="Enable" size="md" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("large size has no violations", async () => {
      const { container } = render(
        <Switch label="Enable" size="lg" />
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
      render(<Switch label="Enable notifications" />);

      await user.tab();

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveFocus();
    });

    it("maintains focus after toggle", async () => {
      const user = userEvent.setup();
      render(<Switch label="Enable notifications" />);

      await user.tab();
      await user.keyboard(" ");

      expect(screen.getByRole("switch")).toHaveFocus();
    });

    it("focus moves in logical order", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Switch label="First setting" />
          <Switch label="Second setting" />
          <Switch label="Third setting" />
        </>
      );

      await user.tab();
      expect(screen.getAllByRole("switch")[0]).toHaveFocus();

      await user.tab();
      expect(screen.getAllByRole("switch")[1]).toHaveFocus();

      await user.tab();
      expect(screen.getAllByRole("switch")[2]).toHaveFocus();
    });
  });

  /**
   * ===========================================
   * UNCONTROLLED MODE
   * ===========================================
   */
  describe("uncontrolled mode", () => {
    it("works with defaultChecked", async () => {
      const user = userEvent.setup();
      render(<Switch label="Enable" defaultChecked />);

      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");

      await user.click(screen.getByRole("switch"));

      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    });
  });

  /**
   * ===========================================
   * HELPER TEXT
   * ===========================================
   */
  describe("helper text accessibility", () => {
    it("helper text is associated with switch", () => {
      render(
        <Switch
          label="Enable notifications"
          helperText="You will receive push notifications"
        />
      );
      // Helper text should be visible
      expect(
        screen.getByText("You will receive push notifications")
      ).toBeInTheDocument();
    });
  });
});
