import type { MotionPreference } from "./gsap/motion-safe";
export type MotionKind = "entrance" | "interaction" | "route" | "scroll" | "continuous" | "progress";
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
export declare function resolveMotionPlan(request: MotionRequest): MotionPlan;
//# sourceMappingURL=motionPolicy.d.ts.map