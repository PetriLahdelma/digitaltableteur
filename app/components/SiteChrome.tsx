"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NextLayout } from "@dt/NextLayout";

import { isIntakePath } from "../lib/intake/csp";

/**
 * The client intake area shares the root layout but none of the site around
 * it: no header, footer, chat assistant or cookie banner, and no analytics
 * (docs/intake/README.md, STRIDE I2). The intake CSP blocks third-party
 * scripts as well, so this is the visible half of the same rule.
 */
function useIsIntake(): boolean {
  return isIntakePath(usePathname() ?? "");
}

/** Site header, footer, chat and consent banner, except on intake pages. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return useIsIntake() ? <>{children}</> : <NextLayout>{children}</NextLayout>;
}

/** Renders its children (analytics) everywhere except intake pages. */
export function SiteOnly({ children }: { children: ReactNode }) {
  return useIsIntake() ? null : <>{children}</>;
}
