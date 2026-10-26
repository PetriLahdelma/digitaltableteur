"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { isIntakePath } from "../lib/intake/csp";

/**
 * Renders its children (the analytics scripts) everywhere except the client
 * intake area, where answers are on the page (docs/intake/README.md, STRIDE
 * I2). The intake CSP blocks third-party scripts as well.
 */
export function SiteOnly({ children }: { children: ReactNode }) {
  return isIntakePath(usePathname() ?? "") ? null : <>{children}</>;
}
