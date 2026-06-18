"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import Modal, { type ModalProps } from "@dt/Modal";
import Title from "@dt/Title";
import styles from "./AnimatedDialog.module.css";

type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
type DialogSeverity = "default" | "success" | "warning" | "error" | "info";
type AnimationType = "scale" | "slide" | "fade";

const sizeClassMap: Record<DialogSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  full: styles.sizeFull,
};

const severityClassMap: Record<Exclude<DialogSeverity, "default">, string> = {
  success: styles.severitySuccess,
  warning: styles.severityWarning,
  error: styles.severityError,
  info: styles.severityInfo,
};

const AnimatedDialogContext = createContext<(() => void) | null>(null);

export interface AnimatedDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  trigger?: ReactNode;
  size?: DialogSize;
  severity?: DialogSeverity;
  animationType?: AnimationType;
  className?: string;
}

export function AnimatedDialog({
  open = false,
  onOpenChange,
  children,
  trigger,
  size = "md",
  severity = "default",
  animationType = "scale",
  className,
}: AnimatedDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => onOpenChange?.(false);

  useEffect(() => {
    if (!open || !panelRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (animationType === "scale") {
        gsap.from(panelRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      } else if (animationType === "slide") {
        gsap.from(panelRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      } else if (animationType === "fade") {
        gsap.from(panelRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    }, panelRef);

    return () => ctx.revert();
  }, [open, animationType]);

  const modalSeverity: ModalProps["severity"] =
    severity === "default" ? undefined : severity;

  const panelClassName = [
    sizeClassMap[size],
    severity !== "default" ? severityClassMap[severity] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimatedDialogContext.Provider value={close}>
      {trigger && (
        <span
          role="presentation"
          onClick={() => onOpenChange?.(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenChange?.(true);
            }
          }}
        >
          {trigger}
        </span>
      )}
      <Modal
        isOpen={open}
        onClose={close}
        severity={modalSeverity}
        showFooter={false}
        showCloseIcon={false}
        className={panelClassName}
        panelRef={panelRef}
      >
        {children}
      </Modal>
    </AnimatedDialogContext.Provider>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const merged = [styles.header, className].filter(Boolean).join(" ");
  return <div className={merged}>{children}</div>;
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const merged = [styles.footer, className].filter(Boolean).join(" ");
  return <div className={merged}>{children}</div>;
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Title level={2} size="s" className={className}>
      {children}
    </Title>
  );
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const merged = [styles.description, className].filter(Boolean).join(" ");
  return <p className={merged}>{children}</p>;
}

export function DialogClose({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  const close = useContext(AnimatedDialogContext);

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children as React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>,
      {
        onClick: (event: React.MouseEvent) => {
          (
            children as React.ReactElement<{
              onClick?: (event: React.MouseEvent) => void;
            }>
          ).props.onClick?.(event);
          close?.();
        },
      },
    );
  }

  return (
    <button type="button" onClick={() => close?.()}>
      {children}
    </button>
  );
}
