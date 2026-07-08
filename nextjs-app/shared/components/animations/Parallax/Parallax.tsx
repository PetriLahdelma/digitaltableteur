"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
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
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      if (!ref.current || !innerRef.current) return;

      // Disable parallax for reduced motion
      if (motionPreference === "reduced") return;

      const distance = 100 * speed;

      gsap.to(innerRef.current, {
        y: distance,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref, dependencies: [speed, motionPreference] }
  );

  return (
    <div ref={ref} className={`${styles.parallax} ${className}`.trim()}>
      <div ref={innerRef} className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
