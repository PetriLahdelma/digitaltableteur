"use client";

import { useEffect } from "react";
import { ThemeProvider as SharedThemeProvider } from "@dt/ThemeProvider";

export function NextThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("theme-hydrated");
  }, []);

  return <SharedThemeProvider>{children}</SharedThemeProvider>;
}
