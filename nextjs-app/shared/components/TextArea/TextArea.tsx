import React, { forwardRef, useId, useState } from "react";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import styles from "./TextArea.module.css";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Visible label; omit when using `aria-label` on the textarea */
  label?: string;
  /** Error message string, or `true` for invalid styling only */
  error?: string | boolean;
  helperText?: string;
  size?: SizeUnified;
  isDisabled?: boolean;
  showCount?: boolean;
  onValueChange?: (value: string) => void;
  resize?: "none" | "vertical" | "both";
}

/** Multi-line text field — bare textarea or labeled field with validation. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      size = "md",
      isDisabled = false,
      disabled = false,
      showCount = false,
      onValueChange,
      onChange,
      resize = "vertical",
      className,
      rows = 4,
      value,
      defaultValue,
      maxLength,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const countId = `${id}-count`;
    const normalizedSize = normalizeSizeProp(size);
    const isOff = isDisabled || disabled;
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    const [internalValue, setInternalValue] = useState(
      () => (value ?? defaultValue ?? "") as string
    );
    const displayValue = value !== undefined ? String(value) : internalValue;
    const charCount = displayValue.length;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    const describedBy = [
      helperText && !errorMessage ? helperId : null,
      errorMessage ? errorId : null,
      showCount ? countId : null,
      rest["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    const textarea = (
      <div className={showCount ? styles.fieldWithCount : undefined}>
        <textarea
          {...rest}
          ref={ref}
          id={id}
          rows={rows}
          value={value !== undefined ? value : undefined}
          defaultValue={value === undefined ? defaultValue : undefined}
          disabled={isOff}
          maxLength={maxLength}
          aria-invalid={hasError ? true : rest["aria-invalid"]}
          aria-describedby={describedBy}
          className={[
            styles.textarea,
            styles[`textarea--${normalizedSize}`],
            styles[`resize-${resize}`],
            hasError ? styles.error : "",
            showCount ? styles.textareaWithCount : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          onChange={handleChange}
        />
        {showCount ? (
          <span
            id={countId}
            className={[
              styles.count,
              maxLength !== undefined && charCount >= maxLength ? styles.countAtLimit : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-live="polite"
          >
            {charCount}
            {maxLength !== undefined ? `/${maxLength}` : null}
          </span>
        ) : null}
      </div>
    );

    if (!label) {
      return textarea;
    }

    return (
      <div className={styles.wrapper}>
        <Label htmlFor={id}>{label}</Label>
        {textarea}
        {helperText && !errorMessage ? (
          <HelperText id={helperId}>{helperText}</HelperText>
        ) : null}
        {errorMessage ? (
          <HelperText id={errorId} state="error">
            {errorMessage}
          </HelperText>
        ) : null}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
