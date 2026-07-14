"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { useAnimationContext } from "../../lib/animation";
import { cn } from "../../lib/cn";
import { resolveMotionPlan } from "../../lib/motionPolicy";

export interface HeroBackgroundProps {
  /** Background style variant */
  variant?: "gradient" | "mesh" | "solid" | "noise";
  /** Enable animation (gradient movement, noise flicker) */
  animate?: boolean;
  /** Theme-aware color scheme */
  colorScheme?: "primary" | "secondary" | "neutral" | "dark";
  /** Custom className for styling */
  className?: string;
}

const baseClasses = "absolute inset-0 overflow-hidden";

const colorSchemeGradients: Record<
  NonNullable<HeroBackgroundProps["colorScheme"]>,
  string
> = {
  primary: "from-primary/20 via-background to-primary/10",
  secondary: "from-secondary/20 via-background to-secondary/10",
  neutral: "from-muted via-background to-muted/50",
  dark: "from-zinc-900 via-zinc-950 to-black",
};

export function HeroBackground({
  variant = "gradient",
  animate = true,
  colorScheme = "primary",
  className,
}: HeroBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const { motionPreference, isReady } = useAnimationContext();
  const motion = resolveMotionPlan({
    preference: motionPreference,
    hydrated: isReady,
    isReady,
    kind: "continuous",
    userInitiated: false,
    essential: false,
    durationMs: 8000,
    distancePx: 100,
    iterations: -1,
  });
  const shouldAnimate = animate && motion.animate;

  // Gradient animation
  useGSAP(
    () => {
      if (!gradientRef.current || !shouldAnimate || variant !== "gradient")
        return;

      // Subtle gradient movement
      gsap.to(gradientRef.current, {
        backgroundPosition: "100% 50%",
        duration: motion.durationMs / 1000,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    // revertOnUpdate matters: the provider resolves prefers-reduced-motion in
    // a post-mount effect, so the gate flips AFTER this tween starts — without
    // revert, the early return leaves the infinite loop running for
    // reduced-motion users.
    {
      scope: ref,
      dependencies: [shouldAnimate, variant],
      revertOnUpdate: true,
    },
  );

  // Noise flicker animation
  useGSAP(
    () => {
      if (!ref.current || !shouldAnimate || variant !== "noise") return;

      const noiseOverlay = ref.current.querySelector("[data-noise]");
      if (!noiseOverlay) return;

      // Subtle opacity flicker for noise
      gsap.to(noiseOverlay, {
        opacity: 0.03,
        duration: 0.1,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });
    },
    {
      scope: ref,
      dependencies: [shouldAnimate, variant],
      revertOnUpdate: true,
    },
  );

  const renderGradient = () => (
    <div
      ref={gradientRef}
      className={cn(
        "absolute inset-0",
        "bg-gradient-to-br bg-[length:200%_200%] bg-[position:0%_50%]",
        colorSchemeGradients[colorScheme],
      )}
      aria-hidden="true"
    />
  );

  const renderMesh = () => (
    <div className="absolute inset-0" aria-hidden="true">
      {/* Mesh gradient using multiple overlapping radial gradients */}
      <div
        className={cn(
          "absolute inset-0 opacity-60",
          "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--color-primary),transparent)]",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 opacity-40",
          "bg-[radial-gradient(ellipse_60%_60%_at_0%_0%,var(--color-secondary),transparent)]",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 opacity-30",
          "bg-[radial-gradient(ellipse_50%_80%_at_100%_100%,var(--color-accent),transparent)]",
        )}
      />
    </div>
  );

  const renderSolid = () => (
    <div
      className={cn(
        "absolute inset-0",
        colorScheme === "dark" ? "bg-zinc-950" : "bg-background",
      )}
      aria-hidden="true"
    />
  );

  const renderNoise = () => (
    <>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          colorSchemeGradients[colorScheme],
        )}
        aria-hidden="true"
      />
      {/* SVG noise texture overlay */}
      <div
        data-noise
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
    </>
  );

  return (
    <div ref={ref} className={cn(baseClasses, className)} aria-hidden="true">
      {variant === "gradient" && renderGradient()}
      {variant === "mesh" && renderMesh()}
      {variant === "solid" && renderSolid()}
      {variant === "noise" && renderNoise()}
    </div>
  );
}

HeroBackground.displayName = "HeroBackground";
