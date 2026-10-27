import type { NextRequest } from "next/server";

import { startAuthentication } from "@/app/lib/intake/service/admin-auth";
import { adminAuthAllowed, setAdminPreauthCookie } from "@/app/lib/intake/service/admin-http";
import { isSameOrigin, json, serverError } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

/** Passkey sign-in, step 1: a challenge bound to a five-minute cookie. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ status: "forbidden" }, 403);
  try {
    const ctx = await intakeContext();
    if (!(await adminAuthAllowed(ctx, request))) return json({ status: "rate_limited" }, 429);
    const { options, preauthToken } = await startAuthentication(ctx);
    const response = json({ status: "ok", options });
    setAdminPreauthCookie(response, preauthToken);
    return response;
  } catch (error) {
    return serverError("admin.auth.options", error);
  }
}
