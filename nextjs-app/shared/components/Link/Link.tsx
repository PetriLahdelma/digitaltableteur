import React from "react";
import styles from "./Link.module.css";
import "../../styles/variables.css";
import Icon from "@dt/Icon";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: "S" | "M" | "L";
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

const Link: React.FC<LinkProps> = ({
  href = "#",
  size = "M",
  children,
  className = "",
  ...rest
}) => {
  const normalizedHref = React.useMemo(() => normalizeHref(href), [href]);
  const isExternal = React.useMemo(
    () => isExternalHref(normalizedHref),
    [normalizedHref],
  );

  // Check if children contains actual text content
  const hasTextContent: boolean = React.useMemo((): boolean => {
    return extractTextContent(children).trim().length > 0;
  }, [children]);

  // Map link size to icon size
  const iconSize = size === "S" ? 20 : size === "L" ? 32 : 24;

  return (
    <a
      href={normalizedHref}
      {...rest}
      rel={
        isExternal
          ? [rest.rel, "noopener", "noreferrer"].filter(Boolean).join(" ")
          : rest.rel
      }
      className={`${styles.link} ${styles[`link${size}`]} wavyUnderline ${className}`.trim()}
    >
      {children}
      {isExternal && hasTextContent && (
        <span className={styles.externalIcon}>
          <Icon
            name="arrow-square-out"
            size={iconSize}
            ariaLabel="External link"
          />
        </span>
      )}
    </a>
  );
};

export default Link;
