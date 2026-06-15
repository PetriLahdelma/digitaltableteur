import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import Button from "@dt/Button";
import Title from "@dt/Title";
import { getSemanticIcon } from "../../utils/semanticIcons";
import Icon, { type IconProps } from "@dt/Icon";
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
  /** Header icon size — Icon token scale (default lg for severity dialogs) */
  iconSize?: IconProps["size"];

  // EXISTING PROPS
  /** Controls visibility */
  isOpen: boolean;
  /** Title shown in header */
  title?: string;
  /** Supporting text — wired to aria-describedby (DialogDescription parity) */
  description?: string;
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
  /** Optional className for additional styling on the panel */
  className?: string;
  /** When false, omit the footer region (e.g. composable dialog bodies) */
  showFooter?: boolean;
  /** Ref on the dialog panel for animation hooks */
  panelRef?: React.Ref<HTMLDivElement>;
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

/** Modal dialog for confirmations, forms, and focused tasks with focus trap and Escape close. */
const Modal: React.FC<ModalProps> = ({
  severity,
  isLoading = false,
  titleSize = "S",
  iconSize = "lg",
  isOpen,
  title,
  description,
  titleTerminals = "serif",
  menu,
  children,
  footer,
  onClose,
  icon,
  showCloseIcon = false,
  closeIconName = "x",
  closeButtonLabel = "Close dialog",
  className,
  showFooter,
  panelRef,
}) => {
  const normalizedTitleSize = normalizeTitleSize(titleSize);
  const titleId = useId();
  const descriptionId = useId();
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef || !modalRef.current) return;
    if (typeof panelRef === "function") {
      panelRef(modalRef.current);
      return;
    }
    panelRef.current = modalRef.current;
  }, [isOpen, panelRef]);

  // Apply inert attribute to main content when modal is open
  // This prevents focus from escaping the modal to background content
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    // Store the currently focused element to restore focus on close
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Find the main content container (try common IDs)
    const mainContent =
      document.getElementById("main-content") ||
      document.getElementById("__next") ||
      document.querySelector("main") ||
      document.body.firstElementChild;

    if (mainContent && mainContent !== document.body) {
      // Set inert on main content to prevent focus escape
      mainContent.setAttribute("inert", "");
    }

    // Focus the modal or first focusable element
    const focusFirst = () => {
      if (!modalRef.current) return;
      const focusable = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(focusFirst);

    return () => {
      if (mainContent && mainContent !== document.body) {
        mainContent.removeAttribute("inert");
      }
      // Restore focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !onClose || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const resolvedHeaderIcon =
    icon ??
    (severity
      ? getSemanticIcon(SEVERITY_STATUS_MAP[severity], { size: iconSize })
      : null);

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

  // Determine role based on severity
  // NOTE: Do NOT add aria-live to dialog/alertdialog elements.
  // - role="alertdialog" already implies assertive announcement
  // - role="dialog" is announced when opened
  // Adding aria-live causes double screen reader announcements.
  const dialogRole =
    severity === "error" || severity === "warning" ? "alertdialog" : "dialog";

  // Determine effective variant for CSS class
  const effectiveVariant = isLoading ? "loading" : severity || "default";

  // Use portal to render outside main content for proper inert handling
  const modalContent = (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={[styles.modal, styles[effectiveVariant], className]
          .filter(Boolean)
          .join(" ")}
        role={dialogRole}
        aria-modal="true"
        {...(title
          ? { "aria-labelledby": titleId }
          : { "aria-label": "Dialog" })}
        {...(description ? { "aria-describedby": descriptionId } : {})}
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
                lineHeight="tight"
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
          {isLoading && (
            <div className={styles.spinner} aria-hidden="true" />
          )}
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
          {children}
        </div>
        {showFooter !== false && (footer !== undefined || !isLoading) && (
          <div className={styles.footer}>{renderFooter()}</div>
        )}
      </div>
    </div>
  );

  // Use portal if available (client-side), otherwise render directly
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default Modal;
