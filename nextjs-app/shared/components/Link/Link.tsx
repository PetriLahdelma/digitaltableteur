import React from "react";
import styles from "./Link.module.css";
import "../../styles/variables.css";
import Icon from "@dt/Icon";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
}

const INTERNAL_HOST = "digitaltableteur.com";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const INTERNAL_URL_BASE = "https://www.digitaltableteur.com";

function isInternalHostname(hostname: string): boolean {
  return hostname === INTERNAL_HOST || hostname.endsWith(`.${INTERNAL_HOST}`);
}

function normalizeHref(href: string): string {
  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return "#";
  }

  if (
    trimmedHref.startsWith("/") ||
    trimmedHref.startsWith("./") ||
    trimmedHref.startsWith("../") ||
    trimmedHref.startsWith("?") ||
    trimmedHref.startsWith("#")
  ) {
    return trimmedHref;
  }

  try {
    const parsed = new URL(trimmedHref, INTERNAL_URL_BASE);

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return "#";
    }

    return trimmedHref;
  } catch {
    return "#";
  }
}

function isExternalHref(href: string): boolean {
  if (!href || href === "#") {
    return false;
  }

  if (
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("?") ||
    href.startsWith("#")
  ) {
    return false;
  }

  try {
    const parsed = new URL(href, INTERNAL_URL_BASE);

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return false;
    }

    if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") {
      return false;
    }

    return !isInternalHostname(parsed.hostname);
  } catch {
    return false;
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
} as const;

const ICON_SIZE = { sm: 20, md: 24, lg: 32 } as const;

/** Accessible inline link with size tokens, a focus ring, and an optional external-link icon. */
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href = "#", size = "md", children, className = "", ...rest }, ref) => {
    const normalizedHref = React.useMemo(() => normalizeHref(href), [href]);
    const isExternal = React.useMemo(
      () => isExternalHref(normalizedHref),
      [normalizedHref],
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
        className={`${styles.link} ${SIZE_CLASS[size]} wavyUnderline ${className}`.trim()}
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
