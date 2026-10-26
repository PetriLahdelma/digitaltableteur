import React, { useId, useState } from "react";
import Radio from "@dt/Radio";
import HelperText from "@dt/HelperText";
import GroupLabel from "@dt/GroupLabel";
import Text from "@dt/Text";
import VisuallyHidden from "@dt/VisuallyHidden";
import styles from "./RadioGroup.module.css";
import type { SizeUnified } from "../../utils/sizeNormalization";

export type RadioGroupOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface RadioGroupProps {
  /** Native form field name shared by the set; auto-generated when omitted */
  name?: string;
  /** Group label rendered as the fieldset legend */
  legend: string;
  /** Radio options; per-option disabled keeps the choice visible */
  options: RadioGroupOption[];
  /** Controlled selected value; "" is treated as absent (uncontrolled) */
  value?: string;
  /** Initial value when uncontrolled */
  defaultValue?: string;
  /** Fired with the next value when selection changes */
  onValueChange?: (value: string) => void;
  /** Stack direction. @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Radio control size. @default "md" */
  size?: SizeUnified;
  /** Disables the whole set. @default false */
  disabled?: boolean;
  /** Error message; announces via role=alert and sets aria-invalid */
  error?: string;
  /** Helper copy below the group; always rendered, alongside error when both are set */
  helperText?: string;
  /**
   * Anchor shown before the first option, for rating scales ("Serious" in
   * Serious 1 to 5 Playful). Announced paired with its option, not on its own.
   */
  startLabel?: string;
  /** Anchor shown after the last option; pairs with startLabel */
  endLabel?: string;
  /** Keeps the legend as the accessible name but hides it visually. @default false */
  hideLegend?: boolean;
  /** Merged onto the fieldset */
  className?: string;
}

/** Accessible radio set with legend, helper, and error text; doubles as a rating scale with anchors. */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name: nameProp,
  legend,
  options,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  size = "md",
  disabled = false,
  error,
  helperText,
  startLabel,
  endLabel,
  hideLegend = false,
  className,
}) => {
  const autoName = useId();
  // Controls convention: "" means absent — empty name falls back to the
  // generated one, empty value keeps the group uncontrolled and clickable.
  const name = nameProp || `radio-group-${autoName}`;
  const controlledValue = value === "" ? undefined : value;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const selected = isControlled ? controlledValue : internal;
  const helperId = `${name}-helper`;
  const errorId = `${name}-error`;
  const anchorsId = `${name}-anchors`;
  const start = startLabel || undefined;
  const end = endLabel || undefined;
  const hasAnchors = Boolean(start || end);
  // One description pairs each anchor with its option ("1: Serious; 5: Playful"),
  // so screen readers hear the scale once instead of two loose words.
  const first = options[0];
  const last = options[options.length - 1];
  const anchorDescription = [
    start && first ? `${first.label}: ${start}` : null,
    end && last ? `${last.label}: ${end}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  const pick = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const optionList = (
    <div
      className={[
        styles.options,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
      ].join(" ")}
    >
      {options.map((opt) => (
        <Radio
          key={opt.value}
          name={name}
          value={opt.value}
          label={opt.label}
          size={size}
          checked={selected === opt.value}
          disabled={disabled || opt.disabled}
          onCheckedChange={() => pick(opt.value)}
        />
      ))}
    </div>
  );

  return (
    <fieldset
      className={[styles.fieldset, className].filter(Boolean).join(" ")}
      aria-describedby={
        [
          hasAnchors ? anchorsId : null,
          helperText ? helperId : null,
          error ? errorId : null,
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
      aria-invalid={error ? true : undefined}
      disabled={disabled}
    >
      <GroupLabel
        as="legend"
        disabled={disabled}
        className={hideLegend ? styles.hiddenLegend : undefined}
      >
        {legend}
      </GroupLabel>
      {hasAnchors ? (
        <>
          <VisuallyHidden>
            <span id={anchorsId}>{anchorDescription}</span>
          </VisuallyHidden>
          <div
            className={[
              styles.scale,
              orientation === "vertical" ? styles.scaleVertical : null,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {start ? (
              <Text
                as="span"
                size="xs"
                className={styles.startAnchor}
                aria-hidden="true"
              >
                {start}
              </Text>
            ) : null}
            {optionList}
            {end ? (
              <Text
                as="span"
                size="xs"
                className={styles.endAnchor}
                aria-hidden="true"
              >
                {end}
              </Text>
            ) : null}
          </div>
        </>
      ) : (
        optionList
      )}
      {helperText ? <HelperText id={helperId}>{helperText}</HelperText> : null}
      {error ? (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      ) : null}
    </fieldset>
  );
};

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
