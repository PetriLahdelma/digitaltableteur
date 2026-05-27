/**
 * Stub for `next/link` used by Vitest.
 *
 * Renders a plain <a> with the provided href. Avoids loading
 * nextjs-app/node_modules/next/* (which ships a second React copy).
 */
import React from "react";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string | { pathname?: string };
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  as?: string;
  locale?: string | false;
  legacyBehavior?: boolean;
};

function resolveHref(href: LinkProps["href"]): string {
  if (!href) return "";
  if (typeof href === "string") return href;
  if (typeof href === "object" && href !== null && "pathname" in href) {
    return String((href as { pathname?: unknown }).pathname ?? "");
  }
  return "";
}

const NextLink = React.forwardRef<HTMLAnchorElement, LinkProps>(function NextLink(
  props,
  ref,
) {
  const {
    href,
    prefetch: _prefetch,
    replace: _replace,
    scroll: _scroll,
    shallow: _shallow,
    passHref: _passHref,
    as: _as,
    locale: _locale,
    legacyBehavior: _legacy,
    children,
    ...rest
  } = props;
  return (
    <a ref={ref} href={resolveHref(href)} {...rest}>
      {children}
    </a>
  );
});

export default NextLink;
