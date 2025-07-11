import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Badge from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("applies design variant", () => {
    const { container } = render(<Badge state="success">Success</Badge>);
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
});
