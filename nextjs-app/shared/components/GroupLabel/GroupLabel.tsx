import React from "react";
import styles from "./GroupLabel.module.css";

export interface GroupLabelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /**
   * Element to render. `legend` (as the first child of a `<fieldset>`) names a
   * group of controls and is what group components use; `label` names one
   * control through `htmlFor`. @default "label"
   */
  as?: "label" | "legend";
  /** ID of the control the label names. Required when `as="label"`; ignored for `legend`. */
  htmlFor?: string;
  /** Optional browser tooltip; fallback when title is not set */
  tooltipText?: string;
  /** Shows the required asterisk. @default false */
  required?: boolean;
  /** Muted disabled styling. @default false */
  disabled?: boolean;
  /** Native title attribute override */
  title?: string;
}

/**
 * The group heading: one look for every group of controls (RadioGroup,
 * CheckboxGroup through FormField, SelectableCard groups). Renders a
 * `<legend>` for fieldsets, or a `<label>` for a single control.
 */
export const GroupLabel: React.FC<GroupLabelProps> = ({
  as = "label",
  htmlFor,
  children,
  tooltipText,
  required,
  disabled = false,
  title,
  className,
  ...rest
}) => {
  const classes = [
    styles.groupLabel,
    as === "legend" ? styles.legend : "",
    disabled ? styles.disabled : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      {children}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </>
  );

  if (as === "legend") {
    return (
      <legend className={classes} title={title || tooltipText} {...rest}>
        {content}
      </legend>
    );
  }

  return (
    <label
      htmlFor={htmlFor}
      className={classes}
      title={title || tooltipText} // Use title or fallback to tooltipText
      {...rest}
    >
      {content}
    </label>
  );
};

GroupLabel.displayName = "GroupLabel";

export default GroupLabel;
