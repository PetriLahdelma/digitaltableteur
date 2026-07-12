import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ImagePlaceholder from "./ImagePlaceholder";
import styles from "./ImagePlaceholder.module.css";

describe("ImagePlaceholder", () => {
  it("renders with required width and height", () => {
    render(<ImagePlaceholder width={800} height={400} />);
    const img = screen.getByRole("img", { name: "Placeholder image" });
    expect(img).toBeInTheDocument();
  });

  it("applies custom alt text", () => {
    render(<ImagePlaceholder width={800} height={400} alt="Custom alt text" />);
    expect(screen.getByRole("img", { name: "Custom alt text" })).toBeInTheDocument();
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
    expect(container.querySelector(`.${styles.light}`)).toBeInTheDocument();
  });

  it("applies medium variant class", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} variant="medium" />,
    );
    expect(container.querySelector(`.${styles.medium}`)).toBeInTheDocument();
  });

  it("applies dark variant class", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} variant="dark" />,
    );
    expect(container.querySelector(`.${styles.dark}`)).toBeInTheDocument();
  });

  it("applies gradient variant by default", () => {
    const { container } = render(<ImagePlaceholder width={800} height={400} />);
    expect(container.querySelector(`.${styles.gradient}`)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("hides icon when showIcon is false", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} showIcon={false} />,
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("hides its decorative icon from the accessibility tree", () => {
    const { container } = render(
      <ImagePlaceholder width={800} height={400} />,
    );

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("hides dimensions when showDimensions is false", () => {
    render(
      <ImagePlaceholder width={800} height={400} showDimensions={false} />,
    );
    expect(screen.queryByText("800 × 400")).not.toBeInTheDocument();
  });
});
