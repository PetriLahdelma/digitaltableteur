
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "hcb" | "hcw";

/** Props for ThemeProvider. */
export interface ThemeProviderProps {
  /** Subtree that receives the theme context. */
  children: React.ReactNode;
  /** Pin the theme regardless of stored/system preference (e.g. external embeds). */
  forcedTheme?: Theme;
}

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
    // Background is provided via `--main-body-background-color` (driven by the
    // theme classes on <html>) and applied in `shared/styles/typography.css`.
    // The previous inline-style assignment was redundant with the CSS pipeline
    // and pulled hex literals into a TSX file, tripping the design-system
    // contract validator.
  }
};

/**
 * Detect system color scheme preference
 * Returns "dark" if user's OS prefers dark mode, otherwise "light"
 */
const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return DEFAULT_THEME;
  }
};

/**
 * Check if user has explicitly set a theme preference
 * Returns true if there's a stored theme in localStorage or cookies
 */
const hasExplicitThemePreference = (): boolean => {
  const stored = safeGetFromStorage("theme");
  if (stored && isTheme(stored)) return true;

  const cookieTheme = getThemeFromCookie();
  if (cookieTheme) return true;

  return false;
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

  // No explicit preference - respect system preference
  return getSystemTheme();
};

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  /** The OS-level color scheme preference (light/dark) */
  systemPreference: "light" | "dark";
  /** Whether user has explicitly chosen a theme (overrides system preference) */
  isExplicitChoice: boolean;
  /** Reset to follow system preference */
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
 * ThemeProvider component.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  forcedTheme,
}) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [systemPreference, setSystemPreference] = useState<"light" | "dark">(
    "light"
  );
  const [isExplicitChoice, setIsExplicitChoice] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // If forcedTheme is provided, always use it
  const effectiveTheme = forcedTheme || theme;

  // Sync state with storage on mount
  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    if (stored !== theme) {
      setThemeState(stored);
    }

    // Track if user has explicit preference
    setIsExplicitChoice(hasExplicitThemePreference());

    // Get initial system preference
    const sysTheme = getSystemTheme();
    setSystemPreference(sysTheme === "dark" ? "dark" : "light");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      const newSystemPref = event.matches ? "dark" : "light";
      setSystemPreference(newSystemPref);

      // If user hasn't explicitly chosen a theme, follow system preference
      if (!hasExplicitThemePreference()) {
        setThemeState(newSystemPref);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy Safari
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeToDom(effectiveTheme);
    const storagePersisted = safeSetToStorage("theme", effectiveTheme);
    if (storagePersisted) {
      clearThemeCookie();
    } else {
      setThemeCookie(effectiveTheme);
    }
  }, [effectiveTheme, mounted]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(isTheme(nextTheme) ? nextTheme : DEFAULT_THEME);
    setIsExplicitChoice(true); // User made an explicit choice
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => getNextTheme(current));
    setIsExplicitChoice(true); // User made an explicit choice
  }, []);

  const resetToSystemPreference = useCallback(() => {
    // Clear stored preference
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("theme");
      } catch {
        // Ignore storage errors
      }
    }
    clearThemeCookie();
    setIsExplicitChoice(false);
    setThemeState(getSystemTheme());
  }, []);

  const contextValue = useMemo(
    () => ({
      theme: effectiveTheme,
      toggleTheme,
      setTheme,
      systemPreference,
      isExplicitChoice,
      resetToSystemPreference,
    }),
    [
      effectiveTheme,
      setTheme,
      toggleTheme,
      systemPreference,
      isExplicitChoice,
      resetToSystemPreference,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
