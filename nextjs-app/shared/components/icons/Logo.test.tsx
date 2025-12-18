import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Logo from "./Logo";

// Mock ThemeProvider
vi.mock("@/nextjs-app/shared/components/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("Logo", () => {
  it("renders logo image", () => {
    render(<Logo />);
    expect(screen.getByAltText("Digitaltableteur logo")).toBeInTheDocument();
  });

  it("renders filled variant by default", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders outline variant when specified", () => {
    render(<Logo variant="outline" />);
    expect(screen.getByAltText("Digitaltableteur logo")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Logo className="custom-logo" />);
    expect(container.firstChild).toHaveClass("custom-logo");
  });

  it("calls onClick when logo is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Logo onClick={onClick} />);

    const logo = screen.getByAltText("Digitaltableteur logo");
    await user.click(logo);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders without onClick handler", () => {
    render(<Logo />);
    expect(screen.getByAltText("Digitaltableteur logo")).toBeInTheDocument();
  });
});
