import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FlexBox from "./FlexBox";

describe("FlexBox", () => {
  it("renders children", () => {
    const { getByText } = render(
      <FlexBox>
        <div>Child 1</div>
        <div>Child 2</div>
      </FlexBox>,
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FlexBox className="custom-class">
        <div>Child</div>
      </FlexBox>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
