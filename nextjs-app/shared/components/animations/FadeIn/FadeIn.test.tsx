import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FadeIn } from "./FadeIn";

const state = vi.hoisted(() => ({
  runtime: {
    motionPreference: "full" as "full" | "reduced",
    isReady: true,
  },
  from: vi.fn(),
  set: vi.fn(),
  revert: vi.fn(),
}));

vi.mock("../../../lib/animation", () => ({
  useAnimationContext: () => state.runtime,
}));

vi.mock("../../../lib/gsap", async () => {
  const React = await import("react");
  return {
    gsap: {
      from: state.from,
      set: state.set,
    },
    useGSAP: (
      callback: () => void | (() => void),
      config: { dependencies: unknown[]; revertOnUpdate?: boolean },
    ) => {
      React.useLayoutEffect(() => {
        const cleanup = callback();
        return () => {
          if (config.revertOnUpdate) state.revert();
          cleanup?.();
        };
      }, config.dependencies);
    },
  };
});

describe("FadeIn", () => {
  afterEach(() => {
    state.runtime = { motionPreference: "full", isReady: true };
    vi.clearAllMocks();
  });

  it("reverts active GSAP work before applying a live reduced-motion state", () => {
    const view = render(<FadeIn>Motion-aware content</FadeIn>);
    expect(state.from).toHaveBeenCalledTimes(1);

    state.runtime = { motionPreference: "reduced", isReady: true };
    view.rerender(<FadeIn>Motion-aware content</FadeIn>);

    expect(state.revert).toHaveBeenCalledTimes(1);
    expect(state.set).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ opacity: 1, x: 0, y: 0 }),
    );
  });
});
