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

  it("renders a custom image with the accessible name when src is set", () => {
    const { container } = render(<Logo src="/logos/clients/dsharp.svg" />);
    const img = screen.getByRole("img", { name: "Digitaltableteur" });
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("/logos/clients/dsharp.svg");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("uses title as the custom image alt text", () => {
    render(<Logo src="/logos/clients/dsharp.svg" title="DSharp" />);
    expect(screen.getByRole("img", { name: "DSharp" }).getAttribute("alt")).toBe(
      "DSharp",
    );
  });

  it("hides a decorative custom image from the accessibility tree", () => {
    const { container } = render(
      <Logo src="/logos/clients/dsharp.svg" decorative />,
    );
    expect(screen.queryByRole("img")).toBeNull();
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies the size to the custom image box", () => {
    const { container } = render(
      <Logo src="/logos/clients/dsharp.svg" size={48} />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("width")).toBe("48");
    expect(img?.getAttribute("height")).toBe("48");
  });

  it("falls back to the built-in mark when src is empty", () => {
    const { container } = render(<Logo src="" />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("ignores animated and badge when rendering a custom image", () => {
    const { container } = render(
      <Logo src="/logos/clients/dsharp.svg" animated badge />,
    );
    expect(container.querySelector("circle")).toBeNull();
    expect(container.querySelector("img")?.getAttribute("class")).not.toContain(
      "animated",
    );
  });
});
