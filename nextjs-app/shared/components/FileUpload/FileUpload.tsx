import React, { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import fieldStyles from "../Combobox/ComboboxField.module.css";
import styles from "./FileUpload.module.css";
import Inputs from "@dt/Inputs";
import Button from "@dt/Button";
import HelperText from "@dt/HelperText";

export interface FileUploadProps {
  label: string;
  placeholder?: string;
  helperText?: string;
  uploadButtonLabel: string;
  clearButtonLabel?: string;
  accept?: string;
  maxSizeInBytes?: number;
  sizeErrorMessage?: string;
  error?: string;
  value?: File | null;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
  required?: boolean;
  /** Match FormFieldEditorial / Combobox styling on editorial forms. */
  appearance?: "default" | "editorial";
  className?: string;
}

const formatFileSummary = (file: File | null) => {
  if (!file) return "";
  if (file.size === 0) return `${file.name} (0 KB)`;
  const sizeInKb = file.size / 1024;
  if (sizeInKb >= 1024) {
    return `${file.name} (${(sizeInKb / 1024).toFixed(1)} MB)`;
  }
  return `${file.name} (${Math.max(1, Math.round(sizeInKb))} KB)`;
};

/** File upload control with size validation and clear action. */
const FileUpload: React.FC<FileUploadProps> = ({
  label,
  placeholder,
  helperText,
  uploadButtonLabel,
  clearButtonLabel,
  accept,
  maxSizeInBytes,
  sizeErrorMessage,
  error,
  value = null,
  onFileChange,
  disabled = false,
  required = false,
  appearance = "default",
  className,
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const helperId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(value);
  const [internalError, setInternalError] = useState("");
  const isEditorial = appearance === "editorial";

  useEffect(() => {
    setSelectedFile(value ?? null);
  }, [value]);

  const displayError = error || internalError;
  const fileSummary = formatFileSummary(selectedFile);
  const helperTextId = helperText ? `${helperId}-helper` : undefined;
  const errorId = `${fieldId}-error`;
  const describedBy = [displayError ? errorId : null, helperTextId]
    .filter(Boolean)
    .join(" ");

  const handleBrowseClick = () => {
    if (disabled) return;
    hiddenInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      handleClear();
      return;
    }

    if (maxSizeInBytes && file.size > maxSizeInBytes) {
      const maxSizeMB = (maxSizeInBytes / (1024 * 1024)).toFixed(1);
      const fallback =
        sizeErrorMessage ??
        `File is too large. Max ${maxSizeMB} MB. File removed.`;
      setInternalError(fallback);
      event.target.value = "";
      setSelectedFile(null);
      onFileChange?.(null);
      return;
    }

    setInternalError("");
    setSelectedFile(file);
    onFileChange?.(file);
  };

  const handleClear = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
    }
    setInternalError("");
    setSelectedFile(null);
    onFileChange?.(null);
  };

  const hiddenInput = (
    <input
      ref={hiddenInputRef}
      type="file"
      className={styles.hiddenInput}
      onChange={handleFileSelection}
      accept={accept}
      tabIndex={-1}
      aria-hidden="true"
      disabled={disabled}
    />
  );

  const helper = displayError ? (
    <HelperText id={errorId} state="error">
      {displayError}
    </HelperText>
  ) : (
    helperText && <HelperText id={helperTextId}>{helperText}</HelperText>
  );

  if (isEditorial) {
    return (
      <div className={cn(fieldStyles.field, styles.editorial, className)}>
        {hiddenInput}
        <label id={`${fieldId}-label`} htmlFor={fieldId} className={fieldStyles.label}>
          {label}
          {required && (
            <>
              <span className={fieldStyles.required} aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>

        <div
          className={cn(
            fieldStyles.control,
            displayError && fieldStyles.controlError,
            disabled && fieldStyles.disabled,
          )}
        >
          <button
            id={fieldId}
            type="button"
            className={fieldStyles.trigger}
            disabled={disabled}
            aria-labelledby={`${fieldId}-label`}
            aria-describedby={describedBy || undefined}
            aria-invalid={displayError ? true : undefined}
            aria-required={required || undefined}
            onClick={handleBrowseClick}
          >
            <span
              className={cn(
                fieldStyles.triggerLabel,
                !fileSummary && placeholder && fieldStyles.triggerPlaceholder,
              )}
            >
              {fileSummary || placeholder}
            </span>
          </button>
        </div>

        <div className={styles.editorialActions}>
          <button
            type="button"
            className={styles.editorialBrowseButton}
            disabled={disabled}
            onClick={handleBrowseClick}
          >
            {uploadButtonLabel}
          </button>
          {selectedFile && clearButtonLabel ? (
            <button
              type="button"
              className={styles.editorialClearButton}
              disabled={disabled}
              onClick={handleClear}
            >
              {clearButtonLabel}
            </button>
          ) : null}
        </div>

        {helper}
      </div>
    );
  }

  return (
    <div className={cn(styles.container, className)}>
      {hiddenInput}
      <div className={styles.displayField}>
        <Inputs
          label={label}
          type="text"
          placeholder={placeholder}
          value={fileSummary}
          readOnly
          error={displayError ? "" : undefined}
          aria-describedby={helperTextId}
          disabled={disabled}
          required={required}
          onClick={handleBrowseClick}
        />
      </div>
      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          size="m"
          onClick={handleBrowseClick}
          isDisabled={disabled}
        >
          {uploadButtonLabel}
        </Button>
        {selectedFile && clearButtonLabel ? (
          <Button
            type="button"
            variant="tertiary"
            size="s"
            onClick={handleClear}
            isDisabled={disabled}
          >
            {clearButtonLabel}
          </Button>
        ) : null}
      </div>
      {helper}
    </div>
  );
};

export default FileUpload;
