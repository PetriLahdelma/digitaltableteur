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
  // Re-check the user-agent media query on every read so callers that run
  // before gsap.matchMedia() has finished wiring up its listeners still see the
  // correct preference. Without this, the AnimationProvider would call this
  // function synchronously after setupReducedMotion() (in a useEffect) and
  // observe the module-level default "full" because gsap.matchMedia callbacks
  // had not yet fired. That left the Storybook test runner — which forces
  // prefers-reduced-motion via Playwright emulateMedia — running animations at
  // full opacity ramp, tripping axe color-contrast on every FadeIn/TextReveal
  // wrapper.
  if (typeof window !== "undefined") {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        currentPreference = "reduced";
      } else {
        currentPreference = "full";
      }
    } catch {
      // matchMedia unavailable — fall through to cached value.
    }
  }
  return currentPreference;
}

export function isReducedMotion(): boolean {
  return getMotionPreference() === "reduced";
}
