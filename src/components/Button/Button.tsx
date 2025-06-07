import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  variant?: "primary" | "secondary" | "tertiary" | "error" | "success" | "info";
  disabled?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children?: React.ReactNode | React.ReactNode[];
  accessibleDescription?: string;
  accessibleName?: string;
  accessibleNameRef?: string;
  accessibleRole?: "button" | "link";
  submits?: boolean;
  tooltip?: string;
  type?: "button" | "submit" | "reset";
  // eslint-disable-next-line no-unused-vars
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  disabled = false,
  icon,
  endIcon,
  children,
  accessibleDescription,
  accessibleName,
  accessibleNameRef,
  accessibleRole = "button",
  submits = false,
  tooltip,
  type = "button",
  onClick,
}) => {
  const normalizedIcon = typeof icon === "function" ? React.createElement(icon) : icon;
  const normalizedEndIcon = typeof endIcon === "function" ? React.createElement(endIcon) : endIcon;

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${!children && normalizedIcon ? styles["icon-only"] : ""}`}
      disabled={disabled}
      aria-describedby={accessibleDescription}
      aria-label={accessibleName}
      aria-labelledby={accessibleNameRef}
      role={accessibleRole}
      type={submits ? "submit" : type}
      title={tooltip}
      onClick={onClick}
    >
      {normalizedIcon}
      {children && <span className={styles.text}>{children}</span>}
      {normalizedEndIcon}
    </button>
  );
};

export default Button;
