"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./FormField.module.css";

export interface FormFieldProps {
  /**
   * Accessible name for the group of controls, rendered as a `<fieldset>`
   * `<legend>`.
   */
  legend: string;
  /** The grouped controls; each keeps its own label. */
  children: ReactNode;
  /** Helper text shown under the legend. */
  groupDescription?: string;
  /** Group-level error message shown after the controls. */
  error?: string;
  /** Appends a visual asterisk to the legend. */
  required?: boolean;
  /** Disables every contained control via the fieldset. */
  disabled?: boolean;
  /** Merged onto the fieldset. */
  className?: string;
}

/**
 * Fieldset/legend wrapper for a GROUP of controls (radio groups, checkbox
 * clusters, composite fields).
 *
 * Field-wrapper convention (decided 2026-07-03): individual controls own their
 * own label / error / helperText chrome — TextInput, TextArea, Select,
 * Checkbox, Switch and friends all ship those props built in. FormField exists
 * only for the group case, where a shared accessible name must come from a
 * fieldset legend. Never nest a labeled control's own chrome inside another
 * label wrapper.
 */
export function FormField({
  legend,
  children,
  groupDescription,
  error,
  required,
  disabled,
  className,
}: FormFieldProps) {
  return (
    <fieldset className={cn(styles.fieldset, className)} disabled={disabled}>
      <legend className={styles.legend}>
        {legend}
        {required ? <span aria-hidden="true"> *</span> : null}
      </legend>
      {groupDescription ? (
        <p className={styles.groupDescription}>{groupDescription}</p>
      ) : null}
      <div className={styles.groupControls}>{children}</div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

FormField.displayName = "FormField";
