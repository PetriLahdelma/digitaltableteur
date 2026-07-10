import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnimatedCounter, formatStatValue } from "./AnimatedCounter";

const useAnimationContextMock = vi.fn(() => ({
  motionPreference: "full" as const,
  isReady: true,
}));

vi.mock("../../../lib/animation", () => ({
  useAnimationContext: () => useAnimationContextMock(),
}));

vi.mock("../../../lib/gsap", () => ({
  gsap: {
    fromTo: vi.fn(),
  },
  useGSAP: vi.fn((callback: () => void) => {
    callback();
  }),
}));

describe("formatStatValue", () => {
  it("formats prefix, value, and suffix", () => {
    expect(formatStatValue(20, "", "+")).toBe("20+");
    expect(formatStatValue(8, "", "K+")).toBe("8K+");
  });
});

describe("AnimatedCounter", () => {
  afterEach(() => {
    useAnimationContextMock.mockReset();
    useAnimationContextMock.mockReturnValue({
      motionPreference: "full",
      isReady: true,
    });
  });

  it("renders the animated value from zero while exposing the final stat to assistive tech", () => {
    render(
      <AnimatedCounter
        value={20}
        suffix="+"
        label="Years of experience"
        duration={2}
      />,
    );

    expect(screen.getByText("0+")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "20+ Years of experience" }),
    ).toBeInTheDocument();
  });

  it("marks the animated digits and label as decorative", () => {
    render(
      <AnimatedCounter value={300} suffix="+" label="Projects delivered" />,
    );

    const counter = screen.getByRole("group", {
      name: "300+ Projects delivered",
    });

    expect(within(counter).getByText("0+")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(within(counter).getByText("Projects delivered")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
