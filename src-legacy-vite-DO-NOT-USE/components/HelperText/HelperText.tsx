import React from "react";
import styles from "./HelperText.module.css";

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
}

const HelperText = React.forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({ children, id, className }, ref) => {
    const mergedClassName = [styles.helperText, className]
      .filter(Boolean)
      .join(" ");

    return (
      <p ref={ref} id={id} className={mergedClassName}>
        {children}
      </p>
    );
  },
);

HelperText.displayName = "HelperText";

export default HelperText;
