/**
 * Accessibility Test Template
 *
 * Copy this template when creating a11y tests for new components.
 * Replace "ComponentName" with the actual component name throughout.
 *
 * Test categories covered:
 * 1. axe-core automated testing
 * 2. Keyboard accessibility
 * 3. ARIA attributes validation
 * 4. Focus management
 * 5. Screen reader announcements
 *
 * Usage:
 *   cp Component.a11y.test.template.tsx ../YourComponent/YourComponent.a11y.test.tsx
 *   Then replace all instances of "ComponentName" with your component name.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Import your component
// import { ComponentName } from "./ComponentName";

/**
 * Mock component for template demonstration
 * Replace with actual component import
 */
const ComponentName: React.FC<{
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}> = ({ children, disabled, onClick, "aria-label": ariaLabel }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

describe("ComponentName Accessibility", () => {
  /**
   * ===========================================
   * 1. AXE-CORE AUTOMATED TESTING
   * ===========================================
   * Tests for WCAG violations using axe-core
   */
  describe("axe-core violations", () => {
    it("has no accessibility violations in default state", async () => {
      const { container } = render(
        <ComponentName>Default Content</ComponentName>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations when disabled", async () => {
      const { container } = render(
        <ComponentName disabled>Disabled Content</ComponentName>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // Add variant-specific tests as needed:
    // it("has no accessibility violations with variant X", async () => {
    //   const { container } = render(<ComponentName variant="X" />);
    //   const results = await axe(container);
    //   expect(results).toHaveNoViolations();
    // });
  });

  /**
   * ===========================================
   * 2. KEYBOARD ACCESSIBILITY
   * ===========================================
   * Tests for keyboard-only navigation and interaction
   */
  describe("keyboard accessibility", () => {
    it("can receive focus via Tab key", async () => {
      const user = userEvent.setup();
      render(<ComponentName>Focusable</ComponentName>);

      await user.tab();

      expect(screen.getByRole("button")).toHaveFocus();
    });

    it("can be activated with Enter key", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ComponentName onClick={onClick}>Click me</ComponentName>);

      await user.tab();
      await user.keyboard("{Enter}");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("can be activated with Space key", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ComponentName onClick={onClick}>Click me</ComponentName>);

      await user.tab();
      await user.keyboard(" ");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not respond to keyboard when disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <ComponentName onClick={onClick} disabled>
          Disabled
        </ComponentName>
      );

      await user.tab();
      await user.keyboard("{Enter}");

      expect(onClick).not.toHaveBeenCalled();
    });

    // For components with multiple focusable elements:
    // it("maintains logical focus order", async () => {
    //   const user = userEvent.setup();
    //   render(<ComponentWithMultipleElements />);
    //
    //   await user.tab();
    //   expect(screen.getByRole("element1")).toHaveFocus();
    //
    //   await user.tab();
    //   expect(screen.getByRole("element2")).toHaveFocus();
    // });
  });

  /**
   * ===========================================
   * 3. ARIA ATTRIBUTES VALIDATION
   * ===========================================
   * Tests for correct ARIA attributes and roles
   */
  describe("ARIA attributes", () => {
    it("has correct role", () => {
      render(<ComponentName>Content</ComponentName>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("supports aria-label for accessible name", () => {
      render(<ComponentName aria-label="Custom Label" />);
      expect(screen.getByRole("button")).toHaveAccessibleName("Custom Label");
    });

    it("has accessible name from content", () => {
      render(<ComponentName>Button Text</ComponentName>);
      expect(screen.getByRole("button")).toHaveAccessibleName("Button Text");
    });

    // For disabled state:
    // it("indicates disabled state accessibly", () => {
    //   render(<ComponentName disabled>Disabled</ComponentName>);
    //   expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
    //   // OR for native disabled:
    //   expect(screen.getByRole("button")).toBeDisabled();
    // });

    // For expanded/collapsed state:
    // it("indicates expanded state", () => {
    //   render(<ComponentName expanded />);
    //   expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    // });

    // For error states:
    // it("indicates error state accessibly", () => {
    //   render(<ComponentName error="Error message" />);
    //   expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    //   expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby");
    // });

    // For required fields:
    // it("indicates required state", () => {
    //   render(<ComponentName required />);
    //   expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
    // });
  });

  /**
   * ===========================================
   * 4. FOCUS MANAGEMENT
   * ===========================================
   * Tests for proper focus handling
   */
  describe("focus management", () => {
    it("shows visible focus indicator", async () => {
      const user = userEvent.setup();
      render(<ComponentName>Focusable</ComponentName>);

      await user.tab();

      const element = screen.getByRole("button");
      expect(element).toHaveFocus();
      // Note: Visual focus indicator testing is typically done in visual regression tests
    });

    it("does not trap focus when not needed", async () => {
      const user = userEvent.setup();
      render(
        <>
          <ComponentName>First</ComponentName>
          <ComponentName>Second</ComponentName>
        </>
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "First" })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
    });

    // For modal/dialog components with focus trap:
    // it("traps focus within modal", async () => {
    //   const user = userEvent.setup();
    //   render(<Modal open><button>First</button><button>Last</button></Modal>);
    //
    //   await user.tab();
    //   expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    //
    //   await user.tab();
    //   expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
    //
    //   await user.tab();
    //   expect(screen.getByRole("button", { name: "First" })).toHaveFocus(); // Cycles back
    // });

    // For components that return focus:
    // it("returns focus on close", async () => {
    //   const user = userEvent.setup();
    //   render(<TriggerWithModal />);
    //
    //   const trigger = screen.getByRole("button", { name: "Open" });
    //   await user.click(trigger);
    //
    //   await user.keyboard("{Escape}");
    //
    //   expect(trigger).toHaveFocus();
    // });
  });

  /**
   * ===========================================
   * 5. SCREEN READER ANNOUNCEMENTS
   * ===========================================
   * Tests for live regions and dynamic announcements
   */
  describe("screen reader announcements", () => {
    // For components with live regions:
    // it("announces status changes to screen readers", async () => {
    //   const { rerender } = render(<ComponentName status="idle" />);
    //
    //   rerender(<ComponentName status="loading" />);
    //
    //   const liveRegion = screen.getByRole("status");
    //   expect(liveRegion).toHaveTextContent("Loading...");
    // });

    // For components with assertive announcements:
    // it("announces errors assertively", () => {
    //   render(<ComponentName error="Required field" />);
    //   const alert = screen.getByRole("alert");
    //   expect(alert).toHaveTextContent("Required field");
    // });

    it("does not have unnecessary live regions", () => {
      render(<ComponentName>Content</ComponentName>);
      // Static content should not use live regions
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  /**
   * ===========================================
   * ADDITIONAL TESTS
   * ===========================================
   * Add component-specific accessibility tests below
   */

  // For form components:
  // describe("form accessibility", () => {
  //   it("associates label with input", () => {
  //     render(<TextInput label="Email" name="email" />);
  //     expect(screen.getByLabelText("Email")).toBeInTheDocument();
  //   });
  //
  //   it("associates error message with input", () => {
  //     render(<TextInput label="Email" error="Invalid email" />);
  //     const input = screen.getByLabelText("Email");
  //     const errorId = input.getAttribute("aria-describedby");
  //     expect(errorId).toBeTruthy();
  //     expect(document.getElementById(errorId!)).toHaveTextContent("Invalid email");
  //   });
  // });

  // For interactive widgets:
  // describe("widget patterns", () => {
  //   it("implements disclosure pattern correctly", async () => {
  //     const user = userEvent.setup();
  //     render(<Accordion />);
  //
  //     const trigger = screen.getByRole("button");
  //     expect(trigger).toHaveAttribute("aria-expanded", "false");
  //
  //     await user.click(trigger);
  //     expect(trigger).toHaveAttribute("aria-expanded", "true");
  //   });
  // });
});

/**
 * ===========================================
 * CHECKLIST FOR COMPONENT-SPECIFIC TESTS
 * ===========================================
 *
 * [ ] All interactive elements are keyboard accessible
 * [ ] Focus order is logical
 * [ ] Focus is visible at all times
 * [ ] Component has appropriate ARIA role
 * [ ] Component has accessible name
 * [ ] Required state is communicated (aria-required)
 * [ ] Invalid state is communicated (aria-invalid)
 * [ ] Disabled state is communicated (aria-disabled or disabled)
 * [ ] Dynamic changes are announced to screen readers
 * [ ] Color is not the only means of conveying information
 * [ ] Touch targets are at least 44x44px
 * [ ] Text has sufficient color contrast (4.5:1 for normal, 3:1 for large)
 */
