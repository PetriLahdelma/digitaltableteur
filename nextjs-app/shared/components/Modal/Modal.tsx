import React, { useId } from "react";
import styles from "./Modal.module.css";
import Button from "@dt/Button";
import Title from "@dt/Title";
import { getSemanticIcon } from "../../utils/semanticIcons";
import Icon from "@dt/Icon";
import { normalizeTitleSize, type TitleSizeUnified } from "../../utils/sizeNormalization";

export type ModalSeverity = "success" | "error" | "warning" | "info";

export interface ModalProps {
  // v2.0.0 PROPS
  /** Semantic severity level */
  severity?: ModalSeverity;
  /** Shows loading state with spinner */
  isLoading?: boolean;
  /** Title size - supports both modern (sm/md/lg) and legacy (S/M/L) formats */
  titleSize?: TitleSizeUnified;

  // EXISTING PROPS
  /** Controls visibility */
  isOpen: boolean;
  /** Title shown in header */
  title?: string;
  /** Title terminals (sans or serif) */
  titleTerminals?: "sans" | "serif";
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
  /** Custom close icon name (defaults to "x") */
  closeIconName?: string;
  /** Custom close button aria-label */
  closeButtonLabel?: string;
}

const SEVERITY_STATUS_MAP: Record<
  ModalSeverity,
  Parameters<typeof getSemanticIcon>[0]
> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

const Modal: React.FC<ModalProps> = ({
  severity,
  isLoading = false,
  titleSize = "M",
  isOpen,
  title,
  titleTerminals = "serif",
  menu,
  children,
  footer,
  onClose,
  icon,
  showCloseIcon = true,
  closeIconName = "x",
  closeButtonLabel = "Close dialog",
}) => {
  const normalizedTitleSize = normalizeTitleSize(titleSize);

  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  const resolvedHeaderIcon =
    icon ??
    (severity ? getSemanticIcon(SEVERITY_STATUS_MAP[severity]) : null);

  const renderFooter = () => {
    if (footer !== undefined) {
      return footer;
    }
    if (!isLoading) {
      return (
        <Button onClick={onClose} variant="primary">
          OK
        </Button>
      );
    }
    return null;
  };

  // Determine aria-live based on severity
  const ariaLive =
    severity === "error" || severity === "warning"
      ? "assertive"
      : severity === "info" || severity === "success"
        ? "polite"
        : undefined;

  // Determine role based on severity
  const dialogRole =
    severity === "error" || severity === "warning" ? "alertdialog" : "dialog";

  // Determine effective variant for CSS class
  const effectiveVariant = isLoading ? "loading" : severity || "default";

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
        className={`${styles.modal} ${styles[effectiveVariant]}`}
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
                level={2}
                size={normalizedTitleSize}
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
                aria-label={closeButtonLabel}
              >
                <Icon name={closeIconName} decorative />
              </button>
            )}
          </div>
        )}
        <div className={styles.content}>
          {isLoading && <div className={styles.spinner} />}
          {children}
        </div>
        {(footer !== undefined || !isLoading) && (
          <div className={styles.footer}>{renderFooter()}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
