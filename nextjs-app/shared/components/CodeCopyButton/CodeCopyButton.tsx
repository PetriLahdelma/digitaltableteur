"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { useTranslate } from "../../lib/translation";
import { copyTextToClipboard } from "../../lib/code/clipboard";
import { cn } from "../../lib/cn";
import styles from "./CodeCopyButton.module.css";

export type CodeCopyButtonStatus = "idle" | "copied" | "error";
export type CodeCopyButtonSize = "sm" | "md";

/** Glyph px per size: sm suits code surfaces, md matches Button md and the
 *  20px icons that sit beside body text (Link's external icon). */
const GLYPH_SIZE: Record<CodeCopyButtonSize, number> = { sm: 16, md: 20 };

export interface CodeCopyButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "onCopy" | "children"
  > {
  /** Text to copy, or a function that returns it at click time. */
  value: string | (() => string);
  /** Accessible name. @default "Copy code" (translated) */
  label?: string;
  /** Called with the copied text after a successful copy. */
  onCopy?: (text: string) => void;
  /** How long the check mark stays, in milliseconds. @default 1600 */
  resetAfterMs?: number;
  /** Size token: sm (28px, code surfaces) or md (40px, beside body text). @default "sm" */
  size?: CodeCopyButtonSize;
}

/**
 * Icon-only copy control for code surfaces (CodeBlock, Snippet). The copy
 * glyph swaps to a check for a moment after a successful copy; a polite
 * live region announces the result, because the swap alone is silent.
 */
export const CodeCopyButton = React.forwardRef<
  HTMLButtonElement,
  CodeCopyButtonProps
>(
  (
    {
      value,
      label,
      onCopy,
      resetAfterMs = 1600,
      size = "sm",
      className,
      disabled,
      onClick,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const t = useTranslate();
    const [status, setStatus] = useState<CodeCopyButtonStatus>("idle");
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
      () => () => {
        if (resetTimer.current) clearTimeout(resetTimer.current);
      },
      [],
    );

    const settle = (next: CodeCopyButtonStatus, afterMs: number) => {
      setStatus(next);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setStatus("idle"), afterMs);
    };

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const text = typeof value === "function" ? value() : value;
      if (!text) return;
      try {
        await copyTextToClipboard(text);
        settle("copied", resetAfterMs);
        onCopy?.(text);
      } catch {
        settle("error", resetAfterMs + 600);
      }
    };

    const announcement =
      status === "copied"
        ? t("codeCopyButton.copied")
        : status === "error"
          ? t("codeCopyButton.copyFailed")
          : "";

    return (
      <span className={cn(styles.root, className)}>
        <button
          ref={ref}
          type={type}
          className={cn(styles.button, size === "md" && styles.md)}
          data-size={size}
          aria-label={label || t("codeCopyButton.copy")}
          data-status={status}
          disabled={disabled}
          onClick={handleClick}
          {...rest}
        >
          {status === "copied" ? (
            <Check className={styles.icon} size={GLYPH_SIZE[size]} weight="bold" aria-hidden="true" />
          ) : (
            <Copy className={styles.icon} size={GLYPH_SIZE[size]} weight="bold" aria-hidden="true" />
          )}
        </button>
        <span className={styles.visuallyHidden} role="status" aria-live="polite">
          {announcement}
        </span>
      </span>
    );
  },
);

CodeCopyButton.displayName = "CodeCopyButton";

export default CodeCopyButton;
