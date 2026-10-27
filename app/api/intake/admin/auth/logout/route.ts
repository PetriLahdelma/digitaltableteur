import type { NextRequest } from "next/server";

import { ADMIN_COOKIE, endAdminSession } from "@/app/lib/intake/service/admin-auth";
import { clearCookie, isSameOrigin, json, serverError } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ status: "forbidden" }, 403);
  try {
    await endAdminSession(await intakeContext(), request.cookies.get(ADMIN_COOKIE)?.value);
    const response = json({ status: "ok" });
    clearCookie(response, ADMIN_COOKIE);
    return response;
  } catch (error) {
    return serverError("admin.auth.logout", error);
  }
}
