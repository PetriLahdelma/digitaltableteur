import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Logo from "./Logo";

describe("Logo", () => {
  it("renders with the default accessible name", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: "Digitaltableteur" })).toBeTruthy();
  });

  it("honors a custom title", () => {
    render(<Logo title="Home" />);
    expect(screen.getByRole("img", { name: "Home" })).toBeTruthy();
  });

  it("is removed from the accessibility tree when decorative", () => {
    const { container } = render(<Logo decorative />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies the size to the svg box", () => {
    const { container } = render(<Logo size={48} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("48");
    expect(svg?.getAttribute("height")).toBe("48");
  });

  it("adds an animation class only when animated", () => {
    const tokens = (el: Element | null) =>
      (el?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
    const staticSvg = render(<Logo />).container.querySelector("svg");
    const animatedSvg = render(<Logo animated />).container.querySelector("svg");
    expect(tokens(animatedSvg).length).toBeGreaterThan(tokens(staticSvg).length);
  });

  it("renders a badge circle only when badge is set", () => {
    expect(
      render(<Logo />).container.querySelector("circle"),
    ).toBeNull();
    expect(
      render(<Logo badge />).container.querySelector("circle"),
    ).not.toBeNull();
  });
});
