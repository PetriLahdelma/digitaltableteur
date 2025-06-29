import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Text from "./Text";

describe("Text", () => {
  it("renders children", () => {
    const { getByText } = render(<Text>Text Content</Text>);
    expect(getByText("Text Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Text className="custom-class">Text</Text>);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders as different tags", () => {
    const { container } = render(<Text as="span">Span Text</Text>);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});
