import React from "react";
export interface ProgressProps {
    /** Current progress value, scaled against max. @default 0 */
    value?: number;
    /** Maximum value. @default 100 */
    max?: number;
    /** Accessible name for the progressbar. @default "Progress" */
    label?: string;
    /** Track height token. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Semantic fill color. @default "neutral" */
    state?: "neutral" | "success" | "info" | "warning" | "error";
    /** Unknown duration: animates a sweeping bar and drops aria-valuenow. */
    indeterminate?: boolean;
    /** Optional utility classes on the root. */
    className?: string;
}
/** Linear progress bar with optional label, semantic state colors, and an indeterminate mode. */
declare const Progress: React.FC<ProgressProps>;
export default Progress;
//# sourceMappingURL=Progress.d.ts.map