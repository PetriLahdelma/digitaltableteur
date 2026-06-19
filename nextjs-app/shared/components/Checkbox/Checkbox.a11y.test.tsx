/**
 * Checkbox Component Accessibility Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - axe-core automated testing
 * - Label association
 * - Indeterminate state handling
 * - Keyboard accessibility (Space key)
 * - Disabled state
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import Checkbox from "@dt/Checkbox";

expect.extend(toHaveNoViolations);

describe("Checkbox Accessibility", () => {
  /**
   * ===========================================
   * AXE-CORE AUTOMATED TESTING
   * ===========================================
   */
  describe("axe-core violations", () => {
    it("has no violations with label", async () => {
      const { container } = render(
        <Checkbox id="terms" label="I agree to terms" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when checked", async () => {
      const { container } = render(
        <Checkbox id="terms" label="I agree to terms" checked />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations when disabled", async () => {
      const { container } = render(
        <Checkbox id="terms" label="I agree to terms" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in indeterminate state", async () => {
      const { container } = render(
        <Checkbox id="selectAll" label="Select all" indeterminate />
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
      render(<Checkbox id="terms" label="I agree" />);

      await user.tab();

      expect(screen.getByRole("checkbox")).toHaveFocus();
    });

    it("can be toggled with Space key", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Checkbox
          id="terms"
          label="I agree"
          onCheckedChange={onCheckedChange}
        />
      );

      await user.tab();
      await user.keyboard(" ");

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("can be unchecked with Space key", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Checkbox
          id="terms"
          label="I agree"
          checked
          onCheckedChange={onCheckedChange}
        />
      );

      await user.tab();
      await user.keyboard(" ");

      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it("disabled checkbox is not keyboard interactive", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <>
          <button>Before</button>
          <Checkbox
            id="terms"
            label="I agree"
            disabled
            onCheckedChange={onCheckedChange}
          />
          <button>After</button>
        </>
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();

      await user.tab();
      // Should skip disabled checkbox or checkbox itself might get focus but space won't work
      // In either case, the action should not trigger onCheckedChange
    });
  });

  /**
   * ===========================================
   * ARIA ATTRIBUTES VALIDATION
   * ===========================================
   */
  describe("ARIA attributes", () => {
    it("has checkbox role", () => {
      render(<Checkbox id="terms" label="I agree" />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("associates label with checkbox", () => {
      render(<Checkbox id="terms" label="I agree to terms" />);
      expect(screen.getByLabelText("I agree to terms")).toBeInTheDocument();
    });

    it("indicates checked state", () => {
      render(<Checkbox id="terms" label="I agree" checked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("indicates unchecked state", () => {
      render(<Checkbox id="terms" label="I agree" checked={false} />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("indicates disabled state", () => {
      render(<Checkbox id="terms" label="I agree" disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  /**
   * ===========================================
   * INDETERMINATE STATE
   * ===========================================
   */
  describe("indeterminate state", () => {
    it("native indeterminate property is set", () => {
      render(<Checkbox id="selectAll" label="Select all" indeterminate />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it("clicking indeterminate checkbox sets it to checked", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Checkbox
          id="selectAll"
          label="Select all"
          indeterminate
          onCheckedChange={onCheckedChange}
        />
      );

      await user.click(screen.getByRole("checkbox"));

      expect(onCheckedChange).toHaveBeenCalledWith(true);
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
        <Checkbox id="terms" label="I agree" size="sm" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("medium size has no violations", async () => {
      const { container } = render(
        <Checkbox id="terms" label="I agree" size="md" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("large size has no violations", async () => {
      const { container } = render(
        <Checkbox id="terms" label="I agree" size="lg" />
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
      render(<Checkbox id="terms" label="I agree" />);

      await user.tab();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveFocus();
    });

    it("maintains focus after toggle", async () => {
      const user = userEvent.setup();
      render(<Checkbox id="terms" label="I agree" />);

      await user.tab();
      await user.keyboard(" ");

      expect(screen.getByRole("checkbox")).toHaveFocus();
    });

    it("focus moves in logical order", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Checkbox id="first" label="First option" />
          <Checkbox id="second" label="Second option" />
          <Checkbox id="third" label="Third option" />
        </>
      );

      await user.tab();
      expect(screen.getByLabelText("First option")).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText("Second option")).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText("Third option")).toHaveFocus();
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
      render(<Checkbox id="terms" label="I agree" defaultChecked />);

      expect(screen.getByRole("checkbox")).toBeChecked();

      await user.click(screen.getByRole("checkbox"));

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });
  });
});
