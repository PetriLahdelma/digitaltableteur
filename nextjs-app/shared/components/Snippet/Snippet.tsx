"use client";

import React from "react";
import { CodeCopyButton } from "../CodeCopyButton";
import { cn } from "../../lib/cn";
import styles from "./Snippet.module.css";

export type SnippetTheme = "default" | "inverted";

export interface SnippetProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onCopy" | "children"> {
  /**
   * The command, or several commands shown one per line. Write the command
   * only: the prompt is chrome and never part of the text.
   */
  command: string | readonly string[];
  /** Show the `$` prompt before each command. Copy always leaves it out. @default true */
  prompt?: boolean;
  /**
   * `inverted` renders the snippet in the dark theme on any page, for
   * terminal emphasis. In the high-contrast themes it follows the page so
   * contrast stays at the high-contrast level.
   * @default "default"
   */
  theme?: SnippetTheme;
  /** Show the copy button. @default true */
  copyable?: boolean;
  /** Accessible name for the copy button. @default "Copy code" (translated) */
  copyLabel?: string;
  /** Called with the copied text (commands joined by newlines). */
  onCopy?: (text: string) => void;
}

/**
 * A copyable shell command (Geist Snippet). The prompt is aria-hidden and
 * excluded from the copy, so the clipboard holds exactly what runs.
 */
export const Snippet = React.forwardRef<HTMLDivElement, SnippetProps>(
  (
    {
      command,
      prompt = true,
      theme = "default",
      copyable = true,
      copyLabel,
      onCopy,
      className,
      ...rest
    },
    ref,
  ) => {
    const commands = typeof command === "string" ? [command] : [...command];
    const text = commands.join("\n");

    return (
      <div
        ref={ref}
        className={cn(
          styles.snippet,
          theme === "inverted" && ["themeDark", styles.inverted],
          commands.length > 1 && styles.multi,
          className,
        )}
        data-theme={theme}
        {...rest}
      >
        <div className={styles.commands}>
          {commands.map((line, index) => (
            <div key={index} className={styles.line}>
              {prompt ? (
                <span className={styles.prompt} aria-hidden="true">
                  $
                </span>
              ) : null}
              <code className={styles.command}>{line}</code>
            </div>
          ))}
        </div>
        {copyable ? (
          <CodeCopyButton
            className={styles.copy}
            value={text}
            label={copyLabel}
            onCopy={onCopy}
          />
        ) : null}
      </div>
    );
  },
);

Snippet.displayName = "Snippet";

export default Snippet;
