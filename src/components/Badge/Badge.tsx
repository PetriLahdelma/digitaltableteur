import React, { useState } from "react";
import styles from "./Badge.module.css";
import Button from "@dt/Button";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import {
  getSemanticIcon,
  type SemanticStatus,
} from "../../utils/semanticIcons";
import * as FaIcons from "react-icons/fa";

// Dynamically create options and mapping for all icons (store component refs, not JSX instances)
// This prevents passing plain objects or already-instantiated elements that trigger React type warnings.
const iconOptions: Record<string, React.ComponentType | null> = {
  None: null,
  ...Object.fromEntries(
    Object.entries(FaIcons).map(([name, Icon]) => [
      name,
      Icon as React.ComponentType,
    ]),
  ),
};

export const getIconElement = (name: string): React.ReactNode => {
  const Icon = iconOptions[name];
  if (!Icon) return null;
  return <Icon />;
};

type BadgeState = "success" | "info" | "error" | "warning" | "neutral";

const STATE_TO_STATUS: Partial<
  Record<Exclude<BadgeState, "neutral">, SemanticStatus>
> = {
  success: "success",
  info: "info",
  error: "error",
  warning: "warning",
};

interface BadgeProps {
  children: React.ReactNode;
  design?: "primary" | "secondary";
  state?: BadgeState;
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  square?: boolean; // New prop for square badge
  size?: "s" | "m" | "l"; // New size prop
  title?: string; // Optional title prop
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
      title,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(true);
    const semanticStatus =
      state && state !== "neutral" ? STATE_TO_STATUS[state] : undefined;
    const resolvedIcon =
      icon ?? (semanticStatus ? getSemanticIcon(semanticStatus) : null);
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
        {resolvedIcon && (
          <span className={styles.icon} aria-hidden={true}>
            {resolvedIcon}
          </span>
        )}
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
