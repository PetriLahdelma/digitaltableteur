import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Modal from "@dt/Modal";

describe("Modal", () => {
  it("renders children when open", () => {
    render(
      <Modal isOpen title="Test Modal">
        <div>Modal Content</div>
      </Modal>,
    );
    // Search in document.body for modal content (handles portals/overlays)
    expect(
      within(document.body).getByText("Modal Content"),
    ).toBeInTheDocument();
  });

  it("keeps the close button named when closeButtonLabel is an empty string", () => {
    render(
      <Modal
        isOpen
        title="Test Modal"
        showCloseIcon
        closeButtonLabel=""
        onClose={() => {}}
      >
        <div>Modal Content</div>
      </Modal>,
    );
    expect(
      within(document.body).getByRole("button", { name: "Close dialog" }),
    ).toBeInTheDocument();
  });

  it("renders the menu slot in the header", () => {
    render(
      <Modal isOpen title="Test Modal" menu={<button type="button">Options</button>}>
        <div>Modal Content</div>
      </Modal>,
    );
    expect(
      within(document.body).getByRole("button", { name: "Options" }),
    ).toBeInTheDocument();
  });

  it("does not render children when closed", () => {
    const { queryByText } = render(
      <Modal isOpen={false} title="Test Modal">
        <div>Modal Content</div>
      </Modal>,
    );
    expect(queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("should not have aria-live on dialog element (prevents double announcement)", () => {
    render(
      <Modal isOpen title="Test">
        <p>Content</p>
      </Modal>,
    );
    const dialog = within(document.body).getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-live");
  });

  it("should not have aria-live on alertdialog element", () => {
    render(
      <Modal isOpen title="Test" severity="error">
        <p>Content</p>
      </Modal>,
    );
    const dialog = within(document.body).getByRole("alertdialog");
    expect(dialog).not.toHaveAttribute("aria-live");
  });

  it("uses iconSize for semantic severity icons (default lg)", () => {
    render(
      <Modal isOpen title="Error" severity="error">
        <p>Content</p>
      </Modal>,
    );
    const iconRoot = document.body.querySelector('[data-semantic-icon="error"]');
    const svg = iconRoot?.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("accepts iconSize override for semantic severity icons", () => {
    render(
      <Modal isOpen title="Error" severity="error" iconSize="xl">
        <p>Content</p>
      </Modal>,
    );
    const iconRoot = document.body.querySelector('[data-semantic-icon="error"]');
    const svg = iconRoot?.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });

  describe("animation prop", () => {
    it("applies the entrance animation data attribute when animation is set", () => {
      render(
        <Modal isOpen animation="scale" title="Animated" onClose={() => {}}>
          content
        </Modal>,
      );
      expect(screen.getByRole("dialog")).toHaveAttribute("data-animation", "scale");
    });

    it("defaults to no animation attribute", () => {
      render(
        <Modal isOpen title="Plain" onClose={() => {}}>
          content
        </Modal>,
      );
      expect(screen.getByRole("dialog")).not.toHaveAttribute("data-animation");
    });
  });
});
