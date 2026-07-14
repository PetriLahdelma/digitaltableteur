import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageTransition } from "./PageTransition";

const state = vi.hoisted(() => {
  const transition = { kill: vi.fn() };
  return {
    pathname: "/home",
    runtime: {
      motionPreference: "reduced" as "full" | "reduced",
      isReady: false,
    },
    gsap: {
      killTweensOf: vi.fn(),
      set: vi.fn(),
      fromTo: vi.fn(() => transition),
    },
  };
});

vi.mock("../../../lib/navigation", () => ({
  useNavigationPathname: () => state.pathname,
}));

vi.mock("../../../lib/animation", () => ({
  useAnimationContext: () => state.runtime,
}));

vi.mock("../../../lib/gsap", () => ({
  gsap: state.gsap,
}));

describe("PageTransition", () => {
  afterEach(() => {
    state.pathname = "/home";
    state.runtime = { motionPreference: "reduced", isReady: false };
    vi.clearAllMocks();
  });

  it("does not treat runtime readiness as a route transition", () => {
    const view = render(<PageTransition>Home</PageTransition>);

    state.runtime = { motionPreference: "full", isReady: true };
    view.rerender(<PageTransition>Home</PageTransition>);

    expect(state.gsap.fromTo).not.toHaveBeenCalled();
  });

  it("animates a real route change when full motion is ready", () => {
    state.runtime = { motionPreference: "full", isReady: true };
    const view = render(<PageTransition>Home</PageTransition>);

    state.pathname = "/about";
    view.rerender(<PageTransition>About</PageTransition>);

    expect(state.gsap.fromTo).toHaveBeenCalledTimes(1);
  });

  it("snaps a reduced-motion route change to its final state", () => {
    state.runtime = { motionPreference: "reduced", isReady: true };
    const view = render(<PageTransition>Home</PageTransition>);

    state.pathname = "/about";
    view.rerender(<PageTransition>About</PageTransition>);

    expect(state.gsap.fromTo).not.toHaveBeenCalled();
    expect(state.gsap.set).toHaveBeenCalled();
  });
});
