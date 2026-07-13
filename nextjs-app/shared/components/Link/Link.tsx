import React from "react";
import styles from "./Link.module.css";
import Icon from "@dt/Icon";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg" | "inherit";
  /**
   * Wavy underline mode. "always" shows it permanently, "hover" reveals it
   * on hover and keyboard focus (nav lists like the site footer), "none"
   * omits it entirely. @default "always"
   */
  underline?: "always" | "hover" | "none";
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const URL_PARSE_BASE = "https://example.invalid";

type LinkDecision = {
  normalizedHref: string;
  isExternal: boolean;
};

function getCurrentOrigin(): string | null {
  return typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : null;
}

function analyzeHref(href: string, currentOrigin: string | null): LinkDecision {
  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return { normalizedHref: "#", isExternal: false };
  }

  if (
    (trimmedHref.startsWith("/") && !trimmedHref.startsWith("//")) ||
    trimmedHref.startsWith("./") ||
    trimmedHref.startsWith("../") ||
    trimmedHref.startsWith("?") ||
    trimmedHref.startsWith("#")
  ) {
    return { normalizedHref: trimmedHref, isExternal: false };
  }

  try {
    const base = currentOrigin ?? URL_PARSE_BASE;
    const parsed = new URL(trimmedHref, base);

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return { normalizedHref: "#", isExternal: false };
    }

    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isExternal =
      isHttp && (!currentOrigin || parsed.origin !== new URL(base).origin);

    return { normalizedHref: trimmedHref, isExternal };
  } catch {
    return { normalizedHref: "#", isExternal: false };
  }
}

function extractTextContent(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => extractTextContent(child)).join("");
  }

  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return extractTextContent(props.children);
  }

  return "";
}

const SIZE_CLASS = {
  sm: styles.linkSm,
  md: styles.linkMd,
  lg: styles.linkLg,
  // In-copy links: follow the surrounding text size (raw-anchor parity).
  inherit: styles.linkInherit,
} as const;

const ICON_SIZE = { sm: 20, md: 24, lg: 32, inherit: 20 } as const;

const UNDERLINE_CLASS = {
  always: "wavyUnderline",
  hover: `wavyUnderline ${styles.underlineHover}`,
  none: "",
} as const;

/** Accessible inline link with size tokens, a focus ring, an optional external-link icon, and always/hover/none wavy underline modes. */
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href = "#",
      size = "md",
      underline = "always",
      children,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const { normalizedHref, isExternal } = React.useMemo(
      () => analyzeHref(href, getCurrentOrigin()),
      [href],
    );
    const hasTextContent = React.useMemo(
      () => extractTextContent(children).trim().length > 0,
      [children],
    );

    return (
      <a
        ref={ref}
        href={normalizedHref}
        {...rest}
        rel={
          isExternal
            ? [rest.rel, "noopener", "noreferrer"].filter(Boolean).join(" ")
            : rest.rel
        }
        className={`${styles.link} ${SIZE_CLASS[size]} ${UNDERLINE_CLASS[underline]} ${className}`
          .replace(/\s+/g, " ")
          .trim()}
      >
        {children}
        {isExternal && hasTextContent && (
          <span className={styles.externalIcon}>
            <Icon
              name="arrow-square-out"
              size={ICON_SIZE[size]}
              ariaLabel="External link"
            />
          </span>
        )}
      </a>
    );
  },
);

Link.displayName = "Link";

export default Link;
