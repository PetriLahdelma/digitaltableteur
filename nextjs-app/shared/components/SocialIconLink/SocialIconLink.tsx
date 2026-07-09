import React from "react";
import styles from "./SocialIconLink.module.css";
import { cn } from "../../lib/cn";

type SocialIconLinkSize = "sm" | "md" | "lg";

export interface SocialIconLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** Destination URL. */
  href: string;
  /** Accessible name — required, the control is icon-only. */
  label: string;
  /** The icon. Rendered inside an aria-hidden wrapper so only `label` names the link. */
  children: React.ReactNode;
  /** Hit-target size token. @default "md" */
  size?: SocialIconLinkSize;
  /** Open in a new tab with rel="noopener noreferrer". @default true */
  external?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

const sizeClassMap: Record<SocialIconLinkSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Icon-only social/profile link: anchor semantics, enforced accessible name,
 * external-safety (target + rel) by default, and token-driven hover/focus
 * treatment. Replaces the hand-rolled `<a aria-label><Icon/></a>` pattern
 * repeated across SiteFooter, ArticleShareSection, and SocialShare.
 */
export const SocialIconLink = React.forwardRef<
  HTMLAnchorElement,
  SocialIconLinkProps
>(function SocialIconLink(
  { href, label, children, size = "md", external = true, className, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      href={href}
      aria-label={label}
      title={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(styles.root, sizeClassMap[size], className)}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {children}
      </span>
    </a>
  );
});

export default SocialIconLink;
