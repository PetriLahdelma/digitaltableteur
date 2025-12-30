import React, { useId } from "react";
import styles from "./Modal.module.css";
import Button from "@dt/Button";
import Title from "@dt/Title";
import { getSemanticIcon } from "../../utils/semanticIcons";
import Icon from "@dt/Icon";
import { warnPropRename } from "../../utils/deprecationWarning";
import { normalizeTitleSize, type TitleSizeUnified } from "../../utils/sizeNormalization";

export type ModalVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export type ModalSeverity = "success" | "error" | "warning" | "info";

export interface ModalProps {
  // NEW PROPS (v1.1.0)
  /** Semantic severity level (v1.1.0+) */
  severity?: ModalSeverity;
  /** Shows loading state with spinner (v1.1.0+) */
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

  // DEPRECATED PROPS
  /** @deprecated Use severity or isLoading instead. Will be removed in v2.0.0 */
  variant?: ModalVariant;
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
  // New props (v1.1.0)
  severity,
  isLoading,
  titleSize = "M",
  // Deprecated props
  variant = "default",
  // Other props
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
  // Deprecation warnings (development only)
  if (process.env.NODE_ENV !== "production") {
    if (variant !== "default" && !severity && !isLoading) {
      warnPropRename(
        "Modal",
        "variant",
        "severity (for success/error/warning/info) or isLoading (for loading state)"
      );
    }
  }

  // Resolve effective values (new props take precedence)
  const effectiveSeverity = severity ?? (variant !== "default" && variant !== "loading" ? variant as ModalSeverity : undefined);
  const effectiveIsLoading = isLoading ?? (variant === "loading");
  const normalizedTitleSize = normalizeTitleSize(titleSize);
  const effectiveVariant = effectiveIsLoading ? "loading" : effectiveSeverity || "default";

  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  const resolvedHeaderIcon =
    icon ??
    (VARIANT_STATUS_MAP[effectiveVariant]
      ? getSemanticIcon(VARIANT_STATUS_MAP[effectiveVariant]!)
      : null);

  const renderFooter = () => {
    if (footer !== undefined) {
      return footer;
    }
    if (!effectiveIsLoading) {
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
    effectiveSeverity === "error" || effectiveSeverity === "warning"
      ? "assertive"
      : effectiveSeverity === "info" || effectiveSeverity === "success"
        ? "polite"
        : undefined;

  // Determine role based on severity
  const dialogRole =
    effectiveSeverity === "error" || effectiveSeverity === "warning" ? "alertdialog" : "dialog";

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
          {effectiveIsLoading && <div className={styles.spinner} />}
          {children}
        </div>
        {(footer !== undefined || !effectiveIsLoading) && (
          <div className={styles.footer}>{renderFooter()}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
