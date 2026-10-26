/**
 * Security headers for the intake client area (STRIDE I2, I5, I6).
 *
 * A per-request nonce with 'strict-dynamic': only scripts the server
 * rendered, and the chunks they load, can run. No third-party host is
 * allowed, so analytics cannot load on an intake page even if a visitor
 * consented to it elsewhere on the site. The one static inline script the
 * root layout renders (the SSR snapshot) is allowed by its hash.
 *
 * Edge-safe: no Node APIs, so the proxy can build it on every request.
 */

/** sha256 of SSR_SNAPSHOT_SCRIPT (app/lib/ssr-snapshot-script.ts); a test keeps it in sync. */
export const SSR_SNAPSHOT_SCRIPT_HASH = "'sha256-Ee7gccy5SRwKO4nseK1VT4fbVYT1Ebf7oxttawGZppM='";

export function createNonce(): string {
  return btoa(crypto.randomUUID());
}

export function intakeCsp(nonce: string, options: { dev: boolean; https: boolean }): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${SSR_SNAPSHOT_SCRIPT_HASH}${options.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // Sentry reaches its EU ingest through the same-origin /monitoring tunnel.
    `connect-src 'self'${options.dev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    ...(options.https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export const INTAKE_RESPONSE_HEADERS: Readonly<Record<string, string>> = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

export function isIntakePath(pathname: string): boolean {
  return pathname === "/intake" || pathname.startsWith("/intake/");
}
