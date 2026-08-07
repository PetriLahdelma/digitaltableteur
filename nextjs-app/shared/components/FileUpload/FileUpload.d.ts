import React from "react";
export interface FileUploadProps {
    /** Field label */
    label: string;
    /** Placeholder shown when no file is selected */
    placeholder?: string;
    /** Helper copy below the control */
    helperText?: string;
    /** Upload button label */
    uploadButtonLabel: string;
    /** Clear/remove button label; the button shows only while a file is set */
    clearButtonLabel?: string;
    /** Accepted file extensions/MIME types for the native picker */
    accept?: string;
    /** Maximum file size in bytes; checked when a file is picked */
    maxSizeInBytes?: number;
    /** Error shown when a picked file exceeds maxSizeInBytes */
    sizeErrorMessage?: string;
    /** External error message; renders above the helper line */
    error?: string;
    /** Controlled File value */
    value?: File | null;
    /** Called when a file is selected or cleared */
    onFileChange?: (file: File | null) => void;
    /** Disables the control. @default false */
    disabled?: boolean;
    /** Marks the field required. @default false */
    required?: boolean;
    /** Match FormFieldEditorial / Combobox styling on editorial forms. */
    appearance?: "default" | "editorial";
    className?: string;
}
/** File upload control with size validation and clear action. */
declare const FileUpload: React.FC<FileUploadProps>;
export default FileUpload;
//# sourceMappingURL=FileUpload.d.ts.map