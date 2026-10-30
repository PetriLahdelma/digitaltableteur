"use client";

import {
  ArrowFatUp,
  Backspace,
  Command,
  Control,
  KeyReturn,
  Option,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { Fragment } from "react";
import { cn } from "../../lib/cn";
import { useTranslate } from "../../lib/translation";
import Kbd from "./Kbd";
import styles from "./KbdShortcut.module.css";

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

export interface KbdShortcutProps {
  /** Keys held together, one entry per key: `["⌘", "⇧", "⌫"]` or `["Ctrl", "Shift", "Backspace"]`. */
  keys: string[];
  /** Extra class on the row. */
  className?: string;
}

/**
 * A key chord: keycaps sized to the surrounding text, joined by plus signs.
 * The caps tint with the surrounding ink, so the row works on light and dark
 * surfaces alike.
 */
export function KbdShortcut({ keys, className }: KbdShortcutProps) {
  const t = useTranslate();
  return (
    <span className={cn(styles.shortcut, className)}>
      {keys.map((key, index) => {
        const glyph = KEY_ICONS[key];
        return (
          <Fragment key={key}>
            {index > 0 ? <span className={styles.plus}>+</span> : null}
            <Kbd size="sm" variant="secondary" className={styles.key}>
              {glyph ? (
                <>
                  <glyph.Glyph aria-hidden="true" className={styles.keyIcon} />
                  <span className={styles.keyName}>{t(glyph.nameKey)}</span>
                </>
              ) : (
                <span className={styles.keyWord}>{key}</span>
              )}
            </Kbd>
          </Fragment>
        );
      })}
    </span>
  );
}

export default KbdShortcut;
