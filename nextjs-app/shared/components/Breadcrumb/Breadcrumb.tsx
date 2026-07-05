"use client";

import React from "react";
import Link from "@dt/Link";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = {
  /** Breadcrumb items in root-to-current order (label, optional href); the last renders as plain text. */
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark. @default "Breadcrumb" */
  "aria-label"?: string;
  /**
   * Underline mode forwarded to the Link for each trail item — the same
   * contract as Link: "always" shows the wavy underline permanently, "hover"
   * reveals it on hover and keyboard focus, "none" omits it. @default "always"
   */
  underline?: "always" | "hover" | "none";
};

/** Breadcrumb navigation trail with current page indication. */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  "aria-label": ariaLabel = "Breadcrumb",
  underline = "always",
}) => {
  if (!items?.length) return null;
  const lastIndex = items.length - 1;

  return (
    <nav className={styles.breadcrumb} aria-label={ariaLabel}>
      <ol className={styles.list}>
        {items.map((item, idx) => {
          const isLast = idx === lastIndex;
          return (
            <li key={`${item.label}-${idx}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} size="sm" underline={underline}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
              {!isLast && <span className={styles.separator}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
