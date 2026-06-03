import React from "react";
import { useTranslation } from "react-i18next";
import Button, {
  type ButtonAsButton,
  type ButtonAsLink,
  type ButtonProps,
} from "@dt/Button";
import styles from "./AdaptiveLoadingButton.module.css";

type AdaptiveLoadingButtonExtras = {
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
};

export type AdaptiveLoadingButtonProps =
  | (Omit<ButtonAsButton, "children" | "icon" | "endIcon"> &
      AdaptiveLoadingButtonExtras)
  | (Omit<ButtonAsLink, "children" | "icon" | "endIcon"> &
      AdaptiveLoadingButtonExtras);

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

/**
 * AdaptiveLoadingButton component.
 */
export const AdaptiveLoadingButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  AdaptiveLoadingButtonProps
>(
  (props, ref) => {
    const { t } = useTranslation();
    const {
      loading = false,
      progress,
      loadingLabelKey = "adaptiveLoadingButton.loading",
      idleLabelKey = "adaptiveLoadingButton.idle",
      children,
      disabled,
      isDisabled,
      className = "",
    } = props;
    const effectiveDisabled = isDisabled ?? disabled;
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

    const accessibleDescription = loading
      ? t("adaptiveLoadingButton.busyDescription")
      : props.accessibleDescription;

    const commonProps = {
      ref,
      isDisabled: effectiveDisabled || loading,
      "aria-busy": loading,
      accessibleDescription,
      className: `${styles.button} ${className}`.trim(),
    };

    if (typeof props.href === "string") {
      const {
        href,
        submits: _submits,
        loading: _loading,
        progress: _progress,
        loadingLabelKey: _loadingLabelKey,
        idleLabelKey: _idleLabelKey,
        children: _children,
        disabled: _disabled,
        isDisabled: _isDisabled,
        className: _className,
        ...rest
      } = props;
      return (
        <Button href={href} {...rest} {...commonProps}>
          {content}
        </Button>
      );
    }

    const {
      href: _href,
      loading: _loading,
      progress: _progress,
      loadingLabelKey: _loadingLabelKey,
      idleLabelKey: _idleLabelKey,
      children: _children,
      disabled: _disabled,
      isDisabled: _isDisabled,
      className: _className,
      ...rest
    } = props;

    return (
      <Button {...rest} {...commonProps}>
        {content}
      </Button>
    );
  },
);

AdaptiveLoadingButton.displayName = "AdaptiveLoadingButton";
// @ts-expect-error - governance is added for documentation/analysis purposes
AdaptiveLoadingButton.governance = governanceBlueprint;

export default AdaptiveLoadingButton;
