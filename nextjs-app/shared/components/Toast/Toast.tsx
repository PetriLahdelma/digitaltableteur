import React, { useEffect } from "react";
import styles from "./Toast.module.css";

export interface ToastProps {
  message: string;
  open: boolean;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  open,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default Toast;
