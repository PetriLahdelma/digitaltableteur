"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import { cn } from "../../../lib/cn";
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

export function formatStatValue(
  value: number,
  prefix = "",
  suffix = "",
): string {
  return `${prefix}${value}${suffix}`;
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
  const displayValue = formatStatValue(value, prefix, suffix);
  const initialVisibleValue = formatStatValue(0, prefix, suffix);
  const accessibleLabel = `${displayValue} ${label}`;

  useGSAP(
    () => {
      if (!ref.current || !numberRef.current) return;

      const prefersReduced =
        motionPreference === "reduced" ||
        (typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
      if (prefersReduced) {
        numberRef.current.textContent = displayValue;
        return;
      }

      numberRef.current.textContent = initialVisibleValue;

      const counter = { val: 0 };

      gsap.fromTo(
        counter,
        { val: 0 },
        {
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
              numberRef.current.textContent = formatStatValue(
                Math.round(counter.val),
                prefix,
                suffix,
              );
            }
          },
        },
      );
    },
    {
      scope: ref,
      dependencies: [
        value,
        motionPreference,
        duration,
        prefix,
        suffix,
        displayValue,
        initialVisibleValue,
      ],
    },
  );

  return (
    <div
      ref={ref}
      className={cn(styles.counter, className)}
      role="group"
      aria-label={accessibleLabel}
    >
      <span ref={numberRef} className={styles.value} aria-hidden="true">
        {initialVisibleValue}
      </span>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

AnimatedCounter.displayName = "AnimatedCounter";
