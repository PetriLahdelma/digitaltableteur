import { cva } from "class-variance-authority";
import styles from "./Badge.module.css";

export const badgeVariants = cva(styles.badge, {
  variants: {
    size: {
      xs: styles.xs,
      sm: styles.sm,
      md: "",
      lg: styles.lg,
    },
  },
  defaultVariants: { size: "md" },
});

import React, { isValidElement, useState } from "react";
import Icon from "@dt/Icon";
import StatusDot from "@dt/StatusDot";
import { useTranslate } from "../../lib/translation";
import { type SemanticStatus, STATUS_ICON_NAMES } from "../../utils/semanticIcons";

/** Visual weight. */
export type BadgeVariant = "primary" | "secondary";
/** Semantic colour, matching the design-token palette. */
export type BadgeTone = "neutral" | "error" | "warning" | "success" | "info";
/** Size. */
export type BadgeSize = "xs" | "sm" | "md" | "lg";

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
  /**
   * Render a leading color-coded {@link StatusDot} (from `tone`) instead of the
   * semantic icon — e.g. lifecycle badges (alpha/beta/stable/deprecated). An
   * explicit `icon` still wins.
   */
  dot?: boolean;
  /** Square (non-pill) corners. */
  square?: boolean;
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
      dot = false,
      className,
      square = false,
      size = "md",
      role,
      ...rest
    },
    ref,
  ) => {
    const t = useTranslate();
    const [visible, setVisible] = useState(true);
    const semanticStatus =
      tone && tone !== "neutral" ? TONE_TO_STATUS[tone] : undefined;

    // Icons track the badge's size step: sm 16px, md 24px, lg 32px.
    const badgeIconSize = { xs: "xs", sm: "xs", md: "md", lg: "lg" } as const;
    // StatusDot follows the badge size step so lifecycle dots scale with sm/md/lg.
    const badgeDotSize = { xs: "sm", sm: "sm", md: "md", lg: "lg" } as const;

    let resolvedIcon: React.ReactNode = icon;
    if (resolvedIcon == null && dot) {
      // Leading color-coded dot instead of the semantic icon (tone drives the
      // color; undefined tone falls back to StatusDot's neutral).
      resolvedIcon = <StatusDot tone={tone} size={badgeDotSize[size]} />;
    } else if (resolvedIcon == null && tone && semanticStatus) {
      // The badge already sets a contrast-correct text color per variant×tone,
      // so the semantic icon inherits it via currentColor.
      resolvedIcon = (
        <Icon
          name={STATUS_ICON_NAMES[semanticStatus]}
          size={badgeIconSize[size]}
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
    // Custom DT Icons without an explicit size follow the size step too, so
    // sm/md/lg badges scale their icons instead of all rendering Icon's 24px
    // default. An explicit consumer size always wins.
    if (
      isValidElement(resolvedIcon) &&
      resolvedIcon.type === Icon &&
      (resolvedIcon.props as { size?: string }).size == null
    ) {
      resolvedIcon = React.cloneElement(
        resolvedIcon as React.ReactElement<{ size?: string }>,
        { size: badgeIconSize[size] },
      );
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
        <span className={["badge__content", styles.label].join(" ")}>
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
