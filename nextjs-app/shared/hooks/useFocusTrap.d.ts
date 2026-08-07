import { type RefObject } from "react";
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
export declare function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void;
//# sourceMappingURL=useFocusTrap.d.ts.map