"use client";

import {
  ThemeProvider,
  useTheme,
  type Theme,
} from "@digitaltableteur/react";

/**
 * App compatibility wrapper around the package theme runtime.
 *
 * The previous next-themes wrapper rendered a client-side script tag and split
 * the app theme context from the package context. The design-system provider
 * already handles stored/system theme state and applies the expected html/body
 * classes, so the app should inject that package runtime directly.
 */
export function NextThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export { useTheme, type Theme };
