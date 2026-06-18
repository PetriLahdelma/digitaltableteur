import { cva } from "class-variance-authority";
import styles from "./Badge.module.css";

export const badgeVariants = cva(styles.badge, {
  variants: {
    size: {
      sm: styles.sm,
      md: "",
      lg: styles.lg,
    },
  },
  defaultVariants: { size: "md" },
});

import React, { isValidElement, useState } from "react";
import Icon from "@dt/Icon";
import { useTranslation } from "react-i18next";
import { type SemanticStatus, STATUS_ICON_NAMES } from "../../utils/semanticIcons";

/** Visual weight. */
export type BadgeVariant = "primary" | "secondary";
/** Semantic colour, matching the design-token palette. */
export type BadgeTone = "neutral" | "error" | "warning" | "success" | "info";
/** Size. */
export type BadgeSize = "sm" | "md" | "lg";

const TONE_TO_STATUS: Partial<
  Record<Exclude<BadgeTone, "neutral">, SemanticStatus>
> = {
  success: "success",
  info: "info",
  error: "error",
  warning: "warning",
};

export interface BadgeProps {
  children: React.ReactNode;
  /** Visual weight. @default "primary" */
  variant?: BadgeVariant;
  /** Semantic colour, orthogonal to `variant`. @default "neutral" */
  tone?: BadgeTone;
  /** Size. @default "md" */
  size?: BadgeSize;
  className?: string;
  /** Renders a dismiss control that removes the badge. */
  removable?: boolean;
  /** Called after the badge is dismissed. */
  onRemove?: () => void;
  /** Leading icon; a semantic icon is supplied automatically for non-neutral tones. */
  icon?: React.ReactNode;
  /** Square (non-pill) corners. */
  square?: boolean;
  /** Native tooltip text. */
  title?: string;
  /**
   * ARIA role. `"status"` makes dynamic updates announce via `aria-live="polite"`
   * (e.g. a live notification count). Omit for static decorative badges.
   */
  role?: "status";
}

/** Compact status label with semantic tone, size, and an optional icon. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "primary",
      tone,
      removable = false,
      onRemove,
      icon,
      className,
      square = false,
      size = "md",
      title,
      role,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(true);
    const semanticStatus =
      tone && tone !== "neutral" ? TONE_TO_STATUS[tone] : undefined;

    let resolvedIcon: React.ReactNode = icon;
    if (resolvedIcon == null && tone && semanticStatus) {
      // The badge already sets a contrast-correct text color per variant×tone,
      // so the semantic icon inherits it via currentColor.
      resolvedIcon = (
        <Icon
          name={STATUS_ICON_NAMES[semanticStatus]}
          color="currentColor"
          decorative
        />
      );
    }
    if (resolvedIcon && typeof resolvedIcon === "function") {
      try {
        const MaybeComponent = resolvedIcon as React.ComponentType;
        resolvedIcon = <MaybeComponent />;
      } catch {
        resolvedIcon = null;
      }
    }
    if (
      resolvedIcon &&
      typeof resolvedIcon === "object" &&
      !isValidElement(resolvedIcon)
    ) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
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
        title={title}
        {...rest}
        className={[
          badgeVariants({ size }),
          styles[variant],
          tone ? styles[tone] : "",
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
          <button
            type="button"
            className={styles.closeButton}
            aria-label={t("badgeRemove")}
            onClick={() => {
              setVisible(false);
              if (onRemove) onRemove();
            }}
          >
            <Icon name="x" color="currentColor" size={14} decorative />
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export default Badge;
