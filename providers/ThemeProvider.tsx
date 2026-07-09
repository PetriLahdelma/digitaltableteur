"use client";

import {
  ThemeProvider,
  useTheme,
  type Theme,
} from "../nextjs-app/shared/components/ThemeProvider/ThemeProvider";

/**
 * App compatibility wrapper around the shared theme runtime.
 *
 * This mounts the source provider until the next @digitaltableteur/react patch
 * containing the theme bridge is published. Local app components still import
 * the source hook, so using the currently published package provider here would
 * split the context and make the site header theme toggle inert.
 */
export function NextThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export { useTheme, type Theme };
