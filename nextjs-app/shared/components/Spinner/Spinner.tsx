import React from "react";
import styles from "./Spinner.module.css";

export interface SpinnerProps {
  /** Accessible name (required for standalone spinners). @default "Loading" */
  label?: string;
  /** Size token: sm fits inside inputs/buttons, lg reads at region level. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Optional utility classes on the root. */
  className?: string;
}

/** Indeterminate loading indicator. */
const Spinner: React.FC<SpinnerProps> = ({
  label = "Loading",
  size = "md",
  className,
}) => (
  <span
    role="status"
    aria-label={label}
    className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
  />
);

export default Spinner;
