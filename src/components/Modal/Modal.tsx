import React from "react";
import { FaTimes } from "react-icons/fa";
import styles from "./Modal.module.css";
import Button from "../Button/Button";

export type ModalVariant = "default" | "success" | "error" | "info" | "loading";

export interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Title shown in header */
  title?: string;
  /** Dialog variant styling */
  variant?: ModalVariant;
  /** Optional contextual menu or extra controls */
  menu?: React.ReactNode;
  /** Modal content */
  children?: React.ReactNode;
  /** Footer content, e.g. actions */
  footer?: React.ReactNode;
  /** Close callback */
  onClose?: () => void;
  /** Optional icon to display in the header */
  icon?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  variant = "default",
  menu,
  children,
  footer,
  onClose,
  icon,
}) => {
  if (!isOpen) {
    return null;
  }

  const renderFooter = () => {
    if (footer !== undefined) {
      return footer;
    }
    if (variant !== "loading") {
      return (
        <Button onClick={onClose} variant="primary">
          OK
        </Button>
      );
    }
    return null;
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      {...(title
        ? { "aria-labelledby": "modal-title" }
        : { "aria-label": "Dialog" })}
    >
      <div className={`${styles.modal} ${styles[variant]}`}>
        <div className={styles.header}>
          <div className={styles["left-header"]}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
          </div>
          {onClose && (
            <button
              className={styles["close-button"]}
              onClick={onClose}
              aria-label="Close"
            >
              {FaTimes({})}
            </button>
          )}
        </div>
        <div className={styles.content}>
          {variant === "loading" && <div className={styles.spinner} />}
          {children}
        </div>
        {(footer !== undefined || variant !== "loading") && (
          <div className={styles.footer}>{renderFooter()}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
