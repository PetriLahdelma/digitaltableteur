"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
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

      const isReduced = motionPreference === "reduced";
      const distance = isReduced ? 0 : 100;
      const actualDuration = isReduced ? 0.2 : duration;

      const from: gsap.TweenVars = {
        opacity: 0,
        ...(direction === "left" && { x: -distance }),
        ...(direction === "right" && { x: distance }),
        ...(direction === "up" && { y: distance }),
        ...(direction === "down" && { y: -distance }),
      };

      gsap.from(ref.current.children, {
        ...from,
        delay,
        duration: actualDuration,
        stagger: isReduced ? 0 : stagger,
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
