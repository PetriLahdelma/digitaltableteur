"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import Button from "../Button/Button";
import { useTranslate } from "../../lib/translation";
import styles from "./ConfirmPopover.module.css";

export interface ConfirmPopoverProps {
  /** The control that opens the confirmation, usually a Button. It keeps its own label and styling. */
  children: React.ReactElement;
  /** The question, for example "Clear the answers in this section?". Names the dialog. */
  title: string;
  /** What happens if the person confirms; describes the dialog. */
  description?: string;
  /** Label of the confirming button; repeat the action, for example "Clear answers". */
  confirmLabel: string;
  /** Label of the cancelling button. @default translated "Cancel" */
  cancelLabel?: string;
  /** "error" for actions that remove or destroy something. @default "neutral" */
  tone?: "neutral" | "error";
  /** Called when the person confirms; the popover then closes. */
  onConfirm: () => void;
  /** Called when the popover opens or closes, whichever way. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred side of the trigger; flips when out of room. @default "top" */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment along that side. @default "start" */
  align?: "start" | "center" | "end";
  /** Extra class on the popover surface. */
  className?: string;
}

/**
 * Asks "are you sure?" next to the control that triggered it, after Ant
 * Design's Popconfirm. A non-modal alertdialog anchored to the trigger: focus
 * starts on Cancel (the safe choice), Escape or a click outside cancels, and
 * focus returns to the trigger. Use it for a single action that is costly to
 * undo; for flows that need more explanation, use Modal.
 */
export function ConfirmPopover({
  children,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "neutral",
  onConfirm,
  onOpenChange,
  side = "top",
  align = "start",
  className,
}: ConfirmPopoverProps) {
  const t = useTranslate();
  const [open, setOpen] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const change = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={change}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          role="alertdialog"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={16}
          className={[styles.content, className].filter(Boolean).join(" ")}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
        >
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
          <div className={styles.actions}>
            <PopoverPrimitive.Close asChild>
              <Button ref={cancelRef} variant="secondary">
                {cancelLabel || t("confirmPopoverCancel", "Cancel")}
              </Button>
            </PopoverPrimitive.Close>
            <Button
              tone={tone}
              onClick={() => {
                change(false);
                onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

ConfirmPopover.displayName = "ConfirmPopover";

export default ConfirmPopover;
