"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
import { resolveMotionPlan } from "../../../lib/motionPolicy";
import styles from "./SlideIn.module.css";

type Direction = "left" | "right" | "up" | "down";

export interface SlideInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: string;
  className?: string;
}

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  duration = 1,
  stagger = 0.1,
  threshold = "top 80%",
  className = "",
}: SlideInProps) {
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
        distancePx: 100,
        iterations: 1,
      });
      if (!motion.animate) {
        gsap.set(ref.current.children, { opacity: 1, x: 0, y: 0 });
        return;
      }

      const from: gsap.TweenVars = {
        opacity: 0,
        ...(direction === "left" && { x: -motion.distancePx }),
        ...(direction === "right" && { x: motion.distancePx }),
        ...(direction === "up" && { y: motion.distancePx }),
        ...(direction === "down" && { y: -motion.distancePx }),
      };

      gsap.from(ref.current.children, {
        ...from,
        delay,
        duration: motion.durationMs / 1000,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: threshold,
          toggleActions: "play none none none",
        },
      });
    },
    {
      scope: ref,
      dependencies: [
        motionPreference,
        isReady,
        direction,
        delay,
        duration,
        stagger,
        threshold,
      ],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={ref} className={`${styles.slideIn} ${className}`.trim()}>
      {children}
    </div>
  );
}
