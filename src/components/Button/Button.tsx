import React from "react";
import styles from "./Button.module.css";
import {
  getSemanticIcon,
  type SemanticStatus,
} from "../../utils/semanticIcons";
import Icon from "@dt/Icon";

type BaseButtonProps = {
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
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  className?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
};

type AnchorButtonProps = BaseButtonProps &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof BaseButtonProps | "children"
  > & {
    href: string;
  };

type NativeButtonProps = BaseButtonProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof BaseButtonProps | "children" | "href"
  > & {
    href?: undefined;
    target?: undefined;
    rel?: undefined;
  };

type ButtonProps = AnchorButtonProps | NativeButtonProps;

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
const VARIANT_TO_STATUS: Partial<Record<ButtonVariant, SemanticStatus>> = {
  error: "error",
  warning: "warning",
  success: "success",
  info: "info",
};

const ZERO_ALPHA_COMMA_PATTERN = /rgba\([^)]+,\s*0(?:\.0+)?\)$/;
const ZERO_ALPHA_SLASH_PATTERN = /rgb\([^)]+\/\s*0(?:\.0+)?\)$/;

const isTransparentColor = (candidate: string | null | undefined): boolean => {
  if (!candidate) return true;
  const normalized = candidate.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) return true;
  if (
    normalized === "transparent" ||
    normalized === "initial" ||
    normalized === "inherit" ||
    normalized === "unset"
  ) {
    return true;
  }
  if (ZERO_ALPHA_COMMA_PATTERN.test(normalized)) return true;
  if (ZERO_ALPHA_SLASH_PATTERN.test(normalized)) return true;
  return false;
};

const findNearestSurfaceColor = (buttonEl: HTMLElement): string | undefined => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined;
  }
  let current: HTMLElement | null = buttonEl.parentElement;
  while (current) {
    const color = window.getComputedStyle(current).backgroundColor;
    if (!isTransparentColor(color)) {
      return color;
    }
    current = current.parentElement;
  }
  if (document.body) {
    const bodyColor = window.getComputedStyle(document.body).backgroundColor;
    if (!isTransparentColor(bodyColor)) return bodyColor;
  }
  if (document.documentElement) {
    const rootColor = window.getComputedStyle(
      document.documentElement,
    ).backgroundColor;
    if (!isTransparentColor(rootColor)) return rootColor;
  }
  return undefined;
};

const collectAncestorChain = (element: HTMLElement): HTMLElement[] => {
  const ancestors: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();
  let current: HTMLElement | null = element.parentElement;
  while (current) {
    if (!seen.has(current)) {
      ancestors.push(current);
      seen.add(current);
    }
    current = current.parentElement;
  }
  return ancestors;
};

const Button = React.forwardRef<HTMLElement, ButtonProps>(
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
      style: styleProp,
      href,
      target,
      rel,
      tabIndex,
      ...rest
    },
    ref,
  ) => {
    const internalButtonRef = React.useRef<HTMLElement | null>(null);
    const [dynamicInverseColor, setDynamicInverseColor] = React.useState<
      string | undefined
    >(undefined);
    const lastAppliedColor = React.useRef<string | undefined>(undefined);

    const setButtonRef = React.useCallback(
      (node: HTMLElement | null) => {
        internalButtonRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref],
    );

    const shouldSyncInverseColor =
      inverse && variant === "primary" && typeof window !== "undefined";

    React.useEffect(() => {
      if (!shouldSyncInverseColor) {
        lastAppliedColor.current = undefined;
        setDynamicInverseColor(undefined);
        return;
      }
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }
      const buttonElement = internalButtonRef.current;
      if (!buttonElement) return;

      let disposed = false;

      const applyColor = () => {
        if (disposed) return;
        const detectedColor = findNearestSurfaceColor(buttonElement);
        if (detectedColor === lastAppliedColor.current) {
          return;
        }
        lastAppliedColor.current = detectedColor;
        setDynamicInverseColor(detectedColor);
      };

      applyColor();

      const cleanupFns: Array<() => void> = [];
      const ancestors = collectAncestorChain(buttonElement);

      if (typeof MutationObserver !== "undefined") {
        ancestors.forEach((node) => {
          const observer = new MutationObserver(applyColor);
          observer.observe(node, {
            attributes: true,
            attributeFilter: ["class", "style"],
          });
          cleanupFns.push(() => observer.disconnect());
        });
      }

      if (
        buttonElement.parentElement &&
        typeof ResizeObserver !== "undefined"
      ) {
        const resizeObserver = new ResizeObserver(() => applyColor());
        resizeObserver.observe(buttonElement.parentElement);
        cleanupFns.push(() => resizeObserver.disconnect());
      }

      if (typeof window.matchMedia === "function") {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = () => applyColor();
        if (typeof media.addEventListener === "function") {
          media.addEventListener("change", listener);
          cleanupFns.push(() => media.removeEventListener("change", listener));
        } else if (typeof media.addListener === "function") {
          media.addListener(listener);
          cleanupFns.push(() => media.removeListener(listener));
        }
      }

      const intervalId = window.setInterval(applyColor, 1500);
      cleanupFns.push(() => window.clearInterval(intervalId));

      return () => {
        disposed = true;
        cleanupFns.forEach((cleanup) => cleanup());
      };
    }, [shouldSyncInverseColor]);

    const buttonStyle = React.useMemo<React.CSSProperties | undefined>(() => {
      if (shouldSyncInverseColor && dynamicInverseColor) {
        return {
          ...(styleProp ?? {}),
          "--dt-button-inverse-color": dynamicInverseColor,
        };
      }
      return styleProp;
    }, [shouldSyncInverseColor, dynamicInverseColor, styleProp]);

    // Icon registry for string lookup (extend as needed)
    const ICON_REGISTRY: Record<string, () => React.ReactElement> = {
      IoMdRefresh: () => <Icon name="arrows-clockwise" />,
      FaSearch: () => <Icon name="magnifying-glass" />,
      FaArrowLeft: () => <Icon name="arrow-left" />,
      FaArrowRight: () => <Icon name="arrow-right" />,
    };

    const lookupIcon = (candidate: unknown): unknown => {
      if (typeof candidate === "string") {
        const iconFactory = ICON_REGISTRY[candidate];
        return iconFactory ? iconFactory() : undefined;
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

    const combinedClassName = [
      styles.button,
      styles[variant],
      styles[size],
      !children && normalizedIcon ? styles["iconOnly"] : "",
      inverse ? styles.inverse : "",
      rounded ? styles.rounded : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const resolvedRole =
      accessibleRole ?? (href ? ("link" as const) : ("button" as const));

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

    if (href) {
      const anchorRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      const anchorOnClick = onClick as
        | React.MouseEventHandler<HTMLAnchorElement>
        | undefined;

      return (
        <a
          ref={setButtonRef as React.Ref<HTMLAnchorElement>}
          className={combinedClassName}
          href={disabled ? undefined : href}
          target={target}
          rel={rel}
          aria-disabled={disabled || undefined}
          aria-describedby={accessibleDescription}
          aria-label={accessibleName}
          aria-labelledby={accessibleNameRef}
          role={resolvedRole}
          title={tooltip}
          style={buttonStyle}
          tabIndex={disabled ? -1 : tabIndex}
          {...anchorRest}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            anchorOnClick?.(event);
          }}
        >
          {content}
        </a>
      );
    }

    const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    const buttonOnClick = onClick as
      | React.MouseEventHandler<HTMLButtonElement>
      | undefined;
    const resolvedButtonType = (submits ? "submit" : type) as
      | "button"
      | "submit"
      | "reset"
      | undefined;

    return (
      <button
        ref={setButtonRef as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        disabled={disabled}
        aria-describedby={accessibleDescription}
        aria-label={accessibleName}
        aria-labelledby={accessibleNameRef}
        role={resolvedRole}
        type={resolvedButtonType}
        title={tooltip}
        onClick={buttonOnClick}
        style={buttonStyle}
        tabIndex={tabIndex}
        {...buttonRest}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
