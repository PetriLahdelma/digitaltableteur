import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { RETENTION } from "../data-policy";
import { ADMIN_COOKIE, ADMIN_PREAUTH_COOKIE, readAdminSession, type AdminSession } from "./admin-auth";
import { HOUR, MINUTE, type IntakeContext } from "./context";
import { json, networkKey } from "./http";
import { hit } from "./rate-limit";
import { intakeContext } from "./runtime";

const cookieBase = { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/" };

export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_COOKIE, token, { ...cookieBase, maxAge: (RETENTION.sessionAbsoluteHours * HOUR) / 1000 });
}

export function setAdminPreauthCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_PREAUTH_COOKIE, token, { ...cookieBase, maxAge: (5 * MINUTE) / 1000 });
}

/** The owner's session for a server component or route handler, or null. */
export async function currentAdmin(): Promise<{ ctx: IntakeContext; admin: AdminSession | null }> {
  const ctx = await intakeContext();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return { ctx, admin: await readAdminSession(ctx, token) };
}

/** 401 unless an admin session is present; route handlers return the response as is. */
export async function requireAdmin(): Promise<{ ok: true; ctx: IntakeContext; admin: AdminSession } | { ok: false; response: NextResponse }> {
  const { ctx, admin } = await currentAdmin();
  return admin ? { ok: true, ctx, admin } : { ok: false, response: json({ status: "signed_out" }, 401) };
}

/** Passkey ceremonies are cheap to start; cap them per network address. */
export async function adminAuthAllowed(ctx: IntakeContext, request: NextRequest): Promise<boolean> {
  return hit(ctx, "adminAuthPerNetwork", networkKey(request));
}
