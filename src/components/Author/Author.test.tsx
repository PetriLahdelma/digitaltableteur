import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Author from "./Author";

describe("Author", () => {
  it("renders author name correctly", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
    expect(screen.getByText("By John Doe")).toBeInTheDocument();
  });

  it("renders with default size", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
    // Check if Avatar component is rendered (by checking for img element)
    const avatarImg = screen.getByRole("img");
    expect(avatarImg).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" size="32px" />);
    const avatarImg = screen.getByRole("img");
    expect(avatarImg).toBeInTheDocument();
  });

  it("handles imageUrl as object", () => {
    const imageObj = { default: "/test-image.jpg" };
    render(<Author name="Jane Smith" imageUrl={imageObj} />);
    expect(screen.getByText("By Jane Smith")).toBeInTheDocument();
  });

  it("has correct container structure", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
    const container = screen.getByText("By John Doe").closest("div");
    // Check for CSS module class that contains "authorContainer"
    expect(container?.className).toContain("authorContainer");
  });
});
