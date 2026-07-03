import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ButtonGroup from "./ButtonGroup";
import styles from "./ButtonGroup.module.css";

expect.extend(toHaveNoViolations);

describe("ButtonGroup", () => {
  it("renders a labelled group with its children", () => {
    render(
      <ButtonGroup ariaLabel="View">
        <button type="button">List</button>
        <button type="button">Grid</button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "View" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grid" })).toBeInTheDocument();
  });

  it("is attached by default and spaced when attached=false", () => {
    const { rerender } = render(
      <ButtonGroup ariaLabel="View">
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveClass(styles.attached);

    rerender(
      <ButtonGroup ariaLabel="View" attached={false}>
        <button type="button">A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveClass(styles.spaced);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ButtonGroup ariaLabel="Text alignment">
        <button type="button">Left</button>
        <button type="button">Center</button>
        <button type="button">Right</button>
      </ButtonGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
