import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Trap focus within `ref` while `active`.
 *
 * On activation it records the currently focused element, marks the page's main
 * content `inert` so Tab cannot escape to the background, and focuses the first
 * focusable element inside the container. On deactivation it removes `inert` and
 * restores focus to where it was. Built for DT's custom overlays (e.g. Modal),
 * which are not Radix-backed and would otherwise leak focus.
 *
 * @param ref container whose focusable descendants should hold focus.
 * @param active whether the trap is engaged.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const previousActiveElement = document.activeElement as HTMLElement | null;

    const mainContent =
      document.getElementById("main-content") ||
      document.getElementById("__next") ||
      document.querySelector("main") ||
      document.body.firstElementChild;

    if (mainContent && mainContent !== document.body) {
      mainContent.setAttribute("inert", "");
    }

    const raf = requestAnimationFrame(() => {
      ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      if (mainContent && mainContent !== document.body) {
        mainContent.removeAttribute("inert");
      }
      previousActiveElement?.focus();
    };
  }, [active, ref]);
}
