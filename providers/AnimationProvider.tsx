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

  return (
    <AnimationRuntimeProvider value={{ motionPreference, isReady }}>
      {children}
    </AnimationRuntimeProvider>
  );
}

export { useAnimationContext } from "@digitaltableteur/react";
