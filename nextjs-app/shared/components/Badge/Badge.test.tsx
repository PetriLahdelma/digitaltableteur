import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Badge from "@dt/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("applies the tone class", () => {
    const { container } = render(<Badge tone="success">Success</Badge>);
    // Check for CSS module class containing 'success'
    expect((container.firstChild as HTMLElement).className).toMatch(/success/);
  });

  it("shows close button if removable", () => {
    render(<Badge removable>Removable</Badge>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onRemove when close button clicked", () => {
    const onRemove = vi.fn();
    render(
      <Badge removable onRemove={onRemove}>
        Removable
      </Badge>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Badge className="custom-class">Custom</Badge>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(
      /custom-class/,
    );
  });

  it("ignores invalid plain object icon prop without crashing", () => {
    // @ts-expect-error intentionally passing invalid icon type
    const { container } = render(<Badge icon={{ foo: "bar" }}>Obj Icon</Badge>);
    // Should still render content
    expect(screen.getByText(/Obj Icon/)).toBeInTheDocument();
    // Ensure no nested svg created for invalid icon
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders a color-coded StatusDot instead of the semantic icon when dot is set", () => {
    const { container } = render(
      <Badge tone="success" dot>
        Stable
      </Badge>,
    );
    // StatusDot renders a styled dot span (tone-classed), not the semantic icon svg.
    const dot = container.querySelector('[class*="dot"]');
    expect(dot).not.toBeNull();
    expect(dot?.className).toMatch(/success/);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("lets an explicit icon win over dot", () => {
    const { container } = render(
      <Badge tone="info" dot icon={<span data-testid="custom-icon" />}>
        Beta
      </Badge>,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(container.querySelector('[class*="dot"]')).toBeNull();
  });
});
