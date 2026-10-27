import { z } from "zod";
import type { NextRequest } from "next/server";

import { ADMIN_PREAUTH_COOKIE, finishAuthentication } from "@/app/lib/intake/service/admin-auth";
import { adminAuthAllowed, setAdminCookie } from "@/app/lib/intake/service/admin-http";
import { clearCookie, json, readJsonBody, serverError } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z.object({ response: z.object({ id: z.string().min(1).max(1024) }).passthrough() }).strict();

/** Passkey sign-in, step 2: verify the assertion and start the owner's session. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const body = Body.safeParse(read.body);
  if (!body.success) return json({ status: "invalid" }, 400);
  try {
    const ctx = await intakeContext();
    if (!(await adminAuthAllowed(ctx, request))) return json({ status: "rate_limited" }, 429);
    const result = await finishAuthentication(ctx, request.cookies.get(ADMIN_PREAUTH_COOKIE)?.value, body.data.response as never);
    if (result.status !== "ok") return json({ status: "invalid" }, 400);
    const response = json({ status: "ok" });
    clearCookie(response, ADMIN_PREAUTH_COOKIE);
    setAdminCookie(response, result.sessionToken);
    return response;
  } catch (error) {
    return serverError("admin.auth.verify", error);
  }
}
