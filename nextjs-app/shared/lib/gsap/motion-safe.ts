"use client";

import gsap from "gsap";

export type MotionPreference = "full" | "reduced";

let currentPreference: MotionPreference = "full";

export function setupReducedMotion(): () => void {
  if (typeof window === "undefined") return () => {};

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    currentPreference = "full";
    gsap.globalTimeline.timeScale(1);
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    currentPreference = "reduced";
    // Reduce animation speed significantly but don't disable entirely
    gsap.globalTimeline.timeScale(3); // 3x faster = shorter animations
  });

  // Return cleanup function
  return () => mm.revert();
}

export function getMotionPreference(): MotionPreference {
  return currentPreference;
}

export function isReducedMotion(): boolean {
  return currentPreference === "reduced";
}
