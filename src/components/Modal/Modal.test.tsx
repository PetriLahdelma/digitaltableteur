import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Modal from "./Modal";

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

  it("does not render children when closed", () => {
    const { queryByText } = render(
      <Modal isOpen={false} title="Test Modal">
        <div>Modal Content</div>
      </Modal>,
    );
    expect(queryByText("Modal Content")).not.toBeInTheDocument();
  });
});
