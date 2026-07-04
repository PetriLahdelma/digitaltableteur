import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./TextArea.module.css";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  /** Visible field label */
  label: string;
  /** Value synced into the field; typing still works after it is set */
  value?: string;
  /** Validation error message; replaces the helper line */
  error?: string;
  /** Helper copy below the field */
  helperText?: string;
  /** Change handler receiving the raw string value */
  onChange?: (value: string) => void;
  /** Enable smooth animated auto-growing (default: false) */
  animateResize?: boolean;
  /** Minimum number of rows when animateResize is enabled */
  minRows?: number;
  /** Maximum number of rows when animateResize is enabled */
  maxRows?: number;
}

/** Labeled multi-line text field with error/helper text and optional animated auto-grow. */
const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value = "",
  error,
  helperText,
  onChange,
  disabled = false,
  rows = 4,
  animateResize = false,
  minRows = 2,
  maxRows = 10,
  ...rest
}) => {
  const [textValue, setTextValue] = useState(value);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Stable unique ids so the label association and error/helper wiring never
  // collide when two TextAreas share a label (the raw label string was used as
  // the DOM id before, which produced duplicate ids and broke on spaces).
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const hasError = !!error;
  const describedBy =
    [hasError && errorId, helperText && !hasError && helperId]
      .filter(Boolean)
      .join(" ") || undefined;

  useEffect(() => {
    setTextValue(value);
  }, [value]);

  const resizeTextArea = useCallback(() => {
    const element = textAreaRef.current;
    if (!element || !animateResize) return;

    // Get current height before resizing
    const currentHeight = element.getBoundingClientRect().height;

    // Temporarily set height to auto to get scrollHeight
    element.style.height = "auto";

    // Calculate dimensions
    const computed = window.getComputedStyle(element);
    const lineHeight = parseFloat(computed.lineHeight || "20");
    const verticalPadding =
      parseFloat(computed.paddingTop || "0") +
      parseFloat(computed.paddingBottom || "0");
    const borderWidth =
      parseFloat(computed.borderTopWidth || "0") +
      parseFloat(computed.borderBottomWidth || "0");

    const minHeight = lineHeight * minRows + verticalPadding + borderWidth;
    const maxHeight = lineHeight * maxRows + verticalPadding + borderWidth;
    const targetHeight = Math.max(
      minHeight,
      Math.min(element.scrollHeight, maxHeight),
    );

    // Set overflow based on whether we hit max height
    if (element.scrollHeight > maxHeight) {
      element.style.overflowY = "auto";
    } else {
      element.style.overflowY = "hidden";
    }

    // Use RAF to ensure transition applies
    requestAnimationFrame(() => {
      if (element) {
        element.style.height = `${currentHeight}px`;
        requestAnimationFrame(() => {
          if (element) {
            element.style.height = `${targetHeight}px`;
          }
        });
      }
    });
  }, [animateResize, minRows, maxRows]);

  useEffect(() => {
    if (animateResize) {
      resizeTextArea();
    }
  }, [textValue, resizeTextArea, animateResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  const textareaClassName = `${styles.input} ${error ? styles.error : ""} ${animateResize ? styles.animatedTextarea : ""}`;

  return (
    <div className={styles.inputContainer}>
      <Label htmlFor={inputId} required={!!rest.required} disabled={disabled}>
        {label}
      </Label>
      <textarea
        ref={textAreaRef}
        id={inputId}
        className={textareaClassName}
        placeholder={placeholder}
        value={textValue}
        onChange={handleChange}
        disabled={disabled}
        rows={animateResize ? minRows : rows}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hasError && (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      )}
      {helperText && !hasError && (
        <HelperText id={helperId}>{helperText}</HelperText>
      )}
    </div>
  );
};

TextArea.displayName = "TextArea";

export default TextArea;
