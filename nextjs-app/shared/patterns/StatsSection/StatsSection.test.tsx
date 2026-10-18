import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatsSection } from "./StatsSection";

vi.mock("../../lib/animation", () => ({
  useAnimationContext: () => ({
    motionPreference: "full",
    isReady: true,
  }),
}));

vi.mock("../../lib/gsap", () => ({
  gsap: {
    fromTo: vi.fn(),
  },
  useGSAP: vi.fn((callback: () => void) => {
    callback();
  }),
}));

describe("StatsSection", () => {
  it("exposes final stat values in a screen-reader and crawler-friendly definition list", () => {
    render(
      <StatsSection
        stats={[
          { value: 20, suffix: "+", label: "Years of experience" },
          { value: 8, suffix: "K+", label: "Design system components built" },
        ]}
      />,
    );

    const summary = screen.getByLabelText("Statistics");

    expect(summary.tagName).toBe("DL");
    expect(within(summary).getByText("Years of experience")).toBeInTheDocument();
    expect(within(summary).getByText("20+")).toBeInTheDocument();
    expect(within(summary).getByText("8K+")).toBeInTheDocument();
  });

  it("keeps animated counters in a decorative grid", () => {
    const { container } = render(
      <StatsSection
        stats={[{ value: 20, suffix: "+", label: "Years of experience" }]}
      />,
    );

    const grid = container.querySelector('[aria-hidden="true"].grid');
    expect(grid).toBeInTheDocument();
    // The visible counter carries the real value in the rendered HTML.
    expect(grid).toHaveTextContent("20+");
    expect(grid).not.toHaveTextContent(/^0\+/);
  });
});
