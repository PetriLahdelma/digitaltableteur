"use client";

import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import Toast, {
  type ToastPosition,
  type ToastTone,
} from "../Toast/Toast";
import { cn } from "../../lib/cn";
import styles from "./ToastStack.module.css";

export const toastStackVariants = cva(styles.stack, {
  variants: {
    position: {
      "top-left": styles["stack--top-left"],
      "top-center": styles["stack--top-center"],
      "top-right": styles["stack--top-right"],
      "bottom-left": styles["stack--bottom-left"],
      "bottom-center": styles["stack--bottom-center"],
      "bottom-right": styles["stack--bottom-right"],
    },
  },
  defaultVariants: { position: "bottom-center" },
});

export interface ToastStackItem {
  /** Stable identity for dismissal and list rendering. */
  id: string;
  /** Message text displayed in the toast. */
  message: string;
  /** Semantic colour. */
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. @default 3000 */
  duration?: number;
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
}

export interface ToastStackProps {
  /** Toasts to display, oldest first; new toasts are appended by the caller. */
  toasts: ToastStackItem[];
  /** Screen corner/edge the stack docks to. @default "bottom-center" */
  position?: ToastPosition;
  /** Called with the toast id when its auto-dismiss timer fires. */
  onDismiss?: (id: string) => void;
  /**
   * Maximum toasts rendered at once; older ones wait (their timers only run
   * while rendered), so bursts drain in order. @default 5
   */
  max?: number;
  /** Optional classes on the stack wrapper. */
  className?: string;
}

/**
 * Docked stack of transient toasts. Owns the fixed placement that a lone
 * `Toast` handles itself: children render inline and the stack lays them out
 * with the newest toast nearest the docked screen edge. Each toast keeps its
 * own live region and auto-dismiss timer, so messages announce independently
 * instead of replacing each other.
 */
const ToastStack = forwardRef<HTMLDivElement, ToastStackProps>(
  function ToastStack(
    { toasts, position = "bottom-center", onDismiss, max = 5, className },
    ref,
  ) {
    const visible = toasts.slice(-Math.max(1, max));

    return (
      <div
        ref={ref}
        className={cn(toastStackVariants({ position }), className)}
      >
        {visible.map((toast) => (
          <Toast
            key={toast.id}
            inline
            open
            message={toast.message}
            tone={toast.tone}
            duration={toast.duration}
            size={toast.size}
            onClose={onDismiss ? () => onDismiss(toast.id) : undefined}
          />
        ))}
      </div>
    );
  },
);

export default ToastStack;
