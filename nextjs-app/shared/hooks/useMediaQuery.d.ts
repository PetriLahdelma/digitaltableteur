/**
 * Subscribe to a CSS media query and track whether it currently matches.
 *
 * SSR-safe: returns `false` on the server and the first client render (so
 * hydration never mismatches), then syncs to the real match after mount and
 * updates on every change. This is the sanctioned primitive for responsive
 * breakpoint checks; for reduced-motion use `useHydrationSafeMotion`, and for
 * system color scheme use the ThemeProvider.
 *
 * @param query a media query string, e.g. `"(width < 768px)"`.
 */
export declare function useMediaQuery(query: string): boolean;
//# sourceMappingURL=useMediaQuery.d.ts.map