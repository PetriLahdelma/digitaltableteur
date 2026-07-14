"use client";

import { useRef, type ReactNode, type ElementType } from "react";
import { gsap, useGSAP } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
import { resolveMotionPlan } from "../../../lib/motionPolicy";
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
  const { motionPreference, isReady } = useAnimationContext();

  useGSAP(
    () => {
      if (!ref.current) return;

      const motion = resolveMotionPlan({
        preference: motionPreference,
        hydrated: isReady,
        isReady,
        kind: "entrance",
        userInitiated: false,
        essential: false,
        durationMs: duration * 1000,
        distancePx: distance,
        iterations: 1,
      });
      if (!motion.animate) {
        gsap.set(ref.current, { opacity: 1, x: 0, y: 0 });
        return;
      }

      const from: gsap.TweenVars = {
        opacity: 0,
        ...(direction === "up" && { y: motion.distancePx }),
        ...(direction === "down" && { y: -motion.distancePx }),
        ...(direction === "left" && { x: motion.distancePx }),
        ...(direction === "right" && { x: -motion.distancePx }),
      };

      // Check if element is already in view (above the fold)
      const rect = ref.current.getBoundingClientRect();
      const isAboveFold = rect.top < window.innerHeight;

      if (isAboveFold) {
        // Play immediately for above-the-fold elements
        gsap.from(ref.current, {
          ...from,
          delay,
          duration: motion.durationMs / 1000,
          ease: "power2.out",
        });
      } else {
        // Use ScrollTrigger for below-the-fold elements
        gsap.from(ref.current, {
          ...from,
          delay,
          duration: motion.durationMs / 1000,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: threshold,
            toggleActions: "play none none none",
          },
        });
      }
    },
    {
      scope: ref,
      dependencies: [
        motionPreference,
        isReady,
        direction,
        delay,
        duration,
        distance,
        threshold,
      ],
      revertOnUpdate: true,
    },
  );

  return (
    <Component ref={ref} className={`${styles.fadeIn} ${className}`.trim()}>
      {children}
    </Component>
  );
}
