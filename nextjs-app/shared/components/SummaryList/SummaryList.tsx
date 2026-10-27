import React from "react";

import { cn } from "../../lib/cn";
import styles from "./SummaryList.module.css";

/** One question and its answer. */
export interface SummaryListRow {
  /** Stable key for the row. */
  id: string;
  /** The question or field name, for example "Full name". */
  label: React.ReactNode;
  /** The answer. Line breaks in a string answer are kept. */
  value: React.ReactNode;
  /** Optional action for this row, usually a "Change" link that names what it changes. */
  action?: React.ReactNode;
}

export interface SummaryListProps {
  /** Rows in order. */
  rows: SummaryListRow[];
  /**
   * "auto" stacks the label above the value in narrow containers and puts
   * them side by side once the list is wide enough (about 40rem). @default "auto"
   */
  layout?: "auto" | "stacked";
  /** Merged onto the dl element. */
  className?: string;
}

/**
 * Questions and their answers, for checking answers before submitting and
 * for showing a submitted record. After the GOV.UK summary list: a
 * description list, one row per question, an optional action per row.
 */
export function SummaryList({ rows, layout = "auto", className }: SummaryListProps) {
  return (
    <dl className={cn(styles.root, layout === "stacked" && styles.stacked, className)}>
      {rows.map((row) => (
        <div key={row.id} className={styles.row}>
          <dt className={styles.label}>{row.label}</dt>
          <dd className={styles.value}>{row.value}</dd>
          {row.action ? <dd className={styles.action}>{row.action}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

SummaryList.displayName = "SummaryList";

export default SummaryList;
