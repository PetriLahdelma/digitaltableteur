import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, endSession } from "@/app/lib/intake/service/auth";
import { clearCookie, isSameOrigin, json, serverError } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

/** Plain form POST from the intake header, so signing out works without JavaScript. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ status: "forbidden" }, 403);
  try {
    await endSession(await intakeContext(), request.cookies.get(SESSION_COOKIE)?.value);
  } catch (error) {
    return serverError("auth.logout", error);
  }
  const response = NextResponse.redirect(new URL("/intake?signedOut=1", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  clearCookie(response, SESSION_COOKIE);
  return response;
}
