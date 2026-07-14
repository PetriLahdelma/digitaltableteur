"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
import { resolveMotionPlan } from "../../../lib/motionPolicy";
import styles from "./Parallax.module.css";

export interface ParallaxProps {
  children: ReactNode;
  speed?: number; // Negative = slower, Positive = faster
  className?: string;
}

export function Parallax({
  children,
  speed = -0.3,
  className = "",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { motionPreference, isReady } = useAnimationContext();

  useGSAP(
    () => {
      if (!ref.current || !innerRef.current) return;

      const distance = 100 * speed;
      const motion = resolveMotionPlan({
        preference: motionPreference,
        hydrated: isReady,
        isReady,
        kind: "scroll",
        userInitiated: false,
        essential: false,
        durationMs: 1000,
        distancePx: Math.abs(distance),
        iterations: 1,
      });
      if (!motion.animate) {
        gsap.set(innerRef.current, { y: 0 });
        return;
      }

      gsap.to(innerRef.current, {
        y: Math.sign(distance) * motion.distancePx,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    {
      scope: ref,
      dependencies: [speed, motionPreference, isReady],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={ref} className={`${styles.parallax} ${className}`.trim()}>
      <div ref={innerRef} className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
