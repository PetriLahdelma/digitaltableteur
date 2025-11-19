import React from "react";
import styles from "./Button.module.css";
import {
  getSemanticIcon,
  type SemanticStatus,
} from "../../utils/semanticIcons";
import Icon from "@dt/Icon";

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
  /** Icon can be a React element, component, or a Phosphor icon name string (e.g., "spinner-gap") */
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
    const lookupIcon = (candidate: unknown): unknown => {
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (!trimmed) return undefined;
        return (
          <Icon
            name={trimmed}
            ariaLabel={trimmed}
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

    const buttonRef = React.useRef<HTMLButtonElement | null>(null);

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

    const assignRefs = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    };

    return (
      <button
        ref={assignRefs}
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
