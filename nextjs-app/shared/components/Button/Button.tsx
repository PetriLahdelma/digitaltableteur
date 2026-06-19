"use client";

import React from "react";
import styles from "./Button.module.css";
import { STATUS_ICON_NAMES, type SemanticStatus } from "../../utils/semanticIcons";
import Icon, { type IconProps } from "@dt/Icon";

/** Visual weight of the button. */
export type ButtonVariant = "primary" | "secondary" | "tertiary";

/** Semantic color, matching the design-token palette. */
export type ButtonTone = "neutral" | "error" | "warning" | "success" | "info";

/** Surface the button sits on, for contrast-safe styling (static CSS, no ancestor sampling). */
export type ButtonSurface = "default" | "onDark" | "onBrand";

/** Control size scale. */
export type ButtonSize = "sm" | "md" | "lg";

const TONE_TO_STATUS: Partial<Record<ButtonTone, SemanticStatus>> = {
  error: "error",
  warning: "warning",
  success: "success",
  info: "info",
};

/** Properties shared by the button and link renderings. */
interface BaseButtonProps {
  /** Visual weight. @default "primary" */
  variant?: ButtonVariant;
  /** Semantic color, orthogonal to `variant`. @default "neutral" */
  tone?: ButtonTone;
  /** Size. @default "md" */
  size?: ButtonSize;
  /** Surface the button renders on; prefer this over absolute colors on tinted bands. @default "default" */
  surface?: ButtonSurface;
  /** Disables interaction and dims the control. @default false */
  disabled?: boolean;
  /** Shows a loading state and blocks interaction; sets `aria-busy`. @default false */
  loading?: boolean;
  /** Fully rounded (pill) corners. @default false */
  rounded?: boolean;
  /** Leading icon: a React node, a component, or a Phosphor icon name (e.g. `"arrow-left"`). */
  icon?: React.ReactNode | string;
  /** Trailing icon: a React node, a component, or a Phosphor icon name. */
  endIcon?: React.ReactNode | string;
  /** Button label. */
  children?: React.ReactNode;
  /** Accessible name; required for icon-only buttons. Maps to `aria-label`. */
  accessibleName?: string;
  /** id of an element that labels this button. Maps to `aria-labelledby`. */
  accessibleNameRef?: string;
  /** Extra context for assistive tech. Maps to `aria-describedby`. */
  accessibleDescription?: string;
  /** Native tooltip text; also used as an accessible-name fallback for icon-only buttons. */
  tooltip?: string;
}

/** Button rendered as a native `<button>`. */
export interface ButtonAsButton
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  /** When true, sets `type="submit"`. @default false */
  submits?: boolean;
  href?: never;
  target?: never;
  rel?: never;
}

/** Button rendered as an `<a>` for navigation. */
export interface ButtonAsLink
  extends BaseButtonProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  /** Destination URL. When provided, the button renders as an anchor. */
  href: string;
  submits?: never;
}

/**
 * Primary action control with an orthogonal `variant` (visual weight) and `tone`
 * (semantic color) model, optional loading state, and polymorphic button/link rendering.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button variant="secondary" tone="error">Delete</Button>
 * <Button variant="tertiary" icon="arrow-left">Back</Button>
 * <Button href="/about" variant="secondary">Learn more</Button>
 * <Button variant="primary" surface="onDark">On a dark band</Button>
 * ```
 */
export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Primary action control with `variant` (visual weight) and `tone` (semantic color), loading state, and polymorphic button/link rendering. */
const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      tone = "neutral",
      size = "md",
      surface = "default",
      disabled = false,
      loading = false,
      rounded = false,
      icon,
      endIcon,
      children,
      accessibleName,
      accessibleNameRef,
      accessibleDescription,
      tooltip,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const ariaLabelFromRest =
      typeof rest["aria-label"] === "string" ? rest["aria-label"].trim() : "";

    if (process.env.NODE_ENV !== "production") {
      const isIconOnly = !children && !!icon;
      const hasAccessibleName = !!(
        accessibleName ||
        accessibleNameRef ||
        tooltip ||
        ariaLabelFromRest
      );
      if (isIconOnly && !hasAccessibleName) {
        // eslint-disable-next-line no-console
        console.warn(
          "[Button] Icon-only button without an accessible name. " +
            "Add accessibleName, accessibleNameRef, or tooltip. " +
            'Example: <Button icon="search" accessibleName="Search" />',
        );
      }
    }

    const isLink = "href" in rest && rest.href !== undefined;

    // Icons are decorative (the button supplies the accessible name) and inherit
    // the button's resolved text color via currentColor. The icon's rendered
    // size is owned by CSS (`--btn-icon-size`), which overrides any icon
    // source; this numeric size only sets a sensible fallback box.
    const iconSize: IconProps["size"] =
      size === "sm" ? 18 : size === "lg" ? 24 : 20;
    const renderIcon = (candidate: React.ReactNode | string): React.ReactNode => {
      if (candidate == null || candidate === false) return undefined;
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (!trimmed) return undefined;
        return (
          <Icon name={trimmed} color="currentColor" size={iconSize} decorative />
        );
      }
      if (typeof candidate === "function") {
        return React.createElement(candidate as React.ComponentType);
      }
      if (React.isValidElement(candidate)) return candidate;
      return undefined;
    };

    const semanticStatus = TONE_TO_STATUS[tone];
    const resolvedIcon =
      renderIcon(icon as React.ReactNode | string) ??
      (semanticStatus ? (
        <Icon
          name={STATUS_ICON_NAMES[semanticStatus]}
          color="currentColor"
          size={iconSize}
          decorative
        />
      ) : undefined);
    const resolvedEndIcon = renderIcon(endIcon as React.ReactNode | string);
    const iconOnly = !children && !!resolvedIcon;

    const effectiveAriaLabel =
      accessibleName ||
      (tooltip && !accessibleNameRef ? tooltip : undefined) ||
      ariaLabelFromRest ||
      undefined;

    const commonProps = {
      className: [
        styles.button,
        styles[variant],
        tone !== "neutral" ? styles[tone] : "",
        styles[size],
        surface !== "default" ? styles[surface] : "",
        iconOnly ? styles.iconOnly : "",
        rounded ? styles.rounded : "",
        loading ? styles.loading : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
      "aria-label": effectiveAriaLabel,
      "aria-labelledby": accessibleNameRef,
      "aria-describedby": accessibleDescription,
      "aria-busy": loading || undefined,
      title: tooltip,
    };

    const content = (
      <>
        {resolvedIcon && (
          <span className={styles.icon} data-button-slot="icon">
            {resolvedIcon}
          </span>
        )}
        {children && (
          <span className={styles.text} data-button-slot="text">
            {children}
          </span>
        )}
        {resolvedEndIcon && (
          <span className={styles.icon} data-button-slot="end-icon">
            {resolvedEndIcon}
          </span>
        )}
      </>
    );

    if (isLink) {
      const { href, target, rel, ...linkRest } = rest as ButtonAsLink;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
          aria-disabled={disabled || loading || undefined}
          {...commonProps}
          {...linkRest}
        >
          {content}
        </a>
      );
    }

    const { submits = false, type, ...buttonRest } = rest as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || loading}
        type={submits ? "submit" : (type ?? "button")}
        {...commonProps}
        {...buttonRest}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
