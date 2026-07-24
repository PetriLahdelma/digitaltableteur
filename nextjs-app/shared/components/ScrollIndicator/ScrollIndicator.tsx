"use client";

import { useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { gsap, useGSAP } from "../../lib/gsap";
import { useAnimationContext } from "../../lib/animation";
import { cn } from "../../lib/cn";

export interface ScrollIndicatorProps {
  /** ID of the target element to scroll to */
  targetId?: string;
  /** Optional text label */
  label?: string;
  /** Icon variant */
  variant?: "arrow" | "mouse" | "chevron";
  /** Horizontal position */
  position?: "center" | "left" | "right";
  /** Looping motion applied to the icon as a hint to scroll. */
  motion?: "bounce" | "pulse" | "fade" | "none";
  /** Duration of one motion half-cycle, in seconds. */
  speed?: number;
  /** Vertical travel of the bounce motion, in pixels (bounce only). */
  distance?: number;
  /** Custom className for styling */
  className?: string;
}

const positionClasses: Record<NonNullable<ScrollIndicatorProps["position"]>, string> = {
  center: "left-1/2 -translate-x-1/2",
  left: "left-8",
  right: "right-8",
};

export function ScrollIndicator({
  targetId,
  label,
  variant = "chevron",
  position = "center",
  motion = "bounce",
  speed = 0.6,
  distance = 8,
  className,
}: ScrollIndicatorProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const { motionPreference } = useAnimationContext();

  // Scroll to target element
  const handleClick = useCallback(() => {
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [targetId]);

  useGSAP(
    () => {
      const el = iconRef.current;
      if (!el) return;

      // Skip the motion hint for reduced motion; keep the icon at rest.
      if (motionPreference === "reduced") {
        gsap.set(el, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      // Mount reveal. Use fromTo with an explicit opacity:1 end rather than
      // gsap.from: from() is not idempotent, so when useGSAP re-runs (React
      // StrictMode double-mount, or a motionPreference change) the second pass
      // would read the already-0 opacity as its end value and animate 0 -> 0,
      // leaving the icon permanently invisible. The fade preset animates
      // opacity itself, so it only needs the resting value set.
      if (motion === "fade") {
        gsap.set(el, { opacity: 1 });
      } else {
        gsap.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, delay: 1.5, ease: "power2.out" }
        );
      }

      // Looping motion hint for the current preset.
      const loop = {
        duration: speed,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      } as const;
      if (motion === "pulse") gsap.to(el, { ...loop, scale: 1.12 });
      else if (motion === "fade") gsap.to(el, { ...loop, opacity: 0.35 });
      else if (motion === "bounce") gsap.to(el, { ...loop, y: distance });
      // motion === "none": reveal only, no loop.
    },
    // revertOnUpdate matters: the provider resolves prefers-reduced-motion in
    // a post-mount effect, so the reduced gate flips AFTER the loop starts —
    // without revert, the infinite yoyo keeps running for reduced-motion users.
    // The motion props are dependencies so Storybook controls re-run the effect.
    {
      scope: ref,
      dependencies: [motionPreference, motion, speed, distance],
      revertOnUpdate: true,
    }
  );

  // Pause the loop on hover, settling the icon to its resting transform.
  const handleMouseEnter = useCallback(() => {
    const el = iconRef.current;
    if (!el || motionPreference === "reduced") return;
    gsap.killTweensOf(el);
    gsap.to(el, { y: 0, scale: 1, opacity: 1, duration: 0.2 });
  }, [motionPreference]);

  // Restart the loop for the current preset when the pointer leaves.
  const handleMouseLeave = useCallback(() => {
    const el = iconRef.current;
    if (!el || motionPreference === "reduced" || motion === "none") return;
    const loop = {
      duration: speed,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
    } as const;
    if (motion === "pulse") gsap.to(el, { ...loop, scale: 1.12 });
    else if (motion === "fade") gsap.to(el, { ...loop, opacity: 0.35 });
    else gsap.to(el, { ...loop, y: distance });
  }, [motion, speed, distance, motionPreference]);

  const renderIcon = () => {
    const iconProps = {
      className: "size-6",
      strokeWidth: 1.5,
      "aria-hidden": true as const,
    };

    switch (variant) {
      case "arrow":
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        );
      case "mouse":
        return (
          <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="6" />
            <line x1="12" y1="7" x2="12" y2="11" />
          </svg>
        );
      case "chevron":
      default:
        return <ChevronDown {...iconProps} />;
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "absolute bottom-8 flex flex-col items-center gap-2",
        "text-foreground/70 hover:text-foreground",
        "transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        positionClasses[position],
        className
      )}
      aria-label={label || "Scroll to content"}
    >
      {label && (
        <span className="text-sm font-body tracking-wide">{label}</span>
      )}
      <span ref={iconRef} className="block">
        {renderIcon()}
      </span>
    </button>
  );
}

ScrollIndicator.displayName = "ScrollIndicator";
