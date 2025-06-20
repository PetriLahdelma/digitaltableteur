import React, { useState } from "react";
import styles from "./Badge.module.css";
import * as FaIcons from "react-icons/fa";

// Dynamically create options and mapping for all icons
const iconOptions = {
  None: null,
  ...Object.fromEntries(
    Object.entries(FaIcons).map(([name, Icon]) => [name, <Icon key={name} />]),
  ),
};

interface BadgeProps {
  children: React.ReactNode;
  design?: "primary" | "success" | "info" | "error" | "neutral";
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
        styles[size], // Add size class
        className,
        square ? styles.square : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Remove badge"
          onClick={() => {
            setVisible(false);
            if (onRemove) onRemove();
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Badge;
