import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Title from "./Title";

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
});
