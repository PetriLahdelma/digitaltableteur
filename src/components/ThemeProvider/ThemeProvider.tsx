import React, { createContext, useContext, useEffect, useState } from "react";

// Synchronously set theme class before React renders
function syncThemeClass() {
  if (typeof window !== "undefined") {
    const theme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
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
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light";
  });

  // If forcedTheme is provided, always use it
  const effectiveTheme = forcedTheme || theme;

  useEffect(() => {
    document.body.classList.toggle("themeDark", effectiveTheme === "dark");
    localStorage.setItem("theme", effectiveTheme);
  }, [effectiveTheme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
