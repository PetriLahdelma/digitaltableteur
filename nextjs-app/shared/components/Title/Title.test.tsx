import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Title from "@dt/Title";
import styles from "./Title.module.css";

describe("Title", () => {
  it("renders children", () => {
    const { getByText } = render(<Title>Title Text</Title>);
    expect(getByText("Title Text")).toBeInTheDocument();
  });

  it("renders as correct heading level", () => {
    const { container } = render(<Title level={2}>Heading 2</Title>);
    expect(container.querySelector("h2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Title className="custom-class">Title</Title>);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("unstyled renders only custom className without token typography", () => {
    const { container } = render(
      <Title as="h2" unstyled className="font-display text-2xl">
        Section
      </Title>,
    );
    const heading = container.querySelector("h2");
    expect(heading).toHaveClass("font-display", "text-2xl");
    expect(heading).not.toHaveClass(styles.title);
    expect(heading).not.toHaveClass(styles.titleL);
  });

  it("applies lineHeight class when provided", () => {
    const { container } = render(<Title lineHeight="tight">Title</Title>);
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
      const { container } = render(
        <Title lineHeight={lineHeight}>Title</Title>,
      );
      const expectedClass = `lineHeight${lineHeight.charAt(0).toUpperCase() + lineHeight.slice(1)}`;
      expect(container.firstChild).toHaveClass(styles[expectedClass]);
    });
  });

  it("forwards ref to the heading element", () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<Title ref={ref}>Title</Title>);
    expect(ref.current?.tagName).toBe("H1");
  });
});
