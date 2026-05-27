"use client";

import { useRef, type ReactNode, type ElementType } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
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

      // Respect reduced motion preference
      const actualDistance = motionPreference === "reduced" ? 0 : distance;
      const actualDuration = motionPreference === "reduced" ? 0.2 : duration;

      const from: gsap.TweenVars = {
        opacity: 0,
        ...(direction === "up" && { y: actualDistance }),
        ...(direction === "down" && { y: -actualDistance }),
        ...(direction === "left" && { x: actualDistance }),
        ...(direction === "right" && { x: -actualDistance }),
      };

      // Check if element is already in view (above the fold)
      const rect = ref.current.getBoundingClientRect();
      const isAboveFold = rect.top < window.innerHeight;

      if (isAboveFold) {
        // Play immediately for above-the-fold elements
        gsap.from(ref.current, {
          ...from,
          delay,
          duration: actualDuration,
          ease: "power2.out",
        });
      } else {
        // Use ScrollTrigger for below-the-fold elements
        gsap.from(ref.current, {
          ...from,
          delay,
          duration: actualDuration,
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
