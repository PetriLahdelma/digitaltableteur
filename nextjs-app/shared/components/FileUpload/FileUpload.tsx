import React, { useEffect, useId, useRef, useState } from "react";
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
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const helperId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(value);
  const [internalError, setInternalError] = useState("");

  useEffect(() => {
    setSelectedFile(value ?? null);
  }, [value]);

  const displayError = error || internalError;

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

  const helperTextId = helperText ? `${helperId}-helper` : undefined;

  return (
    <div className={styles.container}>
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
      <div className={styles.displayField}>
        <Inputs
          label={label}
          type="text"
          placeholder={placeholder}
          value={formatFileSummary(selectedFile)}
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
          disabled={disabled}
        >
          {uploadButtonLabel}
        </Button>
        {selectedFile && clearButtonLabel ? (
          <Button
            type="button"
            variant="tertiary"
            size="s"
            onClick={handleClear}
            disabled={disabled}
          >
            {clearButtonLabel}
          </Button>
        ) : null}
      </div>
      {displayError ? (
        <HelperText state="error">{displayError}</HelperText>
      ) : (
        helperText && <HelperText id={helperTextId}>{helperText}</HelperText>
      )}
    </div>
  );
};

export default FileUpload;
