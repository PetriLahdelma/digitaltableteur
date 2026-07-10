"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
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
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      if (!ref.current) return;

      // For reduced motion, snap children to their final visible state instead
      // of running a tween. Partial-opacity frames mid-slide otherwise misreport
      // as color-contrast failures in the matrix axe runs.
      const prefersReduced =
        motionPreference === "reduced" ||
        (typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
      if (prefersReduced) {
        gsap.set(ref.current.children, { opacity: 1, x: 0, y: 0 });
        return;
      }

      const from: gsap.TweenVars = {
        opacity: 0,
        ...(direction === "left" && { x: -100 }),
        ...(direction === "right" && { x: 100 }),
        ...(direction === "up" && { y: 100 }),
        ...(direction === "down" && { y: -100 }),
      };

      gsap.from(ref.current.children, {
        ...from,
        delay,
        duration,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: threshold,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref, dependencies: [motionPreference] }
  );

  return (
    <div ref={ref} className={`${styles.slideIn} ${className}`.trim()}>
      {children}
    </div>
  );
}
