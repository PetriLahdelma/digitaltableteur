"use client";

import React from "react";
import styles from "./Button.module.css";
import {
  getSemanticIcon,
  type SemanticStatus,
} from "../../utils/semanticIcons";
import Icon from "@dt/Icon";

/**
 * Base properties shared by button and link variants.
 */
interface BaseButtonProps {
  /** Visual style variant of the button */
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "secondaryError"
    | "tertiaryError"
    | "error"
    | "warning"
    | "success"
    | "info";
  /** Disables interaction and applies disabled styling */
  disabled?: boolean;
  /** Shows loading state with pulsing animation and disables interaction */
  loading?: boolean;
  /** Icon can be a React element, component, or a Phosphor icon name string (e.g., "spinner-gap") */
  icon?: React.ReactNode | string;
  /** Icon displayed at the end of the button content */
  endIcon?: React.ReactNode | string;
  /** Button label content */
  children?: React.ReactNode | React.ReactNode[];
  /** ARIA description for additional context */
  accessibleDescription?: string;
  /** ARIA label for accessible name override */
  accessibleName?: string;
  /** ID reference for aria-labelledby */
  accessibleNameRef?: string;
  /** ARIA role override (defaults to semantic element role) */
  accessibleRole?: "button" | "link";
  /** Tooltip text displayed on hover */
  tooltip?: string;
  /** Button size variant */
  size?: "s" | "m" | "l";
  /** When true, replaces primary (blue) text/border color with white for supported variants */
  inverse?: boolean;
  /** When true, applies rounded corners to the button */
  rounded?: boolean;
}

/**
 * Button rendered as a native `<button>` element.
 */
export interface ButtonAsButton
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  /** When true, button type becomes "submit" */
  submits?: boolean;
  href?: never;
  target?: never;
  rel?: never;
}

/**
 * Button rendered as an `<a>` element for navigation.
 */
export interface ButtonAsLink
  extends BaseButtonProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  /** URL to navigate to. When provided, renders as an anchor element */
  href: string;
  submits?: never;
}

/**
 * Button component with polymorphic rendering (button or link).
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>Submit</Button>
 *
 * // Secondary button with icon
 * <Button variant="secondary" icon="arrow-left">Back</Button>
 *
 * // Button as link
 * <Button href="/about" variant="tertiary">Learn More</Button>
 *
 * // Inverse button on dark background
 * <Button variant="primary" inverse>Contrast Button</Button>
 * ```
 */
export type ButtonProps = ButtonAsButton | ButtonAsLink;

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
const VARIANT_TO_STATUS: Partial<Record<ButtonVariant, SemanticStatus>> = {
  error: "error",
  secondaryError: "error",
  tertiaryError: "error",
  warning: "warning",
  success: "success",
  info: "info",
};

const isTransparentColor = (value?: string | null) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (
    normalized === "transparent" ||
    normalized === "inherit" ||
    normalized === "initial" ||
    normalized === "unset"
  ) {
    return true;
  }
  if (normalized.startsWith("rgba(")) {
    const alpha = normalized.split(",").pop()?.replace(")", "").trim();
    if (alpha === "0" || alpha === "0.0") return true;
  }
  return normalized === "rgba(0,0,0,0)";
};

const getElementBackgroundColor = (element: Element | null): string | null => {
  if (!element || typeof window === "undefined") return null;
  const styles = window.getComputedStyle(element);
  const background = styles?.backgroundColor;
  if (background && !isTransparentColor(background)) {
    return background;
  }
  return null;
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      disabled = false,
      loading = false,
      rounded = false,
      icon,
      endIcon,
      children,
      accessibleDescription,
      accessibleName,
      accessibleNameRef,
      accessibleRole,
      tooltip,
      className = "",
      size = "m",
      inverse = false,
      ...rest
    },
    ref,
  ) => {
    const isLink = "href" in rest && rest.href !== undefined;
    const submits = "submits" in rest ? rest.submits : false;
    const type = "type" in rest ? rest.type : "button";
    const onClick = "onClick" in rest ? rest.onClick : undefined;

    // Determine icon color based on variant
    const getIconColor = (): string | undefined => {
      // Primary, error, success, info buttons use white icons
      if (
        variant === "primary" ||
        variant === "error" ||
        variant === "success" ||
        variant === "info"
      ) {
        return "var(--color-white)";
      }
      // Warning uses specific contrast color
      if (variant === "warning") {
        return "var(--color-warning-text)";
      }
      // Secondary and tertiary inherit color from button text
      return undefined;
    };

    const iconColor = getIconColor();

    const lookupIcon = (candidate: unknown): unknown => {
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (!trimmed) return undefined;
        return (
          <Icon
            name={trimmed}
            ariaLabel={trimmed}
            color={iconColor}
            data-button-string-icon={trimmed}
          />
        );
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
      // Accept already constructed elements - clone with color if it's an Icon
      if (React.isValidElement(candidate)) {
        // If the element accepts a color prop and we have an icon color, clone with color
        const props = candidate.props as Record<string, unknown> | undefined;
        if (iconColor && props && "color" in props) {
          return React.cloneElement(candidate as React.ReactElement<any>, {
            color: iconColor,
          });
        }
        return candidate;
      }
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

    const buttonRef = React.useRef<
      HTMLButtonElement | HTMLAnchorElement | null
    >(null);

    const setInverseColorFromSurface = React.useCallback(() => {
      if (
        !inverse ||
        variant !== "primary" ||
        typeof window === "undefined" ||
        !buttonRef.current
      ) {
        buttonRef.current?.style.removeProperty("--dt-button-inverse-fg");
        return;
      }

      let ancestor: HTMLElement | null = buttonRef.current.parentElement;
      while (ancestor) {
        const bg = getElementBackgroundColor(ancestor);
        if (bg) {
          // Use ancestor background as foreground (text) color for inverse primary.
          buttonRef.current.style.setProperty("--dt-button-inverse-fg", bg);
          return;
        }
        ancestor = ancestor.parentElement;
      }
      buttonRef.current.style.removeProperty("--dt-button-inverse-fg");
    }, [inverse, variant]);

    useIsomorphicLayoutEffect(() => {
      setInverseColorFromSurface();
      if (!inverse || variant !== "primary" || !buttonRef.current) {
        return;
      }

      const handleWindowChange = () => {
        setInverseColorFromSurface();
      };

      window.addEventListener("resize", handleWindowChange);
      window.addEventListener("scroll", handleWindowChange, true);

      const resizeObserver =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => setInverseColorFromSurface())
          : null;
      const mutationObserver =
        typeof MutationObserver !== "undefined"
          ? new MutationObserver(() => setInverseColorFromSurface())
          : null;

      const observedNodes: Element[] = [];
      let ancestor = buttonRef.current.parentElement;
      while (ancestor) {
        observedNodes.push(ancestor);
        mutationObserver?.observe(ancestor, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
        resizeObserver?.observe(ancestor);
        ancestor = ancestor.parentElement;
      }

      return () => {
        window.removeEventListener("resize", handleWindowChange);
        window.removeEventListener("scroll", handleWindowChange, true);
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
      };
    }, [inverse, setInverseColorFromSurface, variant]);

    const assignRefs = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
      buttonRef.current = node;
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (
          ref as React.MutableRefObject<
            HTMLButtonElement | HTMLAnchorElement | null
          >
        ).current = node;
      }
    };

    const commonProps = {
      className: [
        styles.button,
        styles[variant],
        styles[size],
        !children && normalizedIcon ? styles["iconOnly"] : "",
        inverse ? styles.inverse : "",
        rounded ? styles.rounded : "",
        loading ? styles.loading : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
      "aria-describedby": accessibleDescription,
      "aria-label": accessibleName,
      "aria-labelledby": accessibleNameRef,
      role: accessibleRole,
      title: tooltip,
    };

    const content = (
      <>
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
      </>
    );

    if (isLink) {
      const { href, target, rel, ...linkRest } = rest as ButtonAsLink;
      return (
        <a
          ref={assignRefs as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
          aria-disabled={disabled}
          {...commonProps}
          {...linkRest}
        >
          {content}
        </a>
      );
    }

    const {
      submits: _submits,
      type: _type,
      ...buttonRest
    } = rest as ButtonAsButton;

    return (
      <button
        ref={assignRefs as React.Ref<HTMLButtonElement>}
        disabled={disabled || loading}
        type={
          submits
            ? "submit"
            : (_type as "button" | "submit" | "reset" | undefined) || "button"
        }
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
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
