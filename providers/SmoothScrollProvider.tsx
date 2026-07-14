"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { resolveMotionPlan } from "@/nextjs-app/shared/lib/motionPolicy";
import { useAnimationContext } from "@/providers/AnimationProvider";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

type LenisInstance = {
  destroy: () => void;
  on: (event: "scroll", callback: () => void) => () => void;
  raf: (time: number) => void;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { motionPreference, isReady } = useAnimationContext();

  useEffect(() => {
    const motion = resolveMotionPlan({
      preference: motionPreference,
      hydrated: isReady,
      isReady,
      kind: "scroll",
      userInitiated: false,
      essential: false,
      durationMs: 1200,
      distancePx: 1,
      iterations: -1,
    });
    if (!motion.animate) return;

    let isDisposed = false;
    let lenis: LenisInstance | null = null;
    let animationFrame = 0;
    let refreshTimeout = 0;
    let unsubscribeScroll: (() => void) | undefined;

    Promise.all([import("lenis"), import("gsap/ScrollTrigger")])
      .then(([{ default: Lenis }, { ScrollTrigger }]) => {
        if (isDisposed) return;

        lenis = new Lenis({
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          syncTouch: false,
          touchMultiplier: 2,
        });

        unsubscribeScroll = lenis.on("scroll", () => {
          ScrollTrigger.update();
        });

        const raf = (time: number) => {
          lenis?.raf(time);
          animationFrame = window.requestAnimationFrame(raf);
        };

        animationFrame = window.requestAnimationFrame(raf);
        refreshTimeout = window.setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      })
      .catch((error) => {
        console.warn("[smooth-scroll] Could not initialize:", error);
      });

    return () => {
      isDisposed = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      unsubscribeScroll?.();
      lenis?.destroy();
    };
  }, [isReady, motionPreference]);

  return <>{children}</>;
}
