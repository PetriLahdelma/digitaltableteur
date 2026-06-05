"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Gate Framer Motion entrance props until after mount so SSR and the first
 * client paint match (avoids hydration warnings from useReducedMotion / opacity).
 */
export function useHydrationSafeMotion() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && prefersReducedMotion !== true;

  /** Use for Framer `initial` so SSR and first client paint both use `false`. */
  const gateInitial = <T,>(animatedInitial: T): T | false =>
    mounted && shouldAnimate ? animatedInitial : false;

  return {
    mounted,
    shouldAnimate,
    gateInitial,
    prefersReducedMotion: prefersReducedMotion === true,
  };
}
