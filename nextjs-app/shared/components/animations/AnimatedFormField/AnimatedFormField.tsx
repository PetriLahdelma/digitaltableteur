"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import { cn } from "../../../lib/cn";
import styles from "./AnimatedFormField.module.css";

export interface AnimatedFormFieldProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedFormField({
  children,
  className,
}: AnimatedFormFieldProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      if (!accentRef.current || motionPreference === "reduced") return;
      // Initialize accent line as invisible
      gsap.set(accentRef.current, { scaleX: 0 });
    },
    { scope: wrapperRef, dependencies: [motionPreference] }
  );

  const handleFocusIn = useCallback(() => {
    if (motionPreference === "reduced") return;

    if (accentRef.current) {
      gsap.to(accentRef.current, {
        scaleX: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, {
        scale: 1.01,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  }, [motionPreference]);

  const handleFocusOut = useCallback(() => {
    if (motionPreference === "reduced") return;

    if (accentRef.current) {
      gsap.to(accentRef.current, {
        scaleX: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }

    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  }, [motionPreference]);

  return (
    <div
      ref={wrapperRef}
      className={cn(styles.wrapper, className)}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
    >
      {children}
      <div ref={accentRef} className={styles.accent} aria-hidden="true" />
    </div>
  );
}
