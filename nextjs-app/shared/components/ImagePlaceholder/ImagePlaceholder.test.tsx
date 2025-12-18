import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ImagePlaceholder from "./ImagePlaceholder";

describe("ImagePlaceholder", () => {
  it("renders with required width and height", () => {
    render(<ImagePlaceholder width={800} height={400} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Placeholder image");
  });

  it("applies custom alt text", () => {
    render(<ImagePlaceholder width={800} height={400} alt="Custom alt text" />);
    expect(screen.getByAltText("Custom alt text")).toBeInTheDocument();
  });

  it("displays caption when provided", () => {
    render(
      <ImagePlaceholder width={800} height={400} caption="Image caption" />,
    );
    expect(screen.getByText("Image caption")).toBeInTheDocument();
  });

  it("displays dimensions when showDimensions is true", () => {
    render(<ImagePlaceholder width={800} height={400} showDimensions />);
    expect(screen.getByText("800 × 400")).toBeInTheDocument();
  });

  it("displays custom text when provided", () => {
    render(<ImagePlaceholder width={800} height={400} text="Custom text" />);
    expect(screen.getByText("Custom text")).toBeInTheDocument();
  });

  it("applies light variant class", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} variant="light" />,
    );
    expect(container.firstChild).toHaveClass("light");
  });

  it("applies medium variant class", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} variant="medium" />,
    );
    expect(container.firstChild).toHaveClass("medium");
  });

  it("applies dark variant class", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} variant="dark" />,
    );
    expect(container.firstChild).toHaveClass("dark");
  });

  it("applies gradient variant class", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} variant="gradient" />,
    );
    expect(container.firstChild).toHaveClass("gradient");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies inline styles", () => {
    const { container } = render(
      <ImagePlaceholder
        width={800}
        height={400}
        style={{ border: "1px solid red" }}
      />,
    );
    expect(container.firstChild).toHaveStyle({ border: "1px solid red" });
  });

  it("renders icon when showIcon is true", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} showIcon />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render icon when showIcon is false", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} showIcon={false} />,
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
