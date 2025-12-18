import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HelperText from "./HelperText";

describe("HelperText", () => {
  it("renders children correctly", () => {
    render(<HelperText>Helper text content</HelperText>);
    expect(screen.getByText("Helper text content")).toBeInTheDocument();
  });

  it("renders as a paragraph element", () => {
    const { container } = render(<HelperText>Text</HelperText>);
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("applies id when provided", () => {
    render(<HelperText id="helper-1">Text</HelperText>);
    expect(screen.getByText("Text")).toHaveAttribute("id", "helper-1");
  });

  it("applies custom className", () => {
    render(<HelperText className="custom-class">Text</HelperText>);
    expect(screen.getByText("Text")).toHaveClass("custom-class");
  });

  it("renders error state with icon", () => {
    const { container } = render(
      <HelperText state="error">Error message</HelperText>,
    );
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders warning state with icon", () => {
    const { container } = render(
      <HelperText state="warning">Warning message</HelperText>,
    );
    expect(screen.getByText("Warning message")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders success state with icon", () => {
    const { container } = render(
      <HelperText state="success">Success message</HelperText>,
    );
    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders info state with icon", () => {
    const { container } = render(
      <HelperText state="info">Info message</HelperText>,
    );
    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders without icon when no state provided", () => {
    const { container } = render(<HelperText>Neutral text</HelperText>);
    expect(screen.getByText("Neutral text")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(<HelperText ref={ref}>Text</HelperText>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});
