import React, { isValidElement, useState } from "react";
import styles from "./Badge.module.css";
import Button from "@dt/Button";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import {
  getSemanticIcon,
  type SemanticStatus,
} from "../../utils/semanticIcons";
import * as FaIcons from "react-icons/fa";

// Dynamically create options and mapping for all icons
const iconOptions = {
  None: null,
  ...Object.fromEntries(
    Object.entries(FaIcons).map(([name, Icon]) => [name, <Icon key={name} />]),
  ),
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
    // Normalize incoming icon prop; guard against plain objects or other invalid types.
    let resolvedIcon: React.ReactNode = icon;
    if (resolvedIcon == null && semanticStatus) {
      resolvedIcon = getSemanticIcon(semanticStatus);
    }
    // If caller passed a component function/class instead of an element, create it
    if (resolvedIcon && typeof resolvedIcon === "function") {
      try {
        const MaybeComponent = resolvedIcon as React.ComponentType;
        resolvedIcon = <MaybeComponent />;
      } catch {
        resolvedIcon = null;
      }
    }
    // Reject non-element objects (e.g., plain object icon prop)
    if (
      resolvedIcon &&
      typeof resolvedIcon === "object" &&
      !isValidElement(resolvedIcon)
    ) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[Badge] Ignoring invalid icon prop (expected React element/component).",
          resolvedIcon,
        );
      }
      resolvedIcon = null;
    }
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
