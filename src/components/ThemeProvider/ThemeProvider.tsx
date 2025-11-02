import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "hcb";

const THEME_SEQUENCE: Theme[] = ["light", "dark", "hcb"];
const DEFAULT_THEME: Theme = "light";

const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" &&
  (THEME_SEQUENCE as readonly string[]).includes(value as Theme);

const getNextTheme = (value: Theme): Theme => {
  const index = THEME_SEQUENCE.indexOf(value);
  return THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
};

// Safe localStorage operations with error handling
function safeGetFromStorage(key: string, defaultValue: string): string {
  if (typeof window === "undefined") return defaultValue;

  try {
    const value = localStorage.getItem(key);
    return value || defaultValue;
  } catch (error) {
    console.warn(`localStorage.getItem failed for key "${key}":`, error);
    return defaultValue;
  }
}

function safeSetToStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`localStorage.setItem failed for key "${key}":`, error);
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

const applyThemeToDom = (theme: Theme) => {
  if (typeof window === "undefined") {
    return;
  }

  const isDark = theme === "dark";
  const isHighContrast = theme === "hcb";
  const root = document.documentElement;
  const body = document.body;

  root.classList.toggle("themeDark", isDark);
  root.classList.toggle("themeHCB", isHighContrast);
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "light" ? "light" : "dark";

  if (body) {
    body.classList.toggle("themeDark", isDark);
    body.classList.toggle("themeHCB", isHighContrast);
    body.dataset.theme = theme;
    body.style.backgroundColor =
      theme === "hcb" ? "#000" : theme === "dark" ? "#23272a" : "#fff";
  }
};

const getStoredTheme = (): Theme => {
  const stored = safeGetFromStorage("theme", DEFAULT_THEME);
  return isTheme(stored) ? stored : DEFAULT_THEME;
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
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return getStoredTheme();
    }
    return DEFAULT_THEME;
  });

  // If forcedTheme is provided, always use it
  const effectiveTheme = forcedTheme || theme;

  useEffect(() => {
    applyThemeToDom(effectiveTheme);
    safeSetToStorage("theme", effectiveTheme);
    setThemeCookie(effectiveTheme);
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
