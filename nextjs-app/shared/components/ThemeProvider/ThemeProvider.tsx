import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "hcb" | "hcw";

const THEME_SEQUENCE: Theme[] = ["light", "dark", "hcb", "hcw"];
const DEFAULT_THEME: Theme = "light";

const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" &&
  (THEME_SEQUENCE as readonly string[]).includes(value as Theme);

const getNextTheme = (value: Theme): Theme => {
  const index = THEME_SEQUENCE.indexOf(value);
  return THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
};

// Safe localStorage operations with error handling
function safeGetFromStorage(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`localStorage.getItem failed for key "${key}":`, error);
    return null;
  }
}

function safeSetToStorage(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`localStorage.setItem failed for key "${key}":`, error);
    return false;
  }
}

const setThemeCookie = (theme: Theme) => {
  if (typeof document === "undefined") return;
  try {
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
    document.cookie = `dt_theme=${theme}; expires=${expires}; path=/`;
  } catch (error) {
    console.warn("Failed to persist theme cookie:", error);
  }
};

const clearThemeCookie = () => {
  if (typeof document === "undefined") return;
  try {
    document.cookie =
      "dt_theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  } catch (error) {
    console.warn("Failed to clear theme cookie:", error);
  }
};

const getThemeFromCookie = (): Theme | null => {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("dt_theme="));
    if (!match) return null;
    const value = match.split("=")[1];
    return isTheme(value) ? value : null;
  } catch (error) {
    console.warn("Failed to read theme cookie:", error);
    return null;
  }
};

const applyThemeToDom = (theme: Theme) => {
  if (typeof window === "undefined") {
    return;
  }

  const isDark = theme === "dark";
  const isHighContrastBlack = theme === "hcb";
  const isHighContrastWhite = theme === "hcw";
  const root = document.documentElement;
  const body = document.body;

  root.classList.toggle("themeDark", isDark);
  root.classList.toggle("themeHCB", isHighContrastBlack);
  root.classList.toggle("themeHCW", isHighContrastWhite);
  root.dataset.theme = theme;
  root.style.colorScheme = isDark || isHighContrastBlack ? "dark" : "light";

  if (body) {
    body.classList.toggle("themeDark", isDark);
    body.classList.toggle("themeHCB", isHighContrastBlack);
    body.classList.toggle("themeHCW", isHighContrastWhite);
    body.dataset.theme = theme;
  }
};

const getStoredTheme = (): Theme => {
  const stored = safeGetFromStorage("theme");
  if (stored && isTheme(stored)) {
    return stored;
  }

  const cookieTheme = getThemeFromCookie();
  if (cookieTheme) {
    return cookieTheme;
  }

  return DEFAULT_THEME;
};

// Synchronously set theme class before React renders
const syncThemeClass = () => {
  if (typeof window !== "undefined") {
    applyThemeToDom(getStoredTheme());
  }
};
syncThemeClass();

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  forcedTheme?: Theme;
}> = ({ children, forcedTheme }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // If forcedTheme is provided, always use it
  const effectiveTheme = forcedTheme || theme;

  // Intentionally run once on mount to read stored theme, regardless of initial state.
  useEffect(() => {
    // Sync state with storage on mount
    const stored = getStoredTheme();
    if (stored !== theme) {
      setThemeState(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyThemeToDom(effectiveTheme);
    const storagePersisted = safeSetToStorage("theme", effectiveTheme);
    if (storagePersisted) {
      clearThemeCookie();
    } else {
      setThemeCookie(effectiveTheme);
    }
  }, [effectiveTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(isTheme(nextTheme) ? nextTheme : DEFAULT_THEME);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => getNextTheme(current));
  }, []);

  const contextValue = useMemo(
    () => ({
      theme: effectiveTheme,
      toggleTheme,
      setTheme,
    }),
    [effectiveTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
