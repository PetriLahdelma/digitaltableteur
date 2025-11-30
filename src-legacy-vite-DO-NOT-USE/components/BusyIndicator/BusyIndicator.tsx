import React from "react";
import styles from "./BusyIndicator.module.css";
import { useTranslation } from "react-i18next";
import Icon from "../Icon/Icon";

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

  // Calculate color based on progress for determinate state
  const progressColor = determinate
    ? pct === 100
      ? "var(--color-success)"
      : `color-mix(in srgb, var(--color-primary) ${100 - (pct ?? 0)}%, var(--color-success) ${pct ?? 0}%)`
    : "var(--color-primary)";

  // SVG circle progress calculation
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = determinate
    ? circumference - ((pct ?? 0) / 100) * circumference
    : 0;

  return (
    <span className={cl} role={role} {...progressProps}>
      <span className={styles.visual} aria-hidden="true">
        {determinate ? (
          <svg
            className={styles.progressCircle}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className={styles.circleBackground}
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.2"
            />
            <circle
              className={styles.circleProgress}
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
              }}
            />
          </svg>
        ) : (
          <span className={styles.iconSpinner}>
            <Icon
              name="circle-notch"
              size={size === "s" ? "sm" : size === "l" ? "xl" : "lg"}
              spin
              decorative
            />
          </span>
        )}
      </span>
      <span className={styles.label}>{visibleLabel}</span>
    </span>
  );
};

export default BusyIndicator;
