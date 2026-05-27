import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Logo from "./Logo";

vi.mock("@/nextjs-app/shared/components/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("Logo", () => {
  it("renders filled SVG logo by default", () => {
    render(<Logo />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders outline image variant when specified", () => {
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

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as static image without onClick handler", () => {
    render(<Logo />);
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
