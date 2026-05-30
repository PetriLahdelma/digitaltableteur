import {
  DONNY_SITE_TARGETS,
  getDonnyTarget,
  isDonnyTargetId,
  isSafeDonnyRoute,
  type DonnyHighlightMode,
  type DonnyTargetId,
} from "../../data/donny-site-actions";

const DEFAULT_WAIT_ATTEMPTS = 24;
const DEFAULT_WAIT_INTERVAL_MS = 125;

export function createDonnyAnnotationId(): string {
  return `donny-annotation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeDonnyPath(path: string): string {
  return path.split("?")[0]?.split("#")[0] ?? path;
}

export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

export function getVisibleDonnyTargetIds(): DonnyTargetId[] {
  return DONNY_SITE_TARGETS.filter((entry) => {
    const element = document.querySelector(entry.selector);
    return element ? isElementInViewport(element) : false;
  }).map((entry) => entry.id);
}

export function getLastDonnyInterest(): string | undefined {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>("[data-donny-interest]"),
  ).filter(isElementInViewport);
  return candidates[0]?.dataset.donnyInterest;
}

export async function waitForDonnyTarget(
  selector: string,
  options?: { maxAttempts?: number; intervalMs?: number },
): Promise<HTMLElement | null> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_WAIT_ATTEMPTS;
  const intervalMs = options?.intervalMs ?? DEFAULT_WAIT_INTERVAL_MS;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) return element;
    await new Promise((resolve) => {
      window.setTimeout(resolve, intervalMs);
    });
  }

  return null;
}

export function resolveHighlightMode(
  targetId: DonnyTargetId,
  requested?: DonnyHighlightMode,
): DonnyHighlightMode | undefined {
  if (!isDonnyTargetId(targetId)) return undefined;
  const target = getDonnyTarget(targetId);
  if (!target) return undefined;

  if (requested && target.allowedModes.includes(requested)) {
    return requested;
  }

  return target.allowedModes[0];
}

export function resolveDonnyTargetWithFallback(
  targetId: DonnyTargetId,
): { targetId: DonnyTargetId; route: string; selector: string } | null {
  if (!isDonnyTargetId(targetId)) return null;

  let currentId: DonnyTargetId | undefined = targetId;
  const visited = new Set<DonnyTargetId>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const entry = getDonnyTarget(currentId);
    if (!entry || !isSafeDonnyRoute(entry.route)) {
      return null;
    }

    const element = document.querySelector(entry.selector);
    if (element) {
      return {
        targetId: entry.id,
        route: entry.route,
        selector: entry.selector,
      };
    }

    currentId = entry.fallbackTargetId;
  }

  const entry = getDonnyTarget(targetId);
  if (!entry || !isSafeDonnyRoute(entry.route)) return null;

  return {
    targetId: entry.id,
    route: entry.route,
    selector: entry.selector,
  };
}

export function applyDonnyHighlightAttributes(
  element: HTMLElement,
  highlightMode: DonnyHighlightMode,
  annotationId: string,
): void {
  element.setAttribute("data-donny-active", "true");
  element.setAttribute("data-donny-highlight", highlightMode);
  element.setAttribute("data-donny-annotation-id", annotationId);
}

export function clearDonnyHighlightAttributes(element: HTMLElement): void {
  element.removeAttribute("data-donny-active");
  element.removeAttribute("data-donny-highlight");
  element.removeAttribute("data-donny-annotation-id");
}
