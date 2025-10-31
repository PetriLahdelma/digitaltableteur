import React, { createContext, useContext, useEffect, useState } from "react";

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

// Synchronously set theme class before React renders
function syncThemeClass() {
  if (typeof window !== "undefined") {
    const theme = safeGetFromStorage("theme", "light") as "light" | "dark";
    document.body.classList.toggle("themeDark", theme === "dark");
  }
}
syncThemeClass();

type Theme = "light" | "dark";
interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  forcedTheme?: Theme;
}> = ({ children, forcedTheme }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return safeGetFromStorage("theme", "light") as Theme;
    }
    return "light";
  });

  // If forcedTheme is provided, always use it
  const effectiveTheme = forcedTheme || theme;

  useEffect(() => {
    document.body.classList.toggle("themeDark", effectiveTheme === "dark");
    safeSetToStorage("theme", effectiveTheme);
  }, [effectiveTheme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
