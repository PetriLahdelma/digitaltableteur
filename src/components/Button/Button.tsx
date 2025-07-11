import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "warning"
    | "success"
    | "info";
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
  size?: "s" | "m" | "l";
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
  className = "",
  size = "m",
  ...rest
}) => {
  const normalizedIcon =
    typeof icon === "function" ? React.createElement(icon) : icon;
  const normalizedEndIcon =
    typeof endIcon === "function" ? React.createElement(endIcon) : endIcon;

  return (
    <button
      className={[
        styles.button,
        styles[variant],
        styles[size],
        !children && normalizedIcon ? styles["iconOnly"] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      aria-describedby={accessibleDescription}
      aria-label={accessibleName}
      aria-labelledby={accessibleNameRef}
      role={accessibleRole}
      type={submits ? "submit" : type}
      title={tooltip}
      onClick={onClick}
      {...rest}
    >
      {normalizedIcon && (
        <span className={styles.icon} data-size={size}>
          {normalizedIcon}
        </span>
      )}
      {children && <span className={styles.text}>{children}</span>}
      {normalizedEndIcon && (
        <span className={styles.icon} data-size={size}>
          {normalizedEndIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
