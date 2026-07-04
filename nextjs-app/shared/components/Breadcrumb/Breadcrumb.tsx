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
};

/** Breadcrumb navigation trail with current page indication. */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  "aria-label": ariaLabel = "Breadcrumb",
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
                <Link href={item.href} size="sm" className={styles.link}>
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
