"use client";

import { useRef, useEffect } from "react";
import { useNavigationPathname } from "../../../lib/navigation";
import { cn } from "../../../lib/cn";
import { gsap } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
import { resolveMotionPlan } from "../../../lib/motionPolicy";
import styles from "./PageTransition.module.css";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = useNavigationPathname() ?? "";
  const containerRef = useRef<HTMLDivElement>(null);
  const { motionPreference, isReady } = useAnimationContext();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const routeChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (!routeChanged) return;

    const container = containerRef.current;
    if (!container) return;

    gsap.killTweensOf(container);

    const motion = resolveMotionPlan({
      preference: motionPreference,
      hydrated: isReady,
      isReady,
      kind: "route",
      userInitiated: false,
      essential: false,
      durationMs: 420,
      distancePx: 10,
      iterations: 1,
    });
    if (!motion.animate) {
      delete container.dataset.routeTransitioning;
      gsap.set(container, {
        clearProps: "opacity,visibility,transform,willChange",
      });
      return;
    }

    container.dataset.routeTransitioning = "true";

    const transition = gsap.fromTo(
      container,
      {
        autoAlpha: 0,
        y: motion.distancePx,
        willChange: "opacity, transform",
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: motion.durationMs / 1000,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform,willChange",
        onComplete: () => {
          delete container.dataset.routeTransitioning;
        },
      },
    );

    return () => {
      transition.kill();
      delete container.dataset.routeTransitioning;
      gsap.set(container, {
        clearProps: "opacity,visibility,transform,willChange",
      });
    };
  }, [pathname, motionPreference, isReady]);

  return (
    <div ref={containerRef} className={cn(styles.root, className)}>
      {children}
    </div>
  );
}
