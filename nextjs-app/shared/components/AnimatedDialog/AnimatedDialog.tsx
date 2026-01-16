"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
type DialogSeverity = "default" | "success" | "warning" | "error" | "info";
type AnimationType = "scale" | "slide" | "fade";

export interface AnimatedDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  trigger?: ReactNode;
  size?: DialogSize;
  severity?: DialogSeverity;
  animationType?: AnimationType;
  className?: string;
}

export function AnimatedDialog({
  open,
  onOpenChange,
  children,
  trigger,
  size = "md",
  severity = "default",
  animationType = "scale",
  className,
}: AnimatedDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !contentRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Entry animation based on type
      if (animationType === "scale") {
        gsap.from(contentRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      } else if (animationType === "slide") {
        gsap.from(contentRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      } else if (animationType === "fade") {
        gsap.from(contentRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, [open, animationType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        ref={contentRef}
        size={size}
        severity={severity}
        className={className}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Re-export dialog parts for convenience
export {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
