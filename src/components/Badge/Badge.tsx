import React, { useState } from "react";
import styles from "./Badge.module.css";
import * as FaIcons from "react-icons/fa";
import Button from "../Button/Button";
import { IoMdClose } from "react-icons/io";

// Dynamically create options and mapping for all icons
const iconOptions = {
  None: null,
  ...Object.fromEntries(
    Object.entries(FaIcons).map(([name, Icon]) => [name, <Icon key={name} />]),
  ),
};

interface BadgeProps {
  children: React.ReactNode;
  design?: "primary" | "secondary";
  state?: "success" | "info" | "error" | "warning" | "neutral";
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  square?: boolean; // New prop for square badge
  size?: "s" | "m" | "l"; // New size prop
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  design = "primary",
  state,
  className = "",
  removable = false,
  onRemove,
  icon,
  square = false,
  size = "m", // Default to medium
}) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <span
      className={[
        styles.badge,
        styles[design],
        state ? styles[state] : "",
        styles[size], // Add size class
        className,
        square ? styles.square : "",
        removable ? styles.removable : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
      {removable && (
        <Button
          size={size === "s" ? "s" : size === "l" ? "l" : "m"}
          type="button"
          icon={IoMdClose ? <IoMdClose /> : null}
          className={styles.closeButton}
          aria-label="Remove badge"
          accessibleName="Remove badge"
          onClick={() => {
            setVisible(false);
            if (onRemove) onRemove();
          }}
        ></Button>
      )}
    </span>
  );
};

export default Badge;
