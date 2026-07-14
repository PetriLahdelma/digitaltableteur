import type { MotionPreference } from "./gsap/motion-safe";

export type MotionKind =
  | "entrance"
  | "interaction"
  | "route"
  | "scroll"
  | "continuous"
  | "progress";

export interface MotionRequest {
  preference: MotionPreference;
  hydrated: boolean;
  isReady: boolean;
  kind: MotionKind;
  userInitiated: boolean;
  essential: boolean;
  durationMs: number;
  distancePx: number;
  /** Use -1 for infinite iteration. */
  iterations: number;
}

export interface MotionPlan {
  animate: boolean;
  durationMs: number;
  distancePx: number;
  iterations: number;
}

function stoppedPlan(): MotionPlan {
  return {
    animate: false,
    durationMs: 0,
    distancePx: 0,
    iterations: 0,
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function validIterations(value: number): number {
  if (value === -1) return -1;
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

export function resolveMotionPlan(request: MotionRequest): MotionPlan {
  if (!request.hydrated || !request.isReady) return stoppedPlan();

  const durationMs = nonNegativeFinite(request.durationMs);
  const distancePx = nonNegativeFinite(request.distancePx);
  const iterations = validIterations(request.iterations);
  if (durationMs === 0 || iterations === 0) return stoppedPlan();

  if (request.preference === "full") {
    return { animate: true, durationMs, distancePx, iterations };
  }

  if (
    request.kind === "entrance" ||
    request.kind === "route" ||
    request.kind === "continuous" ||
    request.kind === "scroll" ||
    (!request.userInitiated && !request.essential)
  ) {
    return stoppedPlan();
  }

  return {
    animate: true,
    durationMs: Math.min(150, durationMs),
    distancePx: 0,
    iterations: 1,
  };
}
