import React, { isValidElement, useState } from "react";
import styles from "./Badge.module.css";
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

interface BadgeProps {
  children?: React.ReactNode;
  design?: "primary" | "secondary";
  state?: BadgeState;
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  square?: boolean;
  size?: "s" | "m" | "l";
  title?: string;
  // Count badge props
  count?: number;
  overflowCount?: number;
  showZero?: boolean;
  // Dot mode prop
  dot?: boolean;
  // Offset positioning prop
  offset?: [number, number];
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
      count,
      overflowCount = 99,
      showZero = false,
      dot = false,
      offset,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(true);

    // Count badge logic
    const isCountMode = count !== undefined;
    const shouldShowCount = isCountMode && (count > 0 || showZero);
    const displayCount =
      shouldShowCount && count! > overflowCount
        ? `${overflowCount}+`
        : count?.toString();

    // Dot mode - simple indicator with no text
    const isDotMode = dot && !isCountMode;

    // Determine if this badge wraps other content (for positioning)
    const isWrapper = (isCountMode || isDotMode) && children;

    const semanticStatus =
      state && state !== "neutral" ? STATE_TO_STATUS[state] : undefined;

    // Normalize incoming icon prop; guard against plain objects or other invalid types.
    let resolvedIcon: React.ReactNode = icon;
    if (
      resolvedIcon == null &&
      state &&
      semanticStatus &&
      !isCountMode &&
      !isDotMode
    ) {
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
      const isDev =
        typeof process !== "undefined" &&
        process.env?.NODE_ENV !== "production";
      // eslint-disable-next-line no-console
      if (isDev) {
        console.warn(
          "[Badge] Ignoring invalid icon prop (expected React element/component).",
          resolvedIcon,
        );
      }
      resolvedIcon = null;
    }

    if (!visible) return null;

    // Build aria-label for accessibility
    const stateLabel = state ? t(`badge.state.${state}`) : undefined;
    let ariaLabel = title || stateLabel;

    if (isCountMode && shouldShowCount) {
      ariaLabel = t("badge.countLabel", { count: count });
    } else if (isDotMode) {
      ariaLabel = ariaLabel || t("badge.dotIndicator");
    }

    // Offset positioning style
    const offsetStyle = offset
      ? {
          transform: `translate(${offset[0]}px, ${offset[1]}px)`,
        }
      : undefined;

    // Render dot mode
    if (isDotMode) {
      const dotBadge = (
        <span
          ref={ref}
          {...rest}
          className={[
            styles.badge,
            styles.dot,
            styles[design],
            state ? styles[state] : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          role="status"
          aria-label={ariaLabel}
          style={offsetStyle}
        />
      );

      return isWrapper ? (
        <span className={styles.wrapper}>
          {children}
          {dotBadge}
        </span>
      ) : (
        dotBadge
      );
    }

    // Render count badge
    if (isCountMode) {
      if (!shouldShowCount && !isWrapper) {
        return children ? <>{children}</> : null;
      }

      const countBadge = shouldShowCount ? (
        <span
          ref={ref}
          {...rest}
          className={[
            styles.badge,
            styles.count,
            styles[design],
            state ? styles[state] : "",
            styles[size],
            className,
            square ? styles.square : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="status"
          aria-label={ariaLabel}
          style={offsetStyle}
        >
          <span className={styles.countText}>{displayCount}</span>
        </span>
      ) : null;

      return isWrapper ? (
        <span className={styles.wrapper}>
          {children}
          {countBadge}
        </span>
      ) : (
        countBadge
      );
    }

    // Render standard badge (existing behavior)
    return (
      <span
        ref={ref}
        {...rest}
        className={[
          styles.badge,
          styles[design],
          state ? styles[state] : "",
          styles[size],
          className,
          square ? styles.square : "",
          removable ? styles.removable : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-label={ariaLabel}
        style={offsetStyle}
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
            icon={<Icon name="x" ariaLabel={t("badgeRemove")} />}
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
