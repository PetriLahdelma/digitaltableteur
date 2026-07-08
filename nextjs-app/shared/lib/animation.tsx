"use client";

import { createContext, useContext, type ReactNode } from "react";
export type { MotionPreference } from "./gsap/motion-safe";
import type { MotionPreference } from "./gsap/motion-safe";

export interface AnimationRuntime {
  motionPreference: MotionPreference;
  isReady: boolean;
}

const defaultRuntime: AnimationRuntime = {
  motionPreference: "full",
  isReady: false,
};

const AnimationContext = createContext<AnimationRuntime>(defaultRuntime);

export interface AnimationRuntimeProviderProps {
  children: ReactNode;
  value: AnimationRuntime;
}

export function AnimationRuntimeProvider({
  children,
  value,
}: AnimationRuntimeProviderProps) {
  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext(): AnimationRuntime {
  return useContext(AnimationContext);
}
