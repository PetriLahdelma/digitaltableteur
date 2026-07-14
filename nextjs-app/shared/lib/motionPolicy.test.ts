import { describe, expect, it } from "vitest";
import { resolveMotionPlan, type MotionRequest } from "./motionPolicy";

const baseRequest: MotionRequest = {
  preference: "full",
  hydrated: true,
  isReady: true,
  kind: "entrance",
  userInitiated: false,
  essential: false,
  durationMs: 800,
  distancePx: 50,
  iterations: 1,
};

describe("resolveMotionPlan", () => {
  it("fails visible and static until hydration and runtime readiness", () => {
    const stopped = {
      animate: false,
      durationMs: 0,
      distancePx: 0,
      iterations: 0,
    };

    expect(resolveMotionPlan({ ...baseRequest, hydrated: false })).toEqual(
      stopped,
    );
    expect(resolveMotionPlan({ ...baseRequest, isReady: false })).toEqual(
      stopped,
    );
  });

  it("preserves valid full-motion requests", () => {
    expect(resolveMotionPlan(baseRequest)).toEqual({
      animate: true,
      durationMs: 800,
      distancePx: 50,
      iterations: 1,
    });
  });

  it.each(["entrance", "route", "scroll", "continuous"] as const)(
    "stops reduced %s motion",
    (kind) => {
      expect(
        resolveMotionPlan({
          ...baseRequest,
          preference: "reduced",
          kind,
          userInitiated: true,
          essential: true,
        }).animate,
      ).toBe(false);
    },
  );

  it("retains concise, zero-distance user feedback under reduced motion", () => {
    expect(
      resolveMotionPlan({
        ...baseRequest,
        preference: "reduced",
        kind: "interaction",
        userInitiated: true,
        durationMs: 300,
        distancePx: 12,
        iterations: -1,
      }),
    ).toEqual({
      animate: true,
      durationMs: 150,
      distancePx: 0,
      iterations: 1,
    });
  });

  it("retains concise essential progress while stopping decorative progress", () => {
    const essential = resolveMotionPlan({
      ...baseRequest,
      preference: "reduced",
      kind: "progress",
      essential: true,
      durationMs: 500,
      distancePx: 0,
    });
    const decorative = resolveMotionPlan({
      ...baseRequest,
      preference: "reduced",
      kind: "progress",
      essential: false,
    });

    expect(essential).toMatchObject({ animate: true, durationMs: 150 });
    expect(decorative.animate).toBe(false);
  });

  it("normalizes invalid numeric requests to a stopped plan", () => {
    expect(
      resolveMotionPlan({
        ...baseRequest,
        durationMs: Number.NaN,
        distancePx: Number.POSITIVE_INFINITY,
        iterations: Number.NaN,
      }).animate,
    ).toBe(false);
  });
});
