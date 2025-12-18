import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import List from "./List";

describe("List", () => {
  const items = ["Item 1", "Item 2", "Item 3"];

  it("renders unordered list by default", () => {
    const { container } = render(<List items={items} />);
    expect(container.querySelector("ul")).toBeInTheDocument();
  });

  it("renders ordered list when as='ol'", () => {
    const { container } = render(<List items={items} as="ol" />);
    expect(container.querySelector("ol")).toBeInTheDocument();
  });

  it("renders all list items", () => {
    render(<List items={items} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <List items={items} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies serif terminals class", () => {
    const { container } = render(<List items={items} terminals="serif" />);
    expect(container.firstChild).toHaveClass("serif");
  });

  it("applies sans terminals class by default", () => {
    const { container } = render(<List items={items} />);
    expect(container.firstChild).toHaveClass("sans");
  });

  it("applies size class", () => {
    const { container } = render(<List items={items} size="L" />);
    expect(container.firstChild).toHaveClass("textL");
  });

  it("applies line height class", () => {
    const { container } = render(<List items={items} lineHeight="relaxed" />);
    expect(container.firstChild).toHaveClass("lineHeightRelaxed");
  });

  it("applies compact spacing class", () => {
    const { container } = render(<List items={items} spacing="compact" />);
    expect(container.firstChild).toHaveClass("spacingCompact");
  });

  it("applies normal spacing by default", () => {
    const { container } = render(<List items={items} />);
    expect(container.firstChild).toHaveClass("spacingNormal");
  });

  it("applies relaxed spacing class", () => {
    const { container } = render(<List items={items} spacing="relaxed" />);
    expect(container.firstChild).toHaveClass("spacingRelaxed");
  });

  it("applies listStyleType via inline style", () => {
    const { container } = render(<List items={items} listStyleType="circle" />);
    expect(container.firstChild).toHaveStyle({ listStyleType: "circle" });
  });

  it("applies custom inline styles", () => {
    const { container } = render(
      <List items={items} style={{ color: "red" }} />,
    );
    expect(container.firstChild).toHaveStyle({ color: "red" });
  });

  it("applies custom role", () => {
    const { container } = render(<List items={items} role="navigation" />);
    expect(container.firstChild).toHaveAttribute("role", "navigation");
  });

  it("renders React node items", () => {
    const complexItems = [
      <span key="1">Complex 1</span>,
      <strong key="2">Complex 2</strong>,
    ];
    render(<List items={complexItems} />);
    expect(screen.getByText("Complex 1")).toBeInTheDocument();
    expect(screen.getByText("Complex 2")).toBeInTheDocument();
  });
});
