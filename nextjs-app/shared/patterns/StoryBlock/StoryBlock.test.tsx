import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StoryBlock from "./StoryBlock";
import Text from "@dt/Text";

describe("StoryBlock", () => {
  const basicContent = [
    <Text key="1" size="s">
      First paragraph
    </Text>,
    <Text key="2" size="s">
      Second paragraph
    </Text>,
  ];

  it("renders title", () => {
    render(<StoryBlock title="Story Title" content={basicContent} />);
    expect(screen.getByText("Story Title")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <StoryBlock title="Title" subtitle="Category" content={basicContent} />,
    );
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("renders all content paragraphs", () => {
    render(<StoryBlock title="Title" content={basicContent} />);
    expect(screen.getByText("First paragraph")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph")).toBeInTheDocument();
  });

  it("renders without images by default", () => {
    const { container } = render(
      <StoryBlock title="Title" content={basicContent} />,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("renders single image", () => {
    const image = {
      src: "/test.jpg",
      alt: "Test image",
      width: 800,
      height: 600,
    };
    render(
      <StoryBlock
        title="Title"
        content={basicContent}
        images={image}
        imageLayout="single"
      />,
    );
    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });

  it("renders multiple images in grid", () => {
    const images = [
      { src: "/test1.jpg", alt: "Image 1", width: 800, height: 600 },
      { src: "/test2.jpg", alt: "Image 2", width: 800, height: 600 },
    ];
    render(
      <StoryBlock
        title="Title"
        content={basicContent}
        images={images}
        imageLayout="grid"
      />,
    );
    expect(screen.getByAltText("Image 1")).toBeInTheDocument();
    expect(screen.getByAltText("Image 2")).toBeInTheDocument();
  });

  it("renders image caption when provided", () => {
    const image = {
      src: "/test.jpg",
      alt: "Test image",
      width: 800,
      height: 600,
      caption: "Image caption text",
    };
    render(
      <StoryBlock
        title="Title"
        content={basicContent}
        images={image}
        imageLayout="single"
      />,
    );
    expect(screen.getByText("Image caption text")).toBeInTheDocument();
  });

  it("applies light background color", () => {
    const { container } = render(
      <StoryBlock
        title="Title"
        content={basicContent}
        backgroundColor="light"
      />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ backgroundColor: "var(--color-light-bg)" });
  });

  it("applies white background color", () => {
    const { container } = render(
      <StoryBlock
        title="Title"
        content={basicContent}
        backgroundColor="white"
      />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ backgroundColor: "var(--color-white)" });
  });

  it("applies custom className", () => {
    const { container } = render(
      <StoryBlock
        title="Title"
        content={basicContent}
        className="custom-class"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies aria-label", () => {
    render(
      <StoryBlock
        title="Title"
        content={basicContent}
        ariaLabel="Custom label"
      />,
    );
    expect(screen.getByLabelText("Custom label")).toBeInTheDocument();
  });

  it("uses title as aria-label when not provided", () => {
    render(<StoryBlock title="Default Label" content={basicContent} />);
    expect(screen.getByLabelText("Default Label")).toBeInTheDocument();
  });

  it("renders as section by default", () => {
    const { container } = render(
      <StoryBlock title="Title" content={basicContent} />,
    );
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders as article when specified", () => {
    const { container } = render(
      <StoryBlock title="Title" content={basicContent} as="article" />,
    );
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("does not render images when imageLayout is none", () => {
    const image = {
      src: "/test.jpg",
      alt: "Test image",
      width: 800,
      height: 600,
    };
    const { container } = render(
      <StoryBlock
        title="Title"
        content={basicContent}
        images={image}
        imageLayout="none"
      />,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
