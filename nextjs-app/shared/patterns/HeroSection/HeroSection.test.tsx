import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import { HeroSection } from "./HeroSection";

expect.extend(toHaveNoViolations);

describe("HeroSection", () => {
  it("renders children inside a section by default", () => {
    const { container } = render(
      <HeroSection>
        <h1>Hero title</h1>
      </HeroSection>,
    );
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hero title" })).toBeInTheDocument();
  });

  it("renders as a custom element via the as prop", () => {
    const { container } = render(
      <HeroSection as="header">
        <p>content</p>
      </HeroSection>,
    );
    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("section")).not.toBeInTheDocument();
  });

  it("applies the aria-label", () => {
    render(
      <HeroSection ariaLabel="Homepage hero">
        <p>content</p>
      </HeroSection>,
    );
    expect(screen.getByLabelText("Homepage hero")).toBeInTheDocument();
  });

  it("sets the background image style only for background='image'", () => {
    const { container, rerender } = render(
      <HeroSection background="image" backgroundImage="/hero.jpg">
        <p>content</p>
      </HeroSection>,
    );
    expect(container.firstElementChild).toHaveStyle({
      backgroundImage: "url(/hero.jpg)",
    });

    rerender(
      <HeroSection background="solid" backgroundImage="/hero.jpg">
        <p>content</p>
      </HeroSection>,
    );
    expect(container.firstElementChild).not.toHaveStyle({
      backgroundImage: "url(/hero.jpg)",
    });
  });

  it("applies minHeight, align, and justify utility classes", () => {
    const { container } = render(
      <HeroSection minHeight="screen" align="start" justify="end">
        <p>content</p>
      </HeroSection>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("min-h-screen");
    expect(root.className).toContain("items-start");
    expect(root.className).toContain("justify-end");
  });

  it("appends a custom className", () => {
    const { container } = render(
      <HeroSection className="custom-class">
        <p>content</p>
      </HeroSection>,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <HeroSection ariaLabel="Hero">
        <h1>Title</h1>
        <p>Subtext</p>
      </HeroSection>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
