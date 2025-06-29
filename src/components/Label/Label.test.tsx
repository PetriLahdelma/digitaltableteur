import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Label from "./Label";

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
});
