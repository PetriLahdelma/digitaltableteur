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
  return (
    <div className={styles.wipWrapper} aria-hidden={false}>
      <div className={containerClass}>
        <span className={`${styles.badge} badge`} role="status">
          {t("storybookWipBadge")} ({status})
        </span>
      </div>
    </div>
  );
}

export default WipBadge;
