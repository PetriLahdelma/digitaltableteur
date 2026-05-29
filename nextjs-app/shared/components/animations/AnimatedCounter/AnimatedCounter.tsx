"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import { cn } from "@/lib/utils";
import styles from "./AnimatedCounter.module.css";

export interface AnimatedCounterProps {
  /** Target number to count to */
  value: number;
  /** Optional suffix (e.g., "+", "%", "k") */
  suffix?: string;
  /** Optional prefix (e.g., "$", ">") */
  prefix?: string;
  /** Label below the number */
  label: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Custom className */
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  duration = 2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      if (!ref.current || !numberRef.current) return;

      const prefersReduced =
        motionPreference === "reduced" ||
        (typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
      if (prefersReduced) {
        numberRef.current.textContent = `${prefix}${value}${suffix}`;
        return;
      }

      const counter = { val: 0 };

      gsap.to(counter, {
        val: value,
        duration,
        ease: "power2.out",
        snap: { val: 1 },
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
          }
        },
      });
    },
    {
      scope: ref,
      dependencies: [value, motionPreference, duration, prefix, suffix],
    },
  );

  return (
    <div ref={ref} className={cn(styles.counter, className)}>
      <span ref={numberRef} className={styles.value}>
        {motionPreference === "reduced"
          ? `${prefix}${value}${suffix}`
          : `${prefix}0${suffix}`}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

AnimatedCounter.displayName = "AnimatedCounter";
