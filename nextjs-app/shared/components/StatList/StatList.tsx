"use client";

import React from "react";

import { cn } from "../../lib/cn";
import { useTranslate } from "../../lib/translation";
import styles from "./StatList.module.css";

/** One figure and what it counts. */
export interface StatListItem {
  /** Stable key for the item. */
  id: string;
  /** The figure, for example 191 or "87%". */
  value: React.ReactNode;
  /** What the figure counts, for example "Components in the catalog". */
  label: React.ReactNode;
  /** The total the figure is out of; renders a quiet "of 208" after it. */
  of?: React.ReactNode;
  /** A short qualifier under the label: a source, a date or a breakdown. */
  note?: React.ReactNode;
}

export interface StatListProps {
  /** Figures in reading order. */
  items: StatListItem[];
  /**
   * "rule" sets each figure under a hairline, for figures inside running
   * content; "card" puts each on a surface tile, for a standalone band.
   * @default "rule"
   */
  variant?: "rule" | "card";
  /** Figure size: md for rows of four or more, lg for two or three. @default "md" */
  size?: "md" | "lg";
  /** Text alignment inside each item. @default "start" */
  align?: "start" | "center";
  /** Merged onto the dl element. */
  className?: string;
}

/**
 * Key figures as a description list: each item is a label (dt) and its
 * figure (dd), so a screen reader hears "Components in the catalog, 191".
 * The figure is drawn first; the DOM keeps the label first.
 */
export function StatList({
  items,
  variant = "rule",
  size = "md",
  align = "start",
  className,
}: StatListProps) {
  const t = useTranslate();
  return (
    <dl
      className={cn(
        styles.root,
        styles[variant],
        styles[size],
        align === "center" && styles.center,
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>
            <span className={styles.figure}>{item.value}</span>
            {item.of != null ? (
              <span className={styles.of}>
                {t("statListOf", "of {{total}}", { total: String(item.of) })}
              </span>
            ) : null}
          </dd>
          {item.note ? <dd className={styles.note}>{item.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

StatList.displayName = "StatList";

export default StatList;
