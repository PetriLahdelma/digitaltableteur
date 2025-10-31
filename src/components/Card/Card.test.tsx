import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "./Card";

describe("Card", () => {
  it("renders title correctly", () => {
    render(<Card title="Test Card" />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("renders body when provided", () => {
    render(<Card title="Test Card" body="Test body content" />);
    expect(screen.getByText("Test body content")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <Card title="Test Card">
        <p>Child content</p>
      </Card>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Card title="Test Card" icon={<TestIcon />} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders as link when link prop is provided", () => {
    render(
      <Card
        title="Test Card"
        link="/test"
        linkLabel="Test Link"
        body="Test body"
      />,
    );

    const linkElement = screen.getByRole("link");
    expect(linkElement).toHaveAttribute("href", "/test");
    // Note: Card component doesn't use aria-label, just check basic link functionality
  });

  it("applies custom className", () => {
    render(<Card title="Test Card" className="custom-class" />);
    // Get the card container by looking for an element with the custom class
    const cardElement = screen
      .getByText("Test Card")
      .closest("div")?.parentElement;
    expect(cardElement?.className).toContain("custom-class");
  });
  it("applies custom className", () => {
    const { container } = render(
      <Card title="Test Card" className="custom-class" />,
    );
    // The custom class is applied to the top-level card div
    const cardElement = container.querySelector(".custom-class");
    expect(cardElement).toBeInTheDocument();
  });
});
