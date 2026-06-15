"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

type LenisInstance = {
  destroy: () => void;
  on: (event: "scroll", callback: () => void) => () => void;
  raf: (time: number) => void;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) return;

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
  }, []);

  return <>{children}</>;
}
