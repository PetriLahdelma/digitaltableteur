import { type ReactNode } from "react";
export type { MotionPreference } from "./gsap/motion-safe";
import type { MotionPreference } from "./gsap/motion-safe";
export interface AnimationRuntime {
    motionPreference: MotionPreference;
    isReady: boolean;
}
export interface AnimationRuntimeProviderProps {
    children: ReactNode;
    value: AnimationRuntime;
}
export declare function AnimationRuntimeProvider({ children, value, }: AnimationRuntimeProviderProps): import("react").JSX.Element;
export declare function useAnimationContext(): AnimationRuntime;
//# sourceMappingURL=animation.d.ts.map