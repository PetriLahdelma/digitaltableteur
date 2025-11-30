import React, { useId } from "react";
import styles from "./Modal.module.css";
import Button from "@dt/Button";
import Title from "@dt/Title";
import { getSemanticIcon } from "../../utils/semanticIcons";
import Icon from "@dt/Icon";

export type ModalVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Title shown in header */
  title?: string;
  /** Title terminals (sans or serif) */
  titleTerminals?: "sans" | "serif";
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
  /** Optional className for additional styling */
  className?: string;
  /** Show close icon button in header */
  showCloseIcon?: boolean;
}

const VARIANT_STATUS_MAP: Partial<
  Record<ModalVariant, Parameters<typeof getSemanticIcon>[0]>
> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  titleTerminals = "serif",
  variant = "default",
  menu,
  children,
  footer,
  onClose,
  icon,
  showCloseIcon = true,
}) => {
  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  const resolvedHeaderIcon =
    icon ??
    (VARIANT_STATUS_MAP[variant]
      ? getSemanticIcon(VARIANT_STATUS_MAP[variant]!)
      : null);

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

  // Determine aria-live based on variant
  const ariaLive =
    variant === "error" || variant === "warning"
      ? "assertive"
      : variant === "info" || variant === "success"
        ? "polite"
        : undefined;

  // Determine role based on variant
  const dialogRole =
    variant === "error" || variant === "warning" ? "alertdialog" : "dialog";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`${styles.modal} ${styles[variant]}`}
        role={dialogRole}
        aria-modal="true"
        aria-live={ariaLive}
        {...(title
          ? { "aria-labelledby": titleId }
          : { "aria-label": "Dialog" })}
      >
        {title && (
          <div className={styles.header}>
            <div className={styles.leftHeader}>
              {resolvedHeaderIcon && (
                <span className={styles.icon}>{resolvedHeaderIcon}</span>
              )}
              <Title
                size="XS"
                level={2}
                id={titleId}
                className={styles.title}
                terminals={titleTerminals}
              >
                {title}
              </Title>
            </div>
            {onClose && showCloseIcon && (
              <button
                type="button"
                className={styles["closeButton"]}
                onClick={onClose}
                aria-label="Close dialog"
              >
                <Icon name="x" decorative />
              </button>
            )}
          </div>
        )}
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
