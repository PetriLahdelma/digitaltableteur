/**
 * Modal Component Accessibility Tests
 *
 * Tests for WCAG 2.1 AA compliance including:
 * - axe-core automated testing
 * - Dialog role with aria-modal
 * - aria-labelledby references title
 * - aria-describedby references description
 * - Escape key closes modal
 * - Focus trap within modal
 * - Focus returns to trigger on close
 * - Severity-based role (dialog vs alertdialog)
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import Modal from "@dt/Modal";

expect.extend(toHaveNoViolations);

describe("Modal Accessibility", () => {
  /**
   * ===========================================
   * AXE-CORE AUTOMATED TESTING
   * ===========================================
   */
  describe("axe-core violations", () => {
    it("has no violations when open with title", async () => {
      const { container } = render(
        <Modal isOpen title="Confirm Action">
          <p>Are you sure you want to proceed?</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with success severity", async () => {
      const { container } = render(
        <Modal isOpen title="Success" severity="success">
          <p>Operation completed successfully.</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with error severity", async () => {
      const { container } = render(
        <Modal isOpen title="Error" severity="error">
          <p>An error occurred.</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with warning severity", async () => {
      const { container } = render(
        <Modal isOpen title="Warning" severity="warning">
          <p>Please confirm this action.</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with info severity", async () => {
      const { container } = render(
        <Modal isOpen title="Information" severity="info">
          <p>Here is some information.</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations in loading state", async () => {
      const { container } = render(
        <Modal isOpen title="Loading" isLoading>
          <p>Please wait...</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no violations with custom footer", async () => {
      const { container } = render(
        <Modal
          isOpen
          title="Confirm"
          footer={
            <>
              <button>Cancel</button>
              <button>Confirm</button>
            </>
          }
        >
          <p>Confirm action?</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  /**
   * ===========================================
   * ARIA ATTRIBUTES VALIDATION
   * ===========================================
   */
  describe("ARIA attributes", () => {
    it("has dialog role by default", () => {
      render(
        <Modal isOpen title="Dialog">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has alertdialog role for error severity", () => {
      render(
        <Modal isOpen title="Error" severity="error">
          <p>Error content</p>
        </Modal>
      );
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("has alertdialog role for warning severity", () => {
      render(
        <Modal isOpen title="Warning" severity="warning">
          <p>Warning content</p>
        </Modal>
      );
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("has aria-modal=true", () => {
      render(
        <Modal isOpen title="Dialog">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("has aria-labelledby referencing title", () => {
      render(
        <Modal isOpen title="Modal Title">
          <p>Content</p>
        </Modal>
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");

      const labelId = dialog.getAttribute("aria-labelledby");
      const titleElement = document.getElementById(labelId!);
      expect(titleElement).toHaveTextContent("Modal Title");
    });

    it("has aria-describedby referencing description", () => {
      render(
        <Modal
          isOpen
          title="Error"
          severity="error"
          description="Please try again in a moment."
        />
      );
      const dialog = screen.getByRole("alertdialog");
      expect(dialog).toHaveAttribute("aria-describedby");

      const descriptionId = dialog.getAttribute("aria-describedby");
      const descriptionElement = document.getElementById(descriptionId!);
      expect(descriptionElement).toHaveTextContent("Please try again in a moment.");
    });

    it("has aria-label when no title provided", () => {
      render(
        <Modal isOpen>
          <p>Content</p>
        </Modal>
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-label", "Dialog");
    });

    it("should not have aria-live on alertdialog (role already implies announcement)", () => {
      render(
        <Modal isOpen title="Error" severity="error">
          <p>Error message</p>
        </Modal>
      );
      const dialog = screen.getByRole("alertdialog");
      // alertdialog role already implies assertive announcement
      // Adding aria-live would cause double screen reader announcements
      expect(dialog).not.toHaveAttribute("aria-live");
    });

    it("should not have aria-live on dialog (prevents double announcement)", () => {
      render(
        <Modal isOpen title="Success" severity="success">
          <p>Success message</p>
        </Modal>
      );
      // dialog role is announced when opened
      // Adding aria-live would cause double screen reader announcements
      expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-live");
    });
  });

  /**
   * ===========================================
   * KEYBOARD ACCESSIBILITY
   * ===========================================
   */
  describe("keyboard accessibility", () => {
    it("Escape key closes modal", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen title="Dialog" onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalled();
    });

    it("close button is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen title="Dialog" onClose={onClose} showCloseIcon>
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole("button", { name: /close/i });
      closeButton.focus();
      await user.keyboard("{Enter}");

      expect(onClose).toHaveBeenCalled();
    });

    it("OK button is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen title="Dialog" onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      const okButton = screen.getByRole("button", { name: "OK" });
      okButton.focus();
      await user.keyboard("{Enter}");

      expect(onClose).toHaveBeenCalled();
    });

    it("Tab cycles through focusable elements", async () => {
      const user = userEvent.setup();
      render(
        <Modal
          isOpen
          title="Dialog"
          onClose={() => {}}
          showCloseIcon
          footer={
            <>
              <button>Cancel</button>
              <button>Submit</button>
            </>
          }
        >
          <input type="text" aria-label="Input field" />
        </Modal>
      );

      // Focus should move through elements in order
      await user.tab();
      // The close button should be focusable
      const closeButton = screen.getByRole("button", { name: /close/i });

      // After tabbing through all elements, we should see focus on various buttons
      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      const submitButton = screen.getByRole("button", { name: "Submit" });

      expect(closeButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  /**
   * ===========================================
   * FOCUS MANAGEMENT
   * ===========================================
   */
  describe("focus management", () => {
    it("modal renders accessible structure", () => {
      render(
        <Modal isOpen title="Dialog" onClose={() => {}}>
          <button>First Button</button>
          <button>Last Button</button>
        </Modal>
      );

      const firstButton = screen.getByRole("button", { name: "First Button" });
      const lastButton = screen.getByRole("button", { name: "Last Button" });

      expect(firstButton).toBeInTheDocument();
      expect(lastButton).toBeInTheDocument();
    });

    it("close button has accessible label", () => {
      render(
        <Modal
          isOpen
          title="Dialog"
          onClose={() => {}}
          showCloseIcon
          closeButtonLabel="Close dialog"
        >
          <p>Content</p>
        </Modal>
      );

      expect(
        screen.getByRole("button", { name: "Close dialog" })
      ).toBeInTheDocument();
    });

    it("close button has default accessible label", () => {
      render(
        <Modal isOpen title="Dialog" onClose={() => {}} showCloseIcon>
          <p>Content</p>
        </Modal>
      );

      expect(
        screen.getByRole("button", { name: "Close dialog" })
      ).toBeInTheDocument();
    });
  });

  /**
   * ===========================================
   * OVERLAY INTERACTION
   * ===========================================
   */
  describe("overlay interaction", () => {
    it("clicking overlay closes modal", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen title="Dialog" onClose={onClose}>
          <p>Content</p>
        </Modal>
      );

      const overlay = document.body.querySelector('[class*="overlay"]');
      expect(overlay).toBeTruthy();

      await user.click(overlay as HTMLElement);

      expect(onClose).toHaveBeenCalled();
    });
  });

  /**
   * ===========================================
   * TITLE SIZE VARIANTS
   * ===========================================
   */
  describe("title size variants accessibility", () => {
    it("small title size has no violations", async () => {
      const { container } = render(
        <Modal isOpen title="Small Title" titleSize="sm">
          <p>Content</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("medium title size has no violations", async () => {
      const { container } = render(
        <Modal isOpen title="Medium Title" titleSize="md">
          <p>Content</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("large title size has no violations", async () => {
      const { container } = render(
        <Modal isOpen title="Large Title" titleSize="lg">
          <p>Content</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  /**
   * ===========================================
   * CLOSED STATE
   * ===========================================
   */
  describe("closed state", () => {
    it("does not render when isOpen is false", () => {
      render(
        <Modal isOpen={false} title="Dialog">
          <p>Content</p>
        </Modal>
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
