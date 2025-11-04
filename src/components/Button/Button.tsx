import React from "react";
import styles from "./Button.module.css";
import {
  getSemanticIcon,
  type SemanticStatus,
} from "../../utils/semanticIcons";
import { FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "warning"
    | "success"
    | "info";
  disabled?: boolean;
  /** Icon can be a React element, component, or a string key (e.g., "IoMdRefresh") */
  icon?: React.ReactNode | string;
  endIcon?: React.ReactNode | string;
  children?: React.ReactNode | React.ReactNode[];
  accessibleDescription?: string;
  accessibleName?: string;
  accessibleNameRef?: string;
  accessibleRole?: "button" | "link";
  submits?: boolean;
  tooltip?: string;
  size?: "s" | "m" | "l";
  /** When true, replaces primary (blue) text/border color with white for supported variants */
  inverse?: boolean;
  /** When true, applies rounded corners to the button */
  rounded?: boolean;
}

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
const VARIANT_TO_STATUS: Partial<Record<ButtonVariant, SemanticStatus>> = {
  error: "error",
  warning: "warning",
  success: "success",
  info: "info",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      disabled = false,
      rounded = false,
      icon,
      endIcon,
      children,
      accessibleDescription,
      accessibleName,
      accessibleNameRef,
      accessibleRole = "button",
      submits = false,
      tooltip,
      type = "button",
      onClick,
      className = "",
      size = "m",
      inverse = false,
      ...rest
    },
    ref,
  ) => {
    // Icon registry for string lookup (extend as needed)
    const ICON_REGISTRY: Record<
      string,
      React.ComponentType | React.ReactElement
    > = {
      IoMdRefresh: IoMdRefresh,
      FaSearch: FaSearch,
      FaArrowLeft: FaArrowLeft,
      FaArrowRight: FaArrowRight,
    };

    const lookupIcon = (candidate: unknown): unknown => {
      if (typeof candidate === "string") {
        return ICON_REGISTRY[candidate] ?? undefined;
      }
      return candidate;
    };

    const resolvedStartIcon =
      lookupIcon(icon) ??
      (VARIANT_TO_STATUS[variant]
        ? getSemanticIcon(VARIANT_TO_STATUS[variant]!)
        : undefined);

    const normalizeMaybeIcon = (candidate: unknown): React.ReactNode => {
      if (!candidate) return undefined;
      // Accept function components or class components
      if (typeof candidate === "function") {
        return React.createElement(candidate as React.ComponentType);
      }
      // Accept already constructed elements
      if (React.isValidElement(candidate)) return candidate;
      // Accept memo/forwardRef wrapped components provided as objects with $$typeof symbol
      if (
        typeof candidate === "object" &&
        candidate !== null &&
        // React internals: forwardRef/memo have $$typeof symbol and a 'render' or 'type'
        // We avoid referencing symbols directly; do a heuristic check.
        ((candidate as any).type || (candidate as any).render)
      ) {
        try {
          return React.createElement(candidate as React.ComponentType);
        } catch {
          // fall through to ignore
        }
      }
      // Primitive allowed but not typical for icons
      if (typeof candidate === "string" || typeof candidate === "number") {
        return candidate;
      }
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          "[Button] Ignoring invalid icon prop (expected React component or element):",
          candidate,
        );
      }
      return undefined;
    };

    const normalizedIcon = normalizeMaybeIcon(resolvedStartIcon);
    const normalizedEndIcon = normalizeMaybeIcon(lookupIcon(endIcon));

    return (
      <button
        ref={ref}
        className={[
          styles.button,
          styles[variant],
          styles[size],
          !children && normalizedIcon ? styles["iconOnly"] : "",
          inverse ? styles.inverse : "",
          rounded ? styles.rounded : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        aria-describedby={accessibleDescription}
        aria-label={accessibleName}
        aria-labelledby={accessibleNameRef}
        role={accessibleRole}
        type={submits ? "submit" : type}
        title={tooltip}
        onClick={onClick}
        {...rest}
      >
        {normalizedIcon && (
          <span
            className={styles.icon}
            data-size={size}
            data-button-slot="icon"
          >
            {normalizedIcon}
          </span>
        )}
        {children && (
          <span className={styles.text} data-button-slot="text">
            {children}
          </span>
        )}
        {normalizedEndIcon && (
          <span
            className={styles.icon}
            data-size={size}
            data-button-slot="end-icon"
          >
            {normalizedEndIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
