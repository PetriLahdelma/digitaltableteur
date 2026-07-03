"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./WipBadge.module.css";

export type WipBadgeProps = {
  status?: "alpha" | "beta" | "stable" | "deprecated";
  variant?: "canvas" | "docs";
};

export function WipBadge({ status = "alpha", variant = "canvas" }: WipBadgeProps) {
  const { t } = useTranslation();
  if (status === "stable") return null;
  const containerClass = variant === "docs" ? styles.wipBadgeDocs : styles.wipBadgeContainer;
  const deprecated = status === "deprecated";
  return (
    <div className={styles.wipWrapper} aria-hidden={false} data-axe-ignore>
      <div className={containerClass}>
        <span
          className={`${styles.badge} ${deprecated ? styles.deprecated : ""} badge`.trim()}
          role="status"
        >
          {deprecated
            ? t("storybookDeprecatedBadge")
            : `${t("storybookWipBadge")} (${status})`}
        </span>
      </div>
    </div>
  );
}

export default WipBadge;
