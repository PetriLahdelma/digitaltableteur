import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Divider from "./Divider";

describe("Divider", () => {
  it("renders", () => {
    render(<Divider />);
    expect(document.body).toBeTruthy();
  });

  it("exposes its orientation when the separator is semantic", () => {
    const { rerender } = render(<Divider decorative={false} />);
    const separator = screen.getByRole("separator");

    expect(separator).toHaveAttribute("aria-orientation", "horizontal");

    rerender(<Divider decorative={false} orientation="vertical" />);
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });
});
