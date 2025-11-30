import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Grid from "./Grid";

describe("Grid", () => {
  it("renders children", () => {
    const { getByText } = render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    expect(getByText("Item 1")).toBeInTheDocument();
    expect(getByText("Item 2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Grid className="custom-class">
        <div>Item</div>
      </Grid>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
