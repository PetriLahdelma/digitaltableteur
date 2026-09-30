import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[contenteditable='true']",
  "[tabindex]",
].join(",");

interface InertRecord {
  count: number;
  hadAttribute: boolean;
  value: string | null;
}

const inertRecords = new WeakMap<HTMLElement, InertRecord>();
const activeTraps: symbol[] = [];

function isHidden(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current) {
    if (
      current.hidden ||
      current.hasAttribute("inert") ||
      current.getAttribute("aria-hidden") === "true"
    ) {
      return true;
    }

    const style = window.getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return true;

    if (current instanceof HTMLDetailsElement && !current.open) {
      const summary = current.querySelector(":scope > summary");
      if (!summary?.contains(element)) return true;
    }

    current = current.parentElement;
  }

  return false;
}

function isDisabled(element: HTMLElement): boolean {
  return (
    element.matches(":disabled") ||
    element.getAttribute("aria-disabled") === "true"
  );
}

function isUntabbable(element: HTMLElement): boolean {
  if (
    isDisabled(element) ||
    element.matches('input[type="hidden"]') ||
    element.tabIndex < 0
  ) {
    return true;
  }

  return isHidden(element);
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !isUntabbable(element),
  );
}

function getIsolationTargets(container: HTMLElement): HTMLElement[] {
  const targets = new Set<HTMLElement>();
  let branch: HTMLElement | null = container;

  while (branch?.parentElement) {
    const parent: HTMLElement = branch.parentElement;
    for (const sibling of Array.from(parent.children)) {
      if (sibling !== branch && sibling instanceof HTMLElement) {
        targets.add(sibling);
      }
    }
    if (parent === document.body) break;
    branch = parent;
  }

  return [...targets];
}

function acquireInert(element: HTMLElement): void {
  const existing = inertRecords.get(element);
  if (existing) {
    existing.count += 1;
    return;
  }

  inertRecords.set(element, {
    count: 1,
    hadAttribute: element.hasAttribute("inert"),
    value: element.getAttribute("inert"),
  });
  element.setAttribute("inert", "");
}

function releaseInert(element: HTMLElement): void {
  const record = inertRecords.get(element);
  if (!record) return;

  record.count -= 1;
  if (record.count > 0) return;

  if (record.hadAttribute) {
    element.setAttribute("inert", record.value ?? "");
  } else {
    element.removeAttribute("inert");
  }
  inertRecords.delete(element);
}

function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  return (
    !!element &&
    element.isConnected &&
    !isDisabled(element) &&
    !isHidden(element)
  );
}

/**
 * Trap focus within `ref` while `active`.
 *
 * The active overlay is isolated at every level of its portal ancestry, so
 * background header, main, footer, and sibling layer roots all become inert.
 * Nested traps are reference counted and only the topmost trap handles focus.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const container = ref.current;
    if (!container) return;

    const trapId = Symbol("focus-trap");
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const isolationTargets = getIsolationTargets(container);
    const originalTabIndex = container.getAttribute("tabindex");
    let addedContainerTabIndex = false;

    activeTraps.push(trapId);
    isolationTargets.forEach(acquireInert);

    const isTopmost = () => activeTraps.at(-1) === trapId;
    const focusInside = (preferLast = false) => {
      const focusable = getFocusableElements(container);
      const target = preferLast ? focusable.at(-1) : focusable[0];

      if (target) {
        target.focus();
        return;
      }

      if (!container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
        addedContainerTabIndex = true;
      }
      container.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopmost() || event.key !== "Tab") return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        focusInside();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (
        event.shiftKey &&
        (current === first || !container.contains(current))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (current === last || !container.contains(current))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isTopmost() || container.contains(event.target as Node)) return;
      focusInside();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    const raf = requestAnimationFrame(() => {
      if (isTopmost() && !container.contains(document.activeElement)) {
        focusInside();
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);

      const stackIndex = activeTraps.lastIndexOf(trapId);
      if (stackIndex !== -1) activeTraps.splice(stackIndex, 1);
      isolationTargets.forEach(releaseInert);

      if (addedContainerTabIndex) {
        if (originalTabIndex === null) container.removeAttribute("tabindex");
        else container.setAttribute("tabindex", originalTabIndex);
      }

      if (canRestoreFocus(previousActiveElement)) {
        previousActiveElement.focus();
      }
    };
  }, [active, ref]);
}
