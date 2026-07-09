import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import styles from "./Modal.module.css";
import Button from "@dt/Button";
import Spinner from "@dt/Spinner";
import Title from "@dt/Title";
import { getSemanticIcon } from "../../utils/semanticIcons";
import Icon, { type IconProps } from "@dt/Icon";
import { normalizeTitleSize, type TitleSizeUnified } from "../../utils/sizeNormalization";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useLayer } from "../../lib/layer";

export type ModalSeverity = "success" | "error" | "warning" | "info";
export type ModalAnimation = "none" | "scale" | "slide" | "fade";

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
  /** Entrance animation applied to the panel on open (respects prefers-reduced-motion) */
  animation?: ModalAnimation;
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
  menu,
  children,
  footer,
  onClose,
  icon,
  showCloseIcon = false,
  closeIconName = "x",
  closeButtonLabel = "Close dialog",
  className,
  showFooter = true,
  panelRef,
  animation = "none",
}) => {
  const normalizedTitleSize = normalizeTitleSize(titleSize);
  const titleId = useId();
  const descriptionId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const { container: layerContainer } = useLayer({ role: "modal" });

  useEffect(() => {
    if (!panelRef || !modalRef.current) return;
    if (typeof panelRef === "function") {
      panelRef(modalRef.current);
      return;
    }
    panelRef.current = modalRef.current;
  }, [isOpen, panelRef]);

  // Entrance animation for the panel, gated on prefers-reduced-motion.
  useEffect(() => {
    if (!isOpen || animation === "none" || !modalRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (animation === "scale") {
        gsap.from(modalRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      } else if (animation === "slide") {
        gsap.from(modalRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      } else if (animation === "fade") {
        gsap.from(modalRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    }, modalRef);

    return () => ctx.revert();
  }, [isOpen, animation]);

  // Focus trap: inert the background, focus first focusable, restore on close.
  useFocusTrap(modalRef, isOpen);
  // Lock background scroll while the modal is open.
  useScrollLock(isOpen);

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
        data-animation={animation === "none" ? undefined : animation}
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
              >
                {title}
              </Title>
            </div>
            {/* Contract slot (.menu styles predate this wiring): contextual
                menu or extra controls between the title and the close icon. */}
            {menu && <div className={styles.menu}>{menu}</div>}
            {onClose && showCloseIcon && (
              <button
                type="button"
                className={styles["closeButton"]}
                onClick={onClose}
                /* || not destructure defaults alone: "" (e.g. a cleared/seeded
                   Controls text field) must fall back, never render an
                   unnamed button or a nameless icon */
                aria-label={closeButtonLabel || "Close dialog"}
              >
                <Icon name={closeIconName || "x"} decorative />
              </button>
            )}
          </div>
        )}
        <div className={styles.content}>
          {isLoading && <Spinner size="lg" />}
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
  if (layerContainer) {
    return createPortal(modalContent, layerContainer);
  }

  return modalContent;
};

export default Modal;
