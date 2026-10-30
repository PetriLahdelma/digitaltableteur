"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import Button from "../Button/Button";
import { KbdShortcut } from "../Kbd/KbdShortcut";
import { useTranslate } from "../../lib/translation";
import styles from "./ConfirmPopover.module.css";

/** One of several actions offered before the confirmation. */
export interface ConfirmPopoverChoice {
  /** Stable key, passed to onConfirm. */
  id: string;
  /** Button label in the first step, for example "Clear this section". */
  label: string;
  /** The confirming question for this choice, for example "Clear the answers in this section?". */
  title: string;
  /** What happens if the person confirms this choice. */
  description?: string;
  /** Label of the confirming button for this choice. */
  confirmLabel: string;
}

export interface ConfirmPopoverProps {
  /** The control that opens the confirmation, usually a Button. It keeps its own label and styling. */
  children: React.ReactElement;
  /** The question, for example "Clear the answers in this section?". Names the dialog. With choices, it asks which one, for example "What do you want to clear?". */
  title: string;
  /** What happens if the person confirms; describes the dialog. */
  description?: string;
  /** Label of the confirming button; repeat the action, for example "Clear answers". Not used with choices, where each choice has its own. */
  confirmLabel?: string;
  /** Several actions to pick from first; picking one asks "are you sure?" with that choice's question and labels. */
  choices?: ConfirmPopoverChoice[];
  /** Label of the cancelling button. @default translated "Cancel" */
  cancelLabel?: string;
  /** "error" for actions that remove or destroy something. @default "neutral" */
  tone?: "neutral" | "error";
  /** Called when the person confirms, with the picked choice's id when there are choices; the popover then closes. */
  onConfirm: (choiceId?: string) => void;
  /** Called when the popover opens or closes, whichever way. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred side of the trigger; flips when out of room. @default "top" */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment along that side. @default "start" */
  align?: "start" | "center" | "end";
  /** Draws a pointer from the popover's edge to the trigger, like a speech bubble. @default false */
  arrow?: boolean;
  /** Keys that run the action without the popover, one entry per key; shown under the description so the next time can skip the question. */
  shortcut?: string[];
  /** Extra class on the popover surface. */
  className?: string;
}

/**
 * Asks "are you sure?" next to the control that triggered it, after Ant
 * Design's Popconfirm. A non-modal alertdialog anchored to the trigger: focus
 * starts on Cancel (the safe choice), Escape or a click outside cancels, and
 * focus returns to the trigger. Use it for a single action that is costly to
 * undo, or with `choices` for a few related ones (pick, then confirm); for
 * flows that need more explanation, use Modal.
 */
export function ConfirmPopover({
  children,
  title,
  description,
  confirmLabel,
  choices,
  cancelLabel,
  tone = "neutral",
  onConfirm,
  onOpenChange,
  side = "top",
  align = "start",
  arrow = false,
  shortcut,
  className,
}: ConfirmPopoverProps) {
  const t = useTranslate();
  const [open, setOpen] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const firstChoiceRef = React.useRef<HTMLButtonElement>(null);
  // Set while the first step gives way to the confirmation, so its unmount
  // does not send focus back to the trigger.
  const swapping = React.useRef(false);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const [picked, setPicked] = React.useState<ConfirmPopoverChoice | null>(null);

  const change = (next: boolean) => {
    setOpen(next);
    if (!next) setPicked(null);
    onOpenChange?.(next);
  };

  // The confirmation step mounts as a new dialog without Radix's open
  // auto-focus, so focus is moved to its Cancel here.
  React.useEffect(() => {
    if (picked) cancelRef.current?.focus();
  }, [picked]);

  const choosing = Boolean(choices?.length) && !picked;
  const shownTitle = picked ? picked.title : title;
  const shownDescription = picked ? picked.description : description;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={change}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          // A new dialog per step: picking a choice mounts the confirmation
          // afresh, so screen readers announce its question and consequence
          // when focus lands on Cancel, as they did for the first step.
          key={picked?.id ?? "choose"}
          role="alertdialog"
          aria-labelledby={titleId}
          aria-describedby={shownDescription ? descriptionId : undefined}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={16}
          className={[styles.content, className].filter(Boolean).join(" ")}
          onCloseAutoFocus={(event) => {
            if (!swapping.current) return;
            swapping.current = false;
            event.preventDefault();
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            // Choosing is safe (a confirmation follows), so it starts on the
            // first choice; the confirmation starts on Cancel.
            (choosing ? firstChoiceRef.current : cancelRef.current)?.focus();
          }}
        >
          <p id={titleId} className={styles.title}>
            {shownTitle}
          </p>
          {shownDescription ? (
            <p id={descriptionId} className={styles.description}>
              {shownDescription}
            </p>
          ) : null}
          {shortcut?.length ? (
            <p className={styles.shortcut}>
              <KbdShortcut keys={shortcut} />
            </p>
          ) : null}
          {choosing ? (
            <div className={styles.choices}>
              {choices?.map((choice, index) => (
                <Button
                  key={choice.id}
                  ref={index === 0 ? firstChoiceRef : undefined}
                  variant="secondary"
                  tone={tone}
                  onClick={() => {
                    swapping.current = true;
                    setPicked(choice);
                  }}
                >
                  {choice.label}
                </Button>
              ))}
            </div>
          ) : null}
          <div className={styles.actions}>
            <PopoverPrimitive.Close asChild>
              <Button ref={cancelRef} variant="secondary">
                {cancelLabel || t("confirmPopoverCancel", "Cancel")}
              </Button>
            </PopoverPrimitive.Close>
            {choosing ? null : (
              <Button
                tone={tone}
                onClick={() => {
                  const choiceId = picked?.id;
                  change(false);
                  onConfirm(choiceId);
                }}
              >
                {picked ? picked.confirmLabel : confirmLabel}
              </Button>
            )}
          </div>
          {arrow ? (
            <PopoverPrimitive.Arrow asChild width={16} height={8}>
              {/* The fill covers the surface's border where the pointer joins
                  it; the stroke carries the border round the point. */}
              <svg className={styles.arrow} viewBox="0 0 16 8" aria-hidden="true">
                <path className={styles.arrowFill} d="M0 0 L8 8 L16 0 Z" />
                <path className={styles.arrowStroke} d="M0 0 L8 8 L16 0" />
              </svg>
            </PopoverPrimitive.Arrow>
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

ConfirmPopover.displayName = "ConfirmPopover";

export default ConfirmPopover;
