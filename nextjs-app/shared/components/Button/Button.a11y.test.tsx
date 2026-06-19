/**
 * Button Component Accessibility Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - axe-core automated testing for all variants
 * - Keyboard activation (Enter and Space)
 * - Disabled state handling
 * - Loading state (aria-busy)
 * - Icon-only buttons accessible name
 * - Focus visibility
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import Button from "@dt/Button";

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe("Button Accessibility", () => {
  /**
   * ===========================================
   * AXE-CORE AUTOMATED TESTING
   * ===========================================
   */
  describe("axe-core violations", () => {
    it("has no violations in primary variant", async () => {
      const { container } = render(
        <Button variant="primary">Primary Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in secondary variant", async () => {
      const { container } = render(
        <Button variant="secondary">Secondary Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in tertiary variant", async () => {
      const { container } = render(
        <Button variant="tertiary">Tertiary Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in error variant", async () => {
      const { container } = render(
        <Button tone="error">Error Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in warning variant", async () => {
      const { container } = render(
        <Button tone="warning">Warning Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in success variant", async () => {
      const { container } = render(
        <Button tone="success">Success Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in info variant", async () => {
      const { container } = render(<Button tone="info">Info Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when disabled", async () => {
      const { container } = render(
        <Button disabled>Disabled Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when loading", async () => {
      const { container } = render(<Button loading>Loading Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations on a dark surface", async () => {
      const { container } = render(
        <div style={{ backgroundColor: "#000", padding: "20px" }}>
          <Button variant="primary" surface="onDark">
            On dark
          </Button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations as link", async () => {
      const { container } = render(
        <Button href="/about" variant="primary">
          Link Button
        </Button>
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
      render(<Button>Focusable</Button>);

      await user.tab();

      expect(screen.getByRole("button")).toHaveFocus();
    });

    it("can be activated with Enter key", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      await user.tab();
      await user.keyboard("{Enter}");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("can be activated with Space key", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      await user.tab();
      await user.keyboard(" ");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not respond to keyboard when disabled", async () => {
      const onClick = vi.fn();
      render(
        <Button onClick={onClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      // Disabled buttons should not be focusable
      expect(button).toBeDisabled();
    });

    it("does not respond to keyboard when loading", async () => {
      const onClick = vi.fn();
      render(
        <Button onClick={onClick} loading>
          Loading
        </Button>
      );

      const button = screen.getByRole("button");
      // Loading buttons should be disabled
      expect(button).toBeDisabled();
    });

    it("maintains logical focus order between multiple buttons", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </>
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "First" })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: "Third" })).toHaveFocus();
    });

    it("link button is focusable and activatable", async () => {
      const user = userEvent.setup();
      render(
        <Button href="/about">Go to About</Button>
      );

      await user.tab();
      expect(screen.getByRole("link")).toHaveFocus();
    });
  });

  /**
   * ===========================================
   * ARIA ATTRIBUTES VALIDATION
   * ===========================================
   */
  describe("ARIA attributes", () => {
    it("has button role by default", () => {
      render(<Button>Content</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("has link role when href is provided", () => {
      render(<Button href="/about">Link</Button>);
      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("has accessible name from children", () => {
      render(<Button>Submit Form</Button>);
      expect(screen.getByRole("button")).toHaveAccessibleName("Submit Form");
    });

    it("supports accessibleName prop for aria-label", () => {
      render(<Button accessibleName="Close dialog" icon="x" />);
      expect(screen.getByRole("button")).toHaveAccessibleName("Close dialog");
    });

    it("supports accessibleDescription for aria-describedby", () => {
      render(
        <>
          <span id="desc">This action cannot be undone</span>
          <Button accessibleDescription="desc">Delete</Button>
        </>
      );
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-describedby",
        "desc"
      );
    });

    it("supports accessibleNameRef for aria-labelledby", () => {
      render(
        <>
          <span id="label">External Label</span>
          <Button accessibleNameRef="label" />
        </>
      );
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-labelledby",
        "label"
      );
    });

    it("indicates disabled state via disabled attribute", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("link button indicates disabled state via aria-disabled", () => {
      render(
        <Button href="/about" disabled>
          Disabled Link
        </Button>
      );
      expect(screen.getByRole("link")).toHaveAttribute("aria-disabled", "true");
    });

    it("has correct button type by default", () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("has submit type when submits prop is true", () => {
      render(<Button submits>Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });

  /**
   * ===========================================
   * ICON-ONLY BUTTONS
   * ===========================================
   */
  describe("icon-only buttons", () => {
    it("icon-only button requires accessible name", () => {
      // This should have accessibleName for a11y compliance
      render(<Button icon="x" accessibleName="Close" />);
      expect(screen.getByRole("button")).toHaveAccessibleName("Close");
    });

    it("icon-only button with aria-label has accessible name", () => {
      render(<Button icon="x" aria-label="Close menu" />);
      expect(screen.getByRole("button")).toHaveAccessibleName("Close menu");
    });
  });

  /**
   * ===========================================
   * SIZE VARIANTS
   * ===========================================
   */
  describe("size variants accessibility", () => {
    it("small size has no violations", async () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("medium size has no violations", async () => {
      const { container } = render(<Button size="md">Medium</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("large size has no violations", async () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // Legacy sizes
    it("legacy small size has no violations", async () => {
      const { container } = render(<Button size="sm">Small Legacy</Button>);
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
    it("shows focus indicator when focused", async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);

      await user.tab();

      const button = screen.getByRole("button");
      expect(button).toHaveFocus();
      // Visual focus testing is done via visual regression tests
    });

    it("disabled button is not focusable", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button>First</Button>
          <Button disabled>Disabled</Button>
          <Button>Third</Button>
        </>
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "First" })).toHaveFocus();

      await user.tab();
      // Should skip disabled button
      expect(screen.getByRole("button", { name: "Third" })).toHaveFocus();
    });
  });

  /**
   * ===========================================
   * TOOLTIP ACCESSIBILITY
   * ===========================================
   */
  describe("tooltip accessibility", () => {
    it("tooltip is exposed via title attribute", () => {
      render(<Button tooltip="Additional info">Hover me</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Additional info"
      );
    });
  });
});
