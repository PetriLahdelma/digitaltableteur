import React from "react";
import { FaTimes } from "react-icons/fa";
import styles from "./Modal.module.css";
import Button from "../Button/Button";

export type ModalVariant = "default" | "success" | "error" | "loading";

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
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  variant = "default",
  menu,
  children,
  footer,
  onClose,
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
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={`${styles.modal} ${styles[variant]}`}>
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <div className={styles.menu}>
            {menu}
            {onClose && (
              <button
                className={styles["close-button"]}
                onClick={onClose}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            )}
          </div>
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
