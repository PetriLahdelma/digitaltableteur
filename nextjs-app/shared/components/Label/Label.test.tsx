import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Label from "@dt/Label";

describe("Label", () => {
  it("renders children", () => {
    const { getByText } = render(<Label htmlFor="test-id">Label Text</Label>);
    expect(getByText("Label Text")).toBeInTheDocument();
  });

  it("applies htmlFor prop", () => {
    const { container } = render(<Label htmlFor="input-id">Label</Label>);
    expect(container.querySelector("label")).toHaveAttribute("for", "input-id");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Label htmlFor="test-id" className="custom-class">
        Label
      </Label>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  describe("required indicator accessibility", () => {
    it("hides asterisk from screen readers when required", () => {
      render(
        <Label htmlFor="test" required>
          Name
        </Label>,
      );
      const asterisk = screen.getByText("*");
      expect(asterisk).toHaveAttribute("aria-hidden", "true");
    });

    it("includes screen reader text for required fields", () => {
      render(
        <Label htmlFor="test" required>
          Name
        </Label>,
      );
      const srText = screen.getByText("(required)");
      expect(srText).toBeInTheDocument();
      // Check the text is visually hidden via sr-only class
      expect(srText.className).toMatch(/srOnly/);
    });

    it("does not show required indicator when not required", () => {
      render(<Label htmlFor="test">Name</Label>);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
      expect(screen.queryByText("(required)")).not.toBeInTheDocument();
    });
  });
});
