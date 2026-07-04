"use client";

import { useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import { cn } from "@/lib/utils";

export interface ScrollIndicatorProps {
  /** ID of the target element to scroll to */
  targetId?: string;
  /** Optional text label */
  label?: string;
  /** Icon variant */
  variant?: "arrow" | "mouse" | "chevron";
  /** Horizontal position */
  position?: "center" | "left" | "right";
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

  // Bouncing animation
  useGSAP(
    () => {
      if (!iconRef.current) return;

      // Skip animation for reduced motion
      if (motionPreference === "reduced") {
        gsap.set(iconRef.current, { opacity: 1 });
        return;
      }

      // Bouncing animation
      gsap.to(iconRef.current, {
        y: 8,
        duration: 0.6,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Fade in on mount
      gsap.from(iconRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        delay: 1.5,
        ease: "power2.out",
      });
    },
    // revertOnUpdate matters: the provider resolves prefers-reduced-motion in
    // a post-mount effect, so the reduced gate flips AFTER the bounce starts —
    // without revert, the infinite yoyo keeps running for reduced-motion users.
    { scope: ref, dependencies: [motionPreference], revertOnUpdate: true }
  );

  // Pause animation on hover
  const handleMouseEnter = useCallback(() => {
    if (iconRef.current && motionPreference !== "reduced") {
      gsap.killTweensOf(iconRef.current);
      gsap.to(iconRef.current, { y: 0, duration: 0.2 });
    }
  }, [motionPreference]);

  const handleMouseLeave = useCallback(() => {
    if (iconRef.current && motionPreference !== "reduced") {
      gsap.to(iconRef.current, {
        y: 8,
        duration: 0.6,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
  }, [motionPreference]);

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
        <span className="text-xs font-body uppercase tracking-widest">
          {label}
        </span>
      )}
      <span ref={iconRef} className="block">
        {renderIcon()}
      </span>
    </button>
  );
}

ScrollIndicator.displayName = "ScrollIndicator";
