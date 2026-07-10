import { forwardRef, useEffect, type ReactNode } from "react";
import styles from "./Toast.module.css";
import { CheckCircle, Warning, XCircle, Info } from "@phosphor-icons/react";

export type ToastTone = "success" | "error" | "warning" | "info";

// Direct Phosphor icons for color-independent meaning (WCAG 1.4.1).
const toneIcons: Record<ToastTone, ReactNode> = {
  success: <CheckCircle weight="fill" aria-hidden="true" />,
  error: <XCircle weight="fill" aria-hidden="true" />,
  warning: <Warning weight="fill" aria-hidden="true" />,
  info: <Info weight="fill" aria-hidden="true" />,
};

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastProps {
  /** Controls visibility. */
  open?: boolean;
  /** Semantic colour. */
  tone?: ToastTone;
  /** Position on screen. @default "bottom-center" */
  position?: ToastPosition;
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Message text displayed in the toast. */
  message: string;
  /** Auto-dismiss delay in ms. @default 3000 */
  duration?: number;
  /** Called when the auto-dismiss timer fires. */
  onClose?: () => void;
  /**
   * Render in normal document flow instead of fixed-positioning itself; a
   * parent (ToastStack) owns placement. `position` is ignored when set.
   */
  inline?: boolean;
}

/**
 * Transient toast notification with tone and auto-dismiss. The element stays
 * mounted as a live region (the message swaps in/out) so assistive tech reliably
 * announces it; visibility is animated via opacity/translate rather than an
 * AnimatePresence mount/unmount, which would defeat the live region.
 */
const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { open, tone, position = "bottom-center", size = "md", message, duration = 3000, onClose, inline },
  ref,
) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  const isVisible = Boolean(open);
  const displayMessage = isVisible ? message : "";

  // Error/warning interrupt (assertive); everything else is a polite status.
  const isAssertive = tone === "error" || tone === "warning";

  const toneIcon = tone ? toneIcons[tone] : null;

  return (
    <div
      ref={ref}
      className={[
        styles.toast,
        styles[`toast--${size}`],
        tone ? styles[`toast--${tone}`] : "",
        inline ? styles["toast--inline"] : styles[`toast--${position}`],
        !isVisible ? styles["toast--hidden"] : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={isAssertive ? "alert" : "status"}
      aria-live={isAssertive ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {toneIcon && (
        <span className={styles.icon} aria-hidden="true">
          {toneIcon}
        </span>
      )}
      <span className={styles.message}>{displayMessage}</span>
    </div>
  );
});

export default Toast;
