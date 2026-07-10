"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  setupReducedMotion,
  type MotionPreference,
  getMotionPreference,
} from "@/nextjs-app/shared/lib/gsap/motion-safe";
import { AnimationRuntimeProvider } from "@digitaltableteur/react";
import { AnimationRuntimeProvider as LocalAnimationRuntimeProvider } from "@/nextjs-app/shared/lib/animation";

// Import GSAP to ensure plugins are registered
import "@/nextjs-app/shared/lib/gsap";

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const [isReady, setIsReady] = useState(false);
  // Stable SSR + first paint; real preference applied in useEffect only.
  const [motionPreference, setMotionPreference] =
    useState<MotionPreference>("full");

  useEffect(() => {
    const cleanup = setupReducedMotion();
    setMotionPreference(getMotionPreference());
    setIsReady(true);

    // Re-check preference on media query change
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setMotionPreference(getMotionPreference());
    mediaQuery.addEventListener("change", handler);

    return () => {
      cleanup();
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  // Two module instances (npm package + local shared source) hold separate
  // AnimationContexts; provide into both so local animation components
  // (Parallax, PageTransition, ScrollIndicator, marquees) honor
  // prefers-reduced-motion instead of reading the "full" default.
  return (
    <AnimationRuntimeProvider value={{ motionPreference, isReady }}>
      <LocalAnimationRuntimeProvider value={{ motionPreference, isReady }}>
        {children}
      </LocalAnimationRuntimeProvider>
    </AnimationRuntimeProvider>
  );
}

export { useAnimationContext } from "@digitaltableteur/react";
