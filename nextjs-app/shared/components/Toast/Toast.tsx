import React, { useEffect } from "react";
import styles from "./Toast.module.css";
import { warnPropRename } from "../../utils/deprecationWarning";
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
  // NEW PROPS (v1.1.0)
  /** Controls visibility (v1.1.0+) */
  isOpen?: boolean;
  /** Semantic severity level (v1.1.0+) */
  severity?: ToastSeverity;
  /** Position on screen (v1.1.0+) */
  position?: ToastPosition;
  /** Size variant (v1.1.0+) */
  size?: SizeUnified;

  // EXISTING PROPS
  message: string;
  duration?: number;
  onClose?: () => void;

  // DEPRECATED PROPS
  /** @deprecated Use isOpen instead. Will be removed in v2.0.0 */
  open?: boolean;
}

const Toast: React.FC<ToastProps> = ({
  // New props (v1.1.0)
  isOpen,
  severity,
  position = "bottom-center",
  size = "md",
  // Deprecated props
  open,
  // Other props
  message,
  duration = 3000,
  onClose,
}) => {
  // Deprecation warnings (development only)
  if (process.env.NODE_ENV !== "production") {
    if (open !== undefined && isOpen === undefined) {
      warnPropRename("Toast", "open", "isOpen");
    }
  }

  // Resolve effective values (new props take precedence)
  const effectiveIsOpen = isOpen ?? open;
  const normalizedSize = normalizeSizeProp(size);

  useEffect(() => {
    if (!effectiveIsOpen) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [effectiveIsOpen, duration, onClose]);

  if (!effectiveIsOpen) return null;

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
