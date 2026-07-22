import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Author from "@dt/Author";

describe("Author", () => {
  it("renders author name correctly", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
    expect(screen.getByText("By John Doe")).toBeInTheDocument();
  });

  it("names the avatar after the author", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
    const avatarImg = screen.getByRole("img", { name: "John Doe" });
    expect(avatarImg).toBeInTheDocument();
  });

  it("falls back to avatar initials when imageUrl is absent", () => {
    const { container } = render(<Author name="John Doe" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("passes Avatar token sizes through", () => {
    const { container } = render(
      <Author name="John Doe" imageUrl="/test-image.jpg" size="sm" />,
    );
    const avatarImg = container.querySelector("img");
    expect(avatarImg?.getAttribute("style")).toContain("--avatar-size: 2rem");
  });

  it("renders with custom CSS-length size", () => {
    const { container } = render(
      <Author name="John Doe" imageUrl="/test-image.jpg" size="32px" />,
    );
    const avatarImg = container.querySelector("img");
    expect(avatarImg?.getAttribute("style")).toContain("--avatar-size: 32px");
  });

  it("handles imageUrl as object", () => {
    const imageObj = { default: "/test-image.jpg" };
    render(<Author name="Jane Smith" imageUrl={imageObj} />);
    expect(screen.getByText("By Jane Smith")).toBeInTheDocument();
  });

  it("links to profile when profileUrl is provided", () => {
    render(
      <Author
        name="John Doe"
        imageUrl="/test-image.jpg"
        profileUrl="/blog/authors/john-doe"
      />,
    );
    const link = screen.getByRole("link", { name: "By John Doe" });
    expect(link).toHaveAttribute("href", "/blog/authors/john-doe");
  });

  it("has correct container structure", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" />);
    const container = screen.getByText("By John Doe").closest("div");
    // Check for CSS module class that contains "authorContainer"
    expect(container?.className).toContain("authorContainer");
  });

  it("honors a custom byline prefix", () => {
    render(
      <Author
        name="John Doe"
        imageUrl="/test-image.jpg"
        bylinePrefix="Reviewed by"
      />,
    );
    expect(screen.getByText("Reviewed by John Doe")).toBeInTheDocument();
  });

  it("falls back to the localized prefix when bylinePrefix is empty", () => {
    render(<Author name="John Doe" imageUrl="/test-image.jpg" bylinePrefix="" />);
    expect(screen.getByText("By John Doe")).toBeInTheDocument();
  });
});
