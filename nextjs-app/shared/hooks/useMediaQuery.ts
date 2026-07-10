import { useEffect, useState } from "react";

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
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
