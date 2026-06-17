import React, { useEffect, type ReactNode } from "react";
import styles from "./Toast.module.css";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";
import { CheckCircle, Warning, XCircle, Info } from "@phosphor-icons/react";

export type ToastSeverity = "success" | "error" | "warning" | "info";

// Direct Phosphor icons for better alignment (matches Toaster pattern)
const severityIcons: Record<ToastSeverity, ReactNode> = {
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
  // v2.0.0 PROPS
  /** Controls visibility */
  isOpen?: boolean;
  /** Semantic severity level */
  severity?: ToastSeverity;
  /** Position on screen */
  position?: ToastPosition;
  /** Size variant */
  size?: SizeUnified;

  // EXISTING PROPS
  message: string;
  duration?: number;
  onClose?: () => void;
}

/** Transient toast notification with severity and auto-dismiss. */
const Toast: React.FC<ToastProps> = ({
  isOpen,
  severity,
  position = "bottom-center",
  size = "md",
  message,
  duration = 3000,
  onClose,
}) => {
  const normalizedSize = normalizeSizeProp(size);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  const isVisible = Boolean(isOpen);
  const displayMessage = isVisible ? message : "";

  const liveRole =
    severity === "error" || severity === "warning" ? "alert" : "status";

  // Get icon for severity (color independence - WCAG 1.4.1)
  const severityIcon = severity ? severityIcons[severity] : null;

  return (
    <div
      className={[
        styles.toast,
        styles[`toast--${normalizedSize}`],
        severity ? styles[`toast--${severity}`] : "",
        styles[`toast--${position}`],
        !isVisible ? styles["toast--hidden"] : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={liveRole}
      aria-atomic="true"
    >
      {severityIcon && (
        <span className={styles.icon} aria-hidden="true">
          {severityIcon}
        </span>
      )}
      <span className={styles.message}>{displayMessage}</span>
    </div>
  );
};

export default Toast;
