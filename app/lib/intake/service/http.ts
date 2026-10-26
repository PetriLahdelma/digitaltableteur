import * as Sentry from "@sentry/nextjs";
import { NextResponse, type NextRequest } from "next/server";

import { RETENTION } from "../data-policy";
import { HOUR, MINUTE } from "./context";
import { PREAUTH_COOKIE, SESSION_COOKIE } from "./auth";

/** README section 4, T3: bodies above this are refused before parsing. */
export const MAX_BODY_BYTES = 256 * 1024;

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * CSRF: cookies are SameSite=Strict, and every state-changing request must
 * come from this origin as JSON (a cross-site form cannot send that).
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // Under Referrer-Policy: no-referrer a plain form POST (sign-out) carries
  // `Origin: null`. Sec-Fetch-Site is set by the browser and cannot be
  // forged from a page, so it decides those requests.
  if (!origin || origin === "null") return request.headers.get("sec-fetch-site") === "same-origin";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export type BodyResult = Readonly<{ ok: true; body: unknown }> | Readonly<{ ok: false; response: NextResponse }>;

export async function readJsonBody(request: NextRequest): Promise<BodyResult> {
  if (!isSameOrigin(request)) return { ok: false, response: json({ status: "forbidden" }, 403) };
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: json({ status: "unsupported_media_type" }, 415) };
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return { ok: false, response: json({ status: "too_large" }, 413) };
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) return { ok: false, response: json({ status: "too_large" }, 413) };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: json({ status: "bad_request" }, 400) };
  }
}

/** Rate-limit key for the caller's network address; hashed before storage. */
export function networkKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

const cookieBase = { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/" };

export function setPreauthCookie(response: NextResponse, token: string): void {
  response.cookies.set(PREAUTH_COOKIE, token, { ...cookieBase, maxAge: (RETENTION.loginCodeMinutes * MINUTE) / 1000 });
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, { ...cookieBase, maxAge: (RETENTION.sessionAbsoluteHours * HOUR) / 1000 });
}

export function clearCookie(response: NextResponse, name: string): void {
  response.cookies.set(name, "", { ...cookieBase, maxAge: 0 });
}

/**
 * Errors are reported with the route name only. Request bodies never reach
 * Sentry (sentry.data-collection.ts); database errors carry ciphertext and
 * digests, never answers or contact details.
 */
export function serverError(route: string, error: unknown): NextResponse {
  Sentry.captureException(error, { tags: { area: "intake", route } });
  console.error(`[intake] ${route} failed:`, error instanceof Error ? error.name : "unknown error");
  return json({ status: "error" }, 500);
}
