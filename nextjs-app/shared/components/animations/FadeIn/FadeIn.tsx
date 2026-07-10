"use client";

import { useRef, type ReactNode, type ElementType } from "react";
import { gsap, useGSAP } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
import styles from "./FadeIn.module.css";

type Direction = "up" | "down" | "left" | "right" | "none";

export interface FadeInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: string;
  className?: string;
  as?: ElementType;
}

/**
 * FadeIn component.
 */
export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 50,
  threshold = "top 85%",
  className = "",
  as: Component = "div",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      if (!ref.current) return;

      // Respect reduced motion preference. When the user (or the test runner via
      // `page.emulateMedia({ reducedMotion: "reduce" })`) opts out of motion, skip
      // the tween entirely so the element snaps to its final visible state. This
      // matters for axe color-contrast — partial-opacity frames mid-FadeIn were
      // tripping the matrix gate on every section that uses this animation.
      // Re-read the media query directly here too: the AnimationContext bootstraps
      // in a useEffect (post-mount), so the very first FadeIn render could otherwise
      // observe `motionPreference === "full"` and kick off a gsap.from that axe then
      // samples mid-animation.
      const prefersReduced =
        motionPreference === "reduced" ||
        (typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
      if (prefersReduced) {
        gsap.set(ref.current, { opacity: 1, x: 0, y: 0 });
        return;
      }

      const from: gsap.TweenVars = {
        opacity: 0,
        ...(direction === "up" && { y: distance }),
        ...(direction === "down" && { y: -distance }),
        ...(direction === "left" && { x: distance }),
        ...(direction === "right" && { x: -distance }),
      };

      // Check if element is already in view (above the fold)
      const rect = ref.current.getBoundingClientRect();
      const isAboveFold = rect.top < window.innerHeight;

      if (isAboveFold) {
        // Play immediately for above-the-fold elements
        gsap.from(ref.current, {
          ...from,
          delay,
          duration,
          ease: "power2.out",
        });
      } else {
        // Use ScrollTrigger for below-the-fold elements
        gsap.from(ref.current, {
          ...from,
          delay,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: threshold,
            toggleActions: "play none none none",
          },
        });
      }
    },
    { scope: ref, dependencies: [motionPreference] }
  );

  return (
    <Component ref={ref} className={`${styles.fadeIn} ${className}`.trim()}>
      {children}
    </Component>
  );
}
