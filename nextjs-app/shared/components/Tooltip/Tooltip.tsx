"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  ArrowFatUp,
  Backspace,
  Command,
  Control,
  KeyReturn,
  Option,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { Fragment, type ReactNode } from "react";
import { useTranslate } from "../../lib/translation";
import Kbd from "../Kbd";
import styles from "./Tooltip.module.css";

export function TooltipProvider({
  delayDuration = 200,
  children,
}: {
  delayDuration?: number;
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: {
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </TooltipPrimitive.Root>
  );
}

export function TooltipTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Trigger asChild={asChild}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}

/**
 * Props for `TooltipContent`, the content bubble and the tooltip's primary
 * documented control surface.
 */
export interface TooltipProps {
  /** Extra class on the content bubble. */
  className?: string;
  /** Preferred placement relative to the trigger; flips when out of room. */
  side?: "top" | "right" | "bottom" | "left";
  /** Gap in px between the trigger and the bubble. */
  sideOffset?: number;
  /** Hint content — a short phrase, never interactive. */
  children: ReactNode;
  /**
   * Keyboard shortcut for the trigger's action, one entry per key
   * (`["⌘", "⇧", "⌫"]`). Rendered after the label as keycaps drawn for the
   * tooltip's dark surface.
   */
  shortcut?: string[];
}

/* Modifier symbols are drawn as icons: no text face carries ⌘ ⇧ ⌫, so as text
   they fall back to a system font at the wrong size and weight. The key's name
   stays in the DOM for assistive technology. */
const KEY_ICONS: Record<string, { Glyph: PhosphorIcon; nameKey: string }> = {
  "⌘": { Glyph: Command, nameKey: "tooltip.keys.command" },
  "⇧": { Glyph: ArrowFatUp, nameKey: "tooltip.keys.shift" },
  "⌫": { Glyph: Backspace, nameKey: "tooltip.keys.backspace" },
  "⌥": { Glyph: Option, nameKey: "tooltip.keys.option" },
  "⌃": { Glyph: Control, nameKey: "tooltip.keys.control" },
  "↵": { Glyph: KeyReturn, nameKey: "tooltip.keys.return" },
};

function ShortcutKey({ value }: { value: string }) {
  const t = useTranslate();
  const glyph = KEY_ICONS[value];
  return (
    <Kbd size="sm" variant="secondary" className={styles.key}>
      {glyph ? (
        <>
          <glyph.Glyph aria-hidden="true" className={styles.keyIcon} />
          <span className={styles.keyName}>{t(glyph.nameKey)}</span>
        </>
      ) : (
        <span className={styles.keyWord}>{value}</span>
      )}
    </Kbd>
  );
}

export function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  children,
  shortcut,
}: TooltipProps) {
  const hasShortcut = Boolean(shortcut?.length);
  const mergedClassName = [styles.content, hasShortcut && styles.withShortcut, className]
    .filter(Boolean)
    .join(" ");
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={side}
        sideOffset={sideOffset}
        className={mergedClassName}
      >
        {children}
        {hasShortcut ? (
          <span className={styles.shortcut}>
            {shortcut?.map((key, index) => (
              <Fragment key={key}>
                {index > 0 ? <span className={styles.plus}>+</span> : null}
                <ShortcutKey value={key} />
              </Fragment>
            ))}
          </span>
        ) : null}
        <TooltipPrimitive.Arrow className={styles.arrow} width={10} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
