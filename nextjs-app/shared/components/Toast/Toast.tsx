import React, { useEffect } from "react";
import styles from "./Toast.module.css";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export type ToastSeverity = "success" | "error" | "warning" | "info";
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

  if (!isOpen) return null;

  // Determine aria-live based on severity
  const ariaLive = severity === "error" || severity === "warning" ? "assertive" : "polite";

  return (
    <div
      className={[
        styles.toast,
        styles[`toast--${normalizedSize}`],
        severity ? styles[`toast--${severity}`] : "",
        styles[`toast--${position}`],
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live={ariaLive}
    >
      {message}
    </div>
  );
};

export default Toast;
