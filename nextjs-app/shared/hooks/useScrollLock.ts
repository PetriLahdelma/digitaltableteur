import { useEffect } from "react";

/**
 * Lock scrolling on the document body while `active`, restoring the previous
 * `overflow` value on release (so nested locks compose). For DT's custom
 * overlays (e.g. Modal) that would otherwise let the background scroll behind
 * them.
 *
 * @param active whether the scroll lock is engaged.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
