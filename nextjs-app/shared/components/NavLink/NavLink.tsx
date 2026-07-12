"use client";

import { Link } from "../../lib/linkComponent";
// Same-module-instance rule: shared source must not import its own published
// package name — the package build would inline the PREVIOUS npm version of
// itself (compounding tarball growth) and read a context no host provides.
import { useNavigationPathname } from "../../lib/navigation";
import { type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface NavLinkProps {
  /** Route path for next/link. */
  href: string;
  /** Navigation link label. */
  children: ReactNode;
  /** Match href exactly for the active state instead of by prefix. @default false */
  exact?: boolean;
  /** Base class names applied in every state. */
  className?: string;
  /** Class names applied when the route is active. */
  activeClassName?: string;
  /** Class names applied when the route is inactive. */
  inactiveClassName?: string;
}

export function NavLink({
  href,
  children,
  exact = false,
  className,
  activeClassName = "text-foreground",
  inactiveClassName = "text-muted-foreground hover:text-foreground",
}: NavLinkProps) {
  // usePathname() returns string | null per Next.js typing — null occurs in
  // SSR fallback and outside the app router (e.g. Storybook). Treat null as
  // "no current pathname" → never active.
  const pathname = useNavigationPathname();
  const isActive = pathname === null
    ? false
    : exact
      ? pathname === href
      : pathname.startsWith(href);
  const isSamePath = pathname === href;
  const linkClassName = cn(
    // rounded-sm matches the LanguageSwitcher buttons so the global
    // :focus-visible outline renders with the same corner rounding.
    // motion-reduce guard keeps a11y.reducedMotion honest (matches the
    // Pagination / ValueCard color-transition treatment).
    "font-body text-text-m transition-colors motion-reduce:transition-none rounded-sm",
    className,
    isActive ? activeClassName : inactiveClassName,
  );

  if (isActive && isSamePath) {
    // The current-page item is a non-interactive location indicator, not a
    // link: cursor-default (arrow) — never pointer (nothing to follow), text
    // (the <span>'s default over its label; implies selectable prose), or
    // not-allowed (overstates it as a blocked/disabled action).
    return (
      <span className={cn(linkClassName, "cursor-default")} aria-current="page">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={linkClassName}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
