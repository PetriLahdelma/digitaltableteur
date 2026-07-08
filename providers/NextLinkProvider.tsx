"use client";

import NextLink from "next/link";
import type { ReactNode } from "react";
import {
  LinkProvider,
  type LinkComponentProps,
} from "@digitaltableteur/react";

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
  return <LinkProvider component={NextLinkAdapter}>{children}</LinkProvider>;
}
