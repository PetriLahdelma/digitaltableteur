import { cva } from "class-variance-authority";
import styles from "./Badge.module.css";

export const badgeVariants = cva(styles.badge, {
  variants: {
    size: {
      s: styles.s,
      m: "",
      l: styles.l,
    },
  },
  defaultVariants: { size: "m" },
});

import React, { isValidElement, useState } from "react";
import Button from "@dt/Button";
import Icon from "@dt/Icon";
import { useTranslation } from "react-i18next";
import {
  getSemanticIcon,
  type SemanticStatus,
  STATUS_ICON_NAMES,
} from "../../utils/semanticIcons";

type BadgeState = "success" | "info" | "error" | "warning" | "neutral";

const STATE_TO_STATUS: Partial<
  Record<Exclude<BadgeState, "neutral">, SemanticStatus>
> = {
  success: "success",
  info: "info",
  error: "error",
  warning: "warning",
};

// Icon colors for primary badges (need high contrast)
const PRIMARY_ICON_COLORS: Record<BadgeState, string> = {
  success: "var(--color-white)",
  info: "var(--color-white)",
  error: "var(--color-white)",
  warning: "var(--color-white)",
  neutral: "var(--color-black)",
};

export interface BadgeProps {
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
  /**
   * ARIA role for accessibility.
   * - undefined (default): No role, suitable for static decorative badges
   * - "status": Use for dynamic content that updates (e.g., notification counts)
   *   Screen readers will announce changes with aria-live="polite"
   *
   * @example
   * // Static badge (no announcements)
   * <Badge state="success">Completed</Badge>
   *
   * // Dynamic badge (announces updates)
   * <Badge role="status" state="info">{unreadCount} new</Badge>
   */
  role?: "status";
}

/** Compact status label with semantic state, size, and optional icon. */
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
      role,
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
    if (resolvedIcon == null && state && semanticStatus) {
      // For primary badges, use manual icon with proper contrast color
      if (design === "primary") {
        const iconName = STATUS_ICON_NAMES[semanticStatus];
        const iconColor = PRIMARY_ICON_COLORS[state];
        resolvedIcon = <Icon name={iconName} color={iconColor} />;
      } else {
        // For secondary badges, use semantic icon with semantic colors
        resolvedIcon = getSemanticIcon(semanticStatus);
      }
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
        role={role}
        aria-live={role === "status" ? "polite" : undefined}
        {...rest}
        className={[
          badgeVariants({ size }),
          styles[design],
          state ? styles[state] : "",
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
            variant="tertiary"
            size={size === "s" ? "sm" : size === "l" ? "lg" : "md"}
            type="button"
            icon={<Icon name="x" ariaLabel={t("badgeRemove")} />}
            className={styles.closeButton}
            accessibleName={t("badgeRemove")}
            onClick={() => {
              setVisible(false);
              if (onRemove) onRemove();
            }}
          />
        )}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export default Badge;
