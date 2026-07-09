"use client";

import {
  ThemeProvider,
  useTheme,
  type Theme,
} from "../nextjs-app/shared/components/ThemeProvider/ThemeProvider";

/**
 * App compatibility wrapper around the shared theme runtime.
 *
 * This intentionally mounts the LOCAL source provider: the site shell and its
 * consumers (SiteHeader theme toggle, usePersistentTheme) import the source
 * hook, so the provider must come from the same module instance. Package
 * components reach the same runtime through the globalThis theme bridge,
 * which the published @digitaltableteur/react (>=0.1.2) also contains.
 */
export function NextThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export { useTheme, type Theme };
