"use client";

import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "../../../lib/cn";
import { gsap } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import styles from "./PageTransition.module.css";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname() ?? "";
  const containerRef = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    gsap.killTweensOf(container);

    if (motionPreference === "reduced") {
      delete container.dataset.routeTransitioning;
      gsap.set(container, {
        clearProps: "opacity,visibility,transform,willChange",
      });
      return;
    }

    container.dataset.routeTransitioning = "true";

    const transition = gsap.fromTo(
      container,
      { autoAlpha: 0, y: 10, willChange: "opacity, transform" },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
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
  }, [pathname, motionPreference]);

  return (
    <div ref={containerRef} className={cn(styles.root, className)}>
      {children}
    </div>
  );
}
