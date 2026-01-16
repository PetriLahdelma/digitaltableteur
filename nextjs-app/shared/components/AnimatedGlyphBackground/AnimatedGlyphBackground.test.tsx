import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import AnimatedGlyphBackground from "./AnimatedGlyphBackground";

expect.extend(toHaveNoViolations);

describe("AnimatedGlyphBackground", () => {
  describe("Rendering", () => {
    it("renders the svg frames", () => {
      const { container } = render(<AnimatedGlyphBackground />);
      const svg = container.querySelector("svg");
      const frames = container.querySelectorAll("g[data-frame]");

      expect(svg).toBeInTheDocument();
      expect(frames.length).toBe(6);
    });

    it("marks the wrapper as aria-hidden", () => {
      const { container } = render(<AnimatedGlyphBackground />);
      const wrapper = container.firstElementChild as HTMLElement;

      expect(wrapper).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Props", () => {
    it("applies a custom className", () => {
      const { container } = render(
        <AnimatedGlyphBackground className="custom" />
      );
      const wrapper = container.firstElementChild as HTMLElement;

      expect(wrapper).toHaveClass("custom");
    });

    it("reflects animation state in data attribute", () => {
      const { container } = render(
        <AnimatedGlyphBackground animate={false} />
      );
      const wrapper = container.firstElementChild as HTMLElement;

      expect(wrapper).toHaveAttribute("data-animated", "false");
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(<AnimatedGlyphBackground />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });
});
