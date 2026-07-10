"use client";

import NextLink from "next/link";
import type { ReactNode } from "react";
import {
  LinkProvider,
  type LinkComponentProps,
} from "@digitaltableteur/react";
import { LinkProvider as LocalLinkProvider } from "@/nextjs-app/shared/lib/linkComponent";

/** Adapts next/link to the design-system LinkComponent contract. */
function NextLinkAdapter({ href, children, ...rest }: LinkComponentProps) {
  return (
    <NextLink href={href} {...rest}>
      {children}
    </NextLink>
  );
}

/**
 * Injects next/link as the design system's link implementation for the app, so
 * catalog components get real client-side navigation while importing only the
 * framework-agnostic DS `Link`.
 */
export function NextLinkProvider({ children }: { children: ReactNode }) {
  // The npm package and the locally compiled shared source are two module
  // instances with two distinct LinkComponentContexts; provide the adapter
  // into BOTH, or the side left out silently degrades to plain <a> full-page
  // navigation (package side: catalog components; local side: NextLayout ->
  // SiteHeader/SiteFooter/cards).
  return (
    <LinkProvider component={NextLinkAdapter}>
      <LocalLinkProvider component={NextLinkAdapter}>
        {children}
      </LocalLinkProvider>
    </LinkProvider>
  );
}
