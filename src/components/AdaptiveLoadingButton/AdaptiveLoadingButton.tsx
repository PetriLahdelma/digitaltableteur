import React from "react";
import { useTranslation } from "react-i18next";
import Button, { type ButtonProps } from "@dt/Button";
import styles from "./AdaptiveLoadingButton.module.css";

export interface AdaptiveLoadingButtonProps
  extends Omit<ButtonProps, "children" | "icon" | "endIcon"> {
  /** Shows loading state and locks interaction */
  loading?: boolean;
  /** Optional progress percentage for long tasks */
  progress?: number;
  /** Translation key for loading text */
  loadingLabelKey?: string;
  /** Translation key used when no children are provided */
  idleLabelKey?: string;
  /** Optional label override */
  children?: React.ReactNode;
}

const governanceBlueprint = {
  component_id: "adaptive_loading_button",
  semantic_role: "action-launcher",
  primary_function:
    "Execute actions with observable, cancellable loading feedback",
  adaptive_level: "mutable",
  context_sensitivity: {
    user_role: true,
    device: true,
    intent: true,
  },
  mutation_rules: [
    "Lock interaction while loading and expose aria-busy",
    "Switch to high-contrast focus ring when user uses keyboard",
    "Scale padding for density preferences",
  ],
  transformation_rules: [
    "Button → Progress indicator when progress is provided",
    "Button → Inline status pill for low-friction confirmations",
  ],
  governance_checks: [
    "Ensure focus-visible outline persists in loading state",
    "Respect prefers-reduced-motion for spinner animation",
    "Use tokenized radius, padding, and colors",
  ],
  performance_metrics: ["interaction_success_rate", "latency_perceived"],
  evolution_log: [],
} as const;

const AdaptiveLoadingButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  AdaptiveLoadingButtonProps
>(
  (
    {
      loading = false,
      progress,
      loadingLabelKey = "adaptiveLoadingButton.loading",
      idleLabelKey = "adaptiveLoadingButton.idle",
      children,
      disabled,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const derivedLabel = children ?? t(idleLabelKey);
    const content = loading ? (
      <span className={styles.loadingContent}>
        <span className={styles.spinner} aria-hidden="true" />
        <span className={styles.loadingLabel}>{t(loadingLabelKey)}</span>
        {typeof progress === "number" ? (
          <span className={styles.progress} aria-live="polite">
            {t("adaptiveLoadingButton.progress", { percent: progress })}
          </span>
        ) : null}
      </span>
    ) : (
      derivedLabel
    );

    return (
      <Button
        ref={ref}
        {...rest}
        disabled={disabled}
        aria-busy={loading}
        accessibleDescription={
          loading
            ? t("adaptiveLoadingButton.busyDescription")
            : rest.accessibleDescription
        }
        className={`${loading ? styles.loading : ""} ${className}`.trim()}
      >
        {content}
      </Button>
    );
  },
);

AdaptiveLoadingButton.displayName = "AdaptiveLoadingButton";
AdaptiveLoadingButton.governance = governanceBlueprint;

export default AdaptiveLoadingButton;
