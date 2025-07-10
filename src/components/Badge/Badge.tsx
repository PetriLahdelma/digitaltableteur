import React, { useState } from "react";
import styles from "./Badge.module.css";
import * as FaIcons from "react-icons/fa";
import Button from "@dt/Button";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";

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

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      design = "primary",
      state,
      removable = false,
      onRemove,
      icon,
      className,
      square = false,
      size = "m",
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(true);
    if (!visible) return null;
    return (
      <span
        ref={ref}
        {...rest}
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
        {icon && <span className="badge__icon">{icon}</span>}
        <span className="badge__content">
          {typeof children === "string" ? t(children) : children}
        </span>
        {removable && (
          <Button
            size={size === "s" ? "s" : size === "l" ? "l" : "m"}
            type="button"
            icon={IoMdClose ? <IoMdClose /> : null}
            className={styles.closeButton}
            aria-label={t("badgeRemove")}
            accessibleName={t("badgeRemove")}
            onClick={() => {
              setVisible(false);
              if (onRemove) onRemove();
            }}
          ></Button>
        )}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export default Badge;
