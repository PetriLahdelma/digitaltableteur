"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "hcb" | "hcw";

const THEME_SEQUENCE: Theme[] = ["light", "dark", "hcb", "hcw"];

const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" &&
  (THEME_SEQUENCE as readonly string[]).includes(value as Theme);

const getNextTheme = (value: Theme): Theme => {
  const index = THEME_SEQUENCE.indexOf(value);
  return THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
};

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  systemPreference: "light" | "dark";
  isExplicitChoice: boolean;
  resetToSystemPreference: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  systemPreference: "light",
  isExplicitChoice: false,
  resetToSystemPreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/**
 * Inner provider that bridges next-themes with our custom theme context
 */
function ThemeContextBridge({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only reading theme after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const theme: Theme = mounted && isTheme(resolvedTheme) ? resolvedTheme : "light";
  const systemPreference: "light" | "dark" = systemTheme === "dark" ? "dark" : "light";
  const isExplicitChoice = mounted && nextTheme !== "system";

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (isTheme(newTheme)) {
        setNextTheme(newTheme);
      }
    },
    [setNextTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(getNextTheme(theme));
  }, [theme, setTheme]);

  const resetToSystemPreference = useCallback(() => {
    setNextTheme("system");
  }, [setNextTheme]);

  // Apply theme classes to body (next-themes handles html)
  useEffect(() => {
    if (!mounted) return;
    const body = document.body;
    const isDark = theme === "dark";
    const isHCB = theme === "hcb";
    const isHCW = theme === "hcw";

    body.classList.toggle("themeDark", isDark);
    body.classList.toggle("themeHCB", isHCB);
    body.classList.toggle("themeHCW", isHCW);
    body.dataset.theme = theme;
  }, [theme, mounted]);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      systemPreference,
      isExplicitChoice,
      resetToSystemPreference,
    }),
    [theme, toggleTheme, setTheme, systemPreference, isExplicitChoice, resetToSystemPreference]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * NextThemeProvider - wraps app with next-themes for FOUC prevention
 *
 * Uses next-themes to inject a blocking script that applies theme
 * before any content renders, preventing flash of wrong theme.
 */
export function NextThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "hcb", "hcw"]}
      value={{
        light: "themeLight",
        dark: "themeDark",
        hcb: "themeHCB",
        hcw: "themeHCW",
      }}
      storageKey="theme"
      disableTransitionOnChange
    >
      <ThemeContextBridge>{children}</ThemeContextBridge>
    </NextThemesProvider>
  );
}
