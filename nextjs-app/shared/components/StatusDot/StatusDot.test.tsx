import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import StatusDot from "./StatusDot";
import styles from "./StatusDot.module.css";

expect.extend(toHaveNoViolations);

describe("StatusDot", () => {
  it("renders a visible label with a decorative dot", () => {
    const { container } = render(<StatusDot tone="success">Operational</StatusDot>);
    expect(screen.getByText("Operational")).toBeInTheDocument();
    const dot = container.querySelector(`.${styles.dot}`);
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveClass(styles.success);
  });

  it("renders an sr-only label when only label is given", () => {
    render(<StatusDot tone="error" label="Connection lost" />);
    const sr = screen.getByText("Connection lost");
    expect(sr).toHaveClass(styles.srOnly);
  });

  it("defaults to neutral tone and md size", () => {
    const { container } = render(<StatusDot>Idle</StatusDot>);
    expect(container.querySelector(`.${styles.dot}`)).toHaveClass(styles.neutral);
    expect(container.querySelector(`.${styles.root}`)).toHaveClass(styles.md);
  });

  it("applies the pulse class only when pulse is set", () => {
    const { container, rerender } = render(<StatusDot>Idle</StatusDot>);
    expect(container.querySelector(`.${styles.pulse}`)).toBeNull();
    rerender(<StatusDot pulse>Idle</StatusDot>);
    expect(container.querySelector(`.${styles.pulse}`)).not.toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <StatusDot tone="success">Operational</StatusDot>
        <StatusDot tone="error" label="Down" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
