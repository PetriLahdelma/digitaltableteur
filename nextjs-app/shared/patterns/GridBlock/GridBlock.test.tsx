import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GridBlock from "./GridBlock";
import Text from "@dt/Text";
import styles from "./GridBlock.module.css";

describe("GridBlock", () => {
  const textCell = {
    type: "text" as const,
    content: <Text size="m">Text content</Text>,
  };

  const imageCell = {
    type: "image" as const,
    src: "/test.jpg",
    alt: "Test image",
    width: 800,
    height: 600,
  };

  it("renders text cells", () => {
    render(<GridBlock cells={[textCell]} />);
    expect(screen.getByText("Text content")).toBeInTheDocument();
  });

  it("renders image cells", () => {
    render(<GridBlock cells={[imageCell]} />);
    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });

  it("renders mixed text and image cells", () => {
    render(<GridBlock cells={[textCell, imageCell]} />);
    expect(screen.getByText("Text content")).toBeInTheDocument();
    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });

  it("applies 2 columns by default", () => {
    const { container } = render(<GridBlock cells={[textCell, imageCell]} />);
    expect(container.querySelector(`.${styles.grid2Col}`)).toBeInTheDocument();
  });

  it("applies 1 column when specified", () => {
    const { container } = render(<GridBlock cells={[textCell]} columns={1} />);
    expect(container.querySelector(`.${styles.grid1Col}`)).toBeInTheDocument();
  });

  it("applies light background color", () => {
    const { container } = render(
      <GridBlock cells={[textCell]} backgroundColor="light" />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ backgroundColor: "var(--color-light-bg)" });
  });

  it("applies white background color", () => {
    const { container } = render(
      <GridBlock cells={[textCell]} backgroundColor="white" />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ backgroundColor: "var(--color-white)" });
  });

  it("applies transparent background by default", () => {
    const { container } = render(<GridBlock cells={[textCell]} />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute(
      "style",
      expect.stringContaining("transparent"),
    );
  });

  it("applies custom className", () => {
    const { container } = render(
      <GridBlock cells={[textCell]} className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("applies noGap class when gap is none", () => {
    const { container } = render(<GridBlock cells={[textCell]} gap="none" />);
    expect(container.querySelector(`.${styles.noGap}`)).toBeInTheDocument();
  });

  it("applies smallGap class when gap is small", () => {
    const { container } = render(<GridBlock cells={[textCell]} gap="small" />);
    expect(container.querySelector(`.${styles.smallGap}`)).toBeInTheDocument();
  });

  it("renders image caption when provided and stacked", () => {
    const cellWithCaption = {
      ...imageCell,
      caption: "Image caption",
    };
    render(<GridBlock cells={[cellWithCaption]} />);
    expect(screen.getByText("Image caption")).toBeInTheDocument();
  });

  it("applies inner padding to text cells when specified", () => {
    const cellWithPadding = {
      ...textCell,
      innerPadding: true,
    };
    const { container } = render(<GridBlock cells={[cellWithPadding]} />);
    expect(container.querySelector(`.${styles.innerPadding}`)).toBeInTheDocument();
  });

  it("applies mixBlendMode to images when specified", () => {
    const cellWithBlend = {
      ...imageCell,
      mixBlendMode: "multiply" as const,
    };
    render(<GridBlock cells={[cellWithBlend]} />);
    const img = screen.getByAltText("Test image");
    expect(img).toHaveStyle({ mixBlendMode: "multiply" });
  });

  it("renders as section by default", () => {
    const { container } = render(<GridBlock cells={[textCell]} />);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders multiple cells in order", () => {
    const cells = [
      { type: "text" as const, content: <Text>First</Text> },
      { type: "text" as const, content: <Text>Second</Text> },
      { type: "text" as const, content: <Text>Third</Text> },
    ];
    render(<GridBlock cells={cells} />);
    const textElements = screen.getAllByText(/First|Second|Third/);
    expect(textElements).toHaveLength(3);
  });

  it("handles empty cells array", () => {
    const { container } = render(<GridBlock cells={[]} />);
    expect(container.querySelector("section")).toBeInTheDocument();
  });
});
