import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Kbd from "./Kbd";
import styles from "./Kbd.module.css";

expect.extend(toHaveNoViolations);

describe("Kbd", () => {
  it("renders a semantic kbd element with its label", () => {
    render(<Kbd>Esc</Kbd>);
    const el = screen.getByText("Esc");
    expect(el.tagName).toBe("KBD");
  });

  it("applies the size class", () => {
    render(<Kbd size="lg">K</Kbd>);
    expect(screen.getByText("K")).toHaveClass(styles.lg);
  });

  it("defaults to md and merges custom className", () => {
    render(<Kbd className="extra">A</Kbd>);
    const el = screen.getByText("A");
    expect(el).toHaveClass(styles.md);
    expect(el).toHaveClass("extra");
  });

  it("defaults to the primary variant and applies the requested variant", () => {
    const { rerender } = render(<Kbd>A</Kbd>);
    expect(screen.getByText("A")).toHaveClass(styles.primary);
    rerender(<Kbd variant="secondary">A</Kbd>);
    expect(screen.getByText("A")).toHaveClass(styles.secondary);
  });

  it("has no axe violations in either variant", async () => {
    const { container } = render(
      <p>
        Press <Kbd variant="primary">⌘</Kbd> + <Kbd variant="secondary">K</Kbd>{" "}
        to open search.
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
