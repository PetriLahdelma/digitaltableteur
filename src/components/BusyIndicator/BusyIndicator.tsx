import React from "react";
import styles from "./BusyIndicator.module.css";
import { useTranslation } from "react-i18next";

export interface BusyIndicatorProps {
  /** Visual size token */
  size?: "s" | "m" | "l";
  /** Accessible label; localized fallback provided */
  label?: string;
  /** Inline (text-flow) or centered block */
  variant?: "inline" | "overlay";
  /** Show determinate progress (0-1) instead of indeterminate spinner */
  progress?: number | null;
  /** Optional className */
  className?: string;
}

/** BusyIndicator renders an animated spinner or progress arc with reduced motion respect. */
const BusyIndicator: React.FC<BusyIndicatorProps> = ({
  size = "m",
  label,
  variant = "inline",
  progress = null,
  className = "",
}) => {
  const { t } = useTranslation();
  const determinate =
    typeof progress === "number" && progress >= 0 && progress <= 1;
  const pct = determinate ? Math.round(progress * 100) : null;

  // Visible label resolution (allow override via prop)
  const fallbackLoading = t("busyIndicator.loading", "Loading");
  const visibleLabel = determinate
    ? pct === 100
      ? (label ?? t("busyIndicator.complete", "Complete"))
      : (label ?? t("busyIndicator.loadingPercent", { percent: pct }))
    : (label ?? fallbackLoading);

  const cl = [styles.root, styles[size], styles[variant], className]
    .filter(Boolean)
    .join(" ");

  // Accessibility attributes
  const role = determinate ? "progressbar" : "status";
  const progressProps: React.AriaAttributes = determinate
    ? {
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": pct ?? 0,
        "aria-valuetext":
          pct === 100
            ? t("busyIndicator.complete", "Complete")
            : t("busyIndicator.loadingPercent", { percent: pct }),
        "aria-label": visibleLabel,
      }
    : { "aria-live": "polite" };

  return (
    <span className={cl} role={role} {...progressProps}>
      <span className={styles.visual} aria-hidden="true">
        {determinate ? (
          <span
            className={`${styles.progressDots} ${pct === 100 ? styles.success : ""}`}
          >
            {[0, 1, 2, 3].map((i) => {
              // Activate dots progressively at 25%, 50%, 75%, 100%
              const threshold = (i + 1) * 25;
              const active =
                (pct ?? 0) >= threshold || (pct === 100 && i === 3);
              return (
                <span
                  key={i}
                  data-active={active ? "true" : "false"}
                  className={`${styles.dot} ${active ? styles.active : ""}`}
                />
              );
            })}
          </span>
        ) : (
          <span className={styles.spinner}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
        )}
      </span>
      <span className={styles.label}>{visibleLabel}</span>
    </span>
  );
};

export default BusyIndicator;
