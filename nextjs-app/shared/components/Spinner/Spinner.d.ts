import React from "react";
export interface SpinnerProps {
    /** Accessible name (required for standalone spinners). @default "Loading" */
    label?: string;
    /** Size token: sm fits inside inputs/buttons, lg reads at region level. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Optional utility classes on the root. */
    className?: string;
}
/** Indeterminate loading indicator. */
declare const Spinner: React.FC<SpinnerProps>;
export default Spinner;
//# sourceMappingURL=Spinner.d.ts.map