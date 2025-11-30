import React, { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import AdaptiveLoadingButton from "@dt/AdaptiveLoadingButton";
import Inputs from "@dt/Inputs";
import Text from "@dt/Text";
import styles from "./TransformingActionInput.module.css";

export interface TransformingActionInputProps {
  /** Initial surface mode before transformation */
  initialMode?: "button" | "input";
  /** Optional controlled value */
  value?: string;
  /** Default value when uncontrolled */
  defaultValue?: string;
  /** Disabled state for both button and input */
  disabled?: boolean;
  /** Translation key for the trigger label */
  actionLabelKey?: string;
  /** Translation key for the input label */
  inputLabelKey?: string;
  /** Translation key for helper text below the input */
  helperTextKey?: string;
  /** Translation key for the placeholder */
  placeholderKey?: string;
  /** Triggered when value changes */
  onChange?: (value: string) => void;
  /** Triggered on submit in input mode */
  onSubmit?: (value: string) => void;
  /** When true, retains the input after submit instead of returning to button mode */
  stayInInputMode?: boolean;
  /** Optional className passthrough */
  className?: string;
}

const governanceBlueprint = {
  component_id: "transforming_action_input",
  semantic_role: "command-surface",
  primary_function:
    "Capture short-form intent with a progressive disclosure trigger",
  adaptive_level: "transformable",
  context_sensitivity: {
    user_role: true,
    device: true,
    intent: true,
  },
  mutation_rules: [
    "Switch to input when interaction friction > threshold",
    "Increase density on smaller viewports",
    "Elevate helper text when validation errors detected",
  ],
  transformation_rules: [
    "Button → Input once user expresses typing intent",
    "Input → Command surface when extended controls are provided",
  ],
  governance_checks: [
    "Validate token usage for padding, colors, and radius",
    "Ensure aria-label/aria-describedby present in input mode",
    "Keep focus-visible outline intact post-transformation",
  ],
  performance_metrics: [
    "interaction_success_rate",
    "friction_score",
    "time_to_first_input",
  ],
  evolution_log: [],
} as const;

const TransformingActionInput: React.FC<TransformingActionInputProps> = ({
  initialMode = "button",
  value,
  defaultValue = "",
  disabled = false,
  actionLabelKey = "transformingActionInput.trigger",
  inputLabelKey = "transformingActionInput.label",
  helperTextKey = "transformingActionInput.helper",
  placeholderKey = "transformingActionInput.placeholder",
  onChange,
  onSubmit,
  stayInInputMode = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const inputId = useId();
  const [mode, setMode] = useState<"button" | "input">(initialMode);
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedValue = value ?? internalValue;
  const shouldShowHelper = Boolean(helperTextKey);
  const helperTextId = useMemo(
    () => (shouldShowHelper ? `${inputId}-helper` : undefined),
    [inputId, shouldShowHelper],
  );

  const handleTransform = () => {
    if (disabled) return;
    setMode("input");
  };

  const handleChange = (next: string) => {
    setInternalValue(next);
    onChange?.(next);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit?.(resolvedValue);
      if (!stayInInputMode) {
        setMode("button");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      data-component-id={governanceBlueprint.component_id}
      data-mode={mode}
    >
      <div className={styles.metaRow} aria-live="polite">
        <Text as="span" size="S" className={styles.metaLabel}>
          {t("transformingActionInput.identity")}
        </Text>
        <Text as="span" size="S" className={styles.metaValue}>
          {mode === "button"
            ? t("transformingActionInput.state.button")
            : t("transformingActionInput.state.input")}
        </Text>
      </div>

      {mode === "button" ? (
        <Button
          variant="primary"
          onClick={handleTransform}
          disabled={disabled}
          accessibleName={t(actionLabelKey)}
          className={styles.trigger}
        >
          {t(actionLabelKey)}
        </Button>
      ) : (
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-live="polite"
        >
          <Inputs
            label={t(inputLabelKey)}
            type="text"
            value={resolvedValue}
            onChange={(nextValue: string | number) =>
              handleChange(String(nextValue))
            }
            placeholder={t(placeholderKey)}
            disabled={disabled}
            helperText={shouldShowHelper ? t(helperTextKey) : undefined}
          />
          <div className={styles.actions}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setMode("button")}
              disabled={disabled || isSubmitting}
            >
              {t("transformingActionInput.cancel")}
            </Button>
            <AdaptiveLoadingButton
              variant="primary"
              type="submit"
              disabled={disabled || isSubmitting}
              loading={isSubmitting}
              accessibleDescription={t(
                "transformingActionInput.submitDescription",
              )}
            >
              {t("transformingActionInput.submit")}
            </AdaptiveLoadingButton>
          </div>
        </form>
      )}
    </div>
  );
};

TransformingActionInput.displayName = "TransformingActionInput";
(TransformingActionInput as any).governance = governanceBlueprint;

export default TransformingActionInput;
