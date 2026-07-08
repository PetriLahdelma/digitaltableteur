import React from "react";
import { useTheme, type Theme } from "../components/ThemeProvider";

const THEME_SEQUENCE: Theme[] = ["light", "dark", "hcb", "hcw"];

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const getCookie = (name: string) =>
  document.cookie.split("; ").reduce((result, pair) => {
    const [key, ...rest] = pair.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
    return result;
  }, "");

const isTheme = (value: string): value is Theme =>
  (THEME_SEQUENCE as readonly string[]).includes(value);

const getNextTheme = (current: Theme) => {
  const index = THEME_SEQUENCE.indexOf(current);
  return THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
};

export const usePersistentTheme = () => {
  const { theme, setTheme } = useTheme();

  const setPersistentTheme = React.useCallback(
    (value: Theme) => {
      setCookie("dt_theme", value);
      setTheme(value);
    },
    [setTheme],
  );

  React.useEffect(() => {
    const cookieTheme = getCookie("dt_theme");
    if (cookieTheme && isTheme(cookieTheme) && cookieTheme !== theme) {
      setTheme(cookieTheme);
    }
  }, [setTheme, theme]);

  const cycleTheme = React.useCallback(() => {
    const nextTheme = getNextTheme(theme);
    setPersistentTheme(nextTheme);
    return nextTheme;
  }, [setPersistentTheme, theme]);

  return { theme, setPersistentTheme, cycleTheme };
};

export type UsePersistentThemeReturn = ReturnType<typeof usePersistentTheme>;
