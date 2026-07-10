import React from "react";
import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react";
import styles from "./HelperText.module.css";

export type HelperTextState = "error" | "warning" | "success" | "info";

export interface HelperTextProps {
  /**
   * The helper text content to display
   */
  children: React.ReactNode;
  /**
   * Optional ID for aria-describedby association
   */
  id?: string;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Semantic state of the helper text (error, warning, success, info)
   * Default is neutral/no state
   */
  state?: HelperTextState;
}

const stateIcons: Record<HelperTextState, React.ReactNode> = {
  error: <WarningCircle weight="fill" size={16} />,
  warning: <Warning weight="fill" size={16} />,
  success: <CheckCircle weight="fill" size={16} />,
  info: <Info weight="fill" size={16} />,
};

/** Semantic helper copy for form fields (error, warning, success, info). */
const HelperText = React.forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({ children, id, className, state }, ref) => {
    const mergedClassName = [
      styles.helperText,
      state && styles[state],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const icon = state ? stateIcons[state] : null;

    return (
      <p
        ref={ref}
        id={id}
        className={mergedClassName}
        role={state === "error" ? "alert" : undefined}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </p>
    );
  },
);

HelperText.displayName = "HelperText";

export default HelperText;
