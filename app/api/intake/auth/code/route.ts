import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import type { NextRequest } from "next/server";

import { CodeRaceError, PREAUTH_COOKIE, verifyLoginCode } from "@/app/lib/intake/service/auth";
import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { clearCookie, json, networkKey, readJsonBody, serverError, setSessionCookie } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z.object({ code: z.string().regex(/^\d{8}$/) }).strict();

/** Redeems the emailed code for a session; a new session id on every sign-in. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const body = Body.safeParse(read.body);
  if (!body.success) return json({ status: "wrong" }, 400);
  const preauth = request.cookies.get(PREAUTH_COOKIE)?.value;
  if (!preauth) return json({ status: "expired" }, 400);
  try {
    const result = await verifyLoginCode(await intakeContext(), preauth, body.data.code, networkKey(request), (message) =>
      Sentry.captureMessage(message, { level: "warning", tags: { area: "intake" } }),
    );
    if (result.status !== "ok") return json({ status: result.status }, 400);
    for (const mail of result.ownerMails) deliverAfterResponse(mail, "auth.code.owner");
    const response = json({ status: "ok" });
    clearCookie(response, PREAUTH_COOKIE);
    setSessionCookie(response, result.sessionToken);
    return response;
  } catch (error) {
    if (error instanceof CodeRaceError) return json({ status: "expired" }, 400);
    return serverError("auth.code", error);
  }
}
