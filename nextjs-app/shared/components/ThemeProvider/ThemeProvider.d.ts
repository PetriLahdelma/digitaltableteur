import React from "react";
export type Theme = "light" | "dark" | "hcb" | "hcw";
/** Props for ThemeProvider. */
export interface ThemeProviderProps {
    /** Subtree that receives the theme context. */
    children: React.ReactNode;
    /** Pin the theme regardless of stored/system preference (e.g. external embeds). */
    forcedTheme?: Theme;
}
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
export declare const useTheme: () => ThemeContextProps;
/**
 * ThemeProvider component.
 */
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export {};
//# sourceMappingURL=ThemeProvider.d.ts.map