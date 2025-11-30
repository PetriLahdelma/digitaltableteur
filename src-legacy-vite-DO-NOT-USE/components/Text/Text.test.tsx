import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Text from "./Text";
import styles from "./Text.module.css";

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

  it("applies lineHeight class when provided", () => {
    const { container } = render(<Text lineHeight="tight">Text</Text>);
    expect(container.firstChild).toHaveClass(styles.lineHeightTight);
  });

  it("applies all line height variants correctly", () => {
    const lineHeights = [
      "tight",
      "snug",
      "normal",
      "relaxed",
      "loose",
    ] as const;

    lineHeights.forEach((lineHeight) => {
      const { container } = render(<Text lineHeight={lineHeight}>Text</Text>);
      const expectedClass = `lineHeight${lineHeight.charAt(0).toUpperCase() + lineHeight.slice(1)}`;
      expect(container.firstChild).toHaveClass(styles[expectedClass]);
    });
  });
});
