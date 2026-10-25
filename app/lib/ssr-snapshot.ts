import { useEffect, useLayoutEffect } from "react";

/**
 * Keeps the server-rendered page on screen when a JS chunk fails to load.
 *
 * A coverage dropout right after the HTML arrives makes Turbopack's chunk
 * loader throw ChunkLoadError during hydration. React hands it to the nearest
 * error boundary, which then replaced the whole server-rendered document with
 * "Something went wrong!" even though the HTML was complete. An error
 * boundary cannot hand the old DOM back, so the root layout runs
 * SSR_SNAPSHOT_SCRIPT (ssr-snapshot-script.ts) at the end of <body>, before
 * hydration, and the error
 * boundaries put that snapshot back for chunk errors only. The restored page
 * is static (links work, buttons do not), and the page reloads itself once
 * the site answers again. Genuine render errors still show the error UI.
 */

export type SsrSnapshot = {
  /** location.pathname + location.search when the snapshot was taken. */
  path: string;
  /** The whole <body>, scripts removed, for app/global-error.tsx. */
  body: string;
  /** The page segment inside #main-content, for app/error.tsx. */
  page: string | null;
};

declare global {
  interface Window {
    __DT_SSR_SNAPSHOT__?: SsrSnapshot;
  }
}

const CHUNK_ERROR =
  /Failed to load chunk|Loading (CSS )?chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

/** True for a JS or CSS chunk that failed to download, not a render bug. */
export function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { name, message } = error as { name?: unknown; message?: unknown };
  return (
    name === "ChunkLoadError" ||
    (typeof message === "string" && CHUNK_ERROR.test(message))
  );
}

/**
 * The snapshot to restore for this error, or null. Only for chunk errors, and
 * only while the browser is still on the page the snapshot was taken from:
 * after a client-side navigation it would show the wrong page.
 */
export function readSsrSnapshot(error: unknown): SsrSnapshot | null {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return null;
  const snapshot = window.__DT_SSR_SNAPSHOT__;
  if (!snapshot) return null;
  return snapshot.path === window.location.pathname + window.location.search
    ? snapshot
    : null;
}

function attributesOf(element: Element): Record<string, string> {
  return Object.fromEntries(
    [...element.attributes].map((attribute) => [attribute.name, attribute.value]),
  );
}

/**
 * The <html> and <body> attributes as they are right now. Call it during
 * render: global-error renders a bare <html>, and React strips the font and
 * theme classes when it commits. Reading the live document rather than the
 * snapshot keeps a theme the visitor switched on after hydration, when a lazy
 * chunk fails later in the visit.
 */
export function readDocumentAttributes() {
  if (typeof document === "undefined") return null;
  return {
    htmlAttrs: attributesOf(document.documentElement),
    bodyAttrs: attributesOf(document.body),
  };
}

/** Puts the <html> and <body> attributes (fonts, theme, lang) back after commit. */
export function useRestoreDocumentAttributes(
  attributes: ReturnType<typeof readDocumentAttributes>,
) {
  useLayoutEffect(() => {
    if (!attributes) return;
    for (const [element, attrs] of [
      [document.documentElement, attributes.htmlAttrs],
      [document.body, attributes.bodyAttrs],
    ] as const) {
      for (const [name, value] of Object.entries(attrs)) {
        element.setAttribute(name, value);
      }
    }
  }, [attributes]);
}

const RELOAD_KEY = "dt-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 30_000;

/**
 * After a chunk error, reload once the site answers. navigator.onLine is not
 * trusted (phones in a coverage gap often report online), so a no-store HEAD
 * request to this page must succeed first; reloading into a dead network
 * would trade the restored page for the browser's own error page. A
 * session-storage cooldown stops a loop when a chunk is missing for good.
 */
export function useReloadWhenReachable(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = 3_000;

    const recentlyReloaded = () => {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
        return Date.now() - last < RELOAD_COOLDOWN_MS;
      } catch {
        return false;
      }
    };

    const attempt = async () => {
      if (cancelled || document.visibilityState === "hidden") return schedule();
      try {
        const response = await fetch(window.location.href, {
          method: "HEAD",
          cache: "no-store",
        });
        if (!cancelled && response.ok && !recentlyReloaded()) {
          try {
            sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
          } catch {
            // Storage blocked: the cooldown is lost, the reload still helps.
          }
          window.location.reload();
          return;
        }
      } catch {
        // Still offline.
      }
      schedule();
    };

    const schedule = () => {
      if (cancelled) return;
      timer = setTimeout(attempt, delay);
      delay = Math.min(delay * 2, 30_000);
    };

    const onOnline = () => {
      clearTimeout(timer);
      delay = 3_000;
      void attempt();
    };

    window.addEventListener("online", onOnline);
    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [enabled]);
}
