import { z } from "zod";
import type { NextRequest } from "next/server";

import { requestCodeForInvite } from "@/app/lib/intake/service/auth";
import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { json, networkKey, readJsonBody, serverError, setPreauthCookie } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict();

/** Continue on the invite landing page: emails a code to the invited address. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const body = Body.safeParse(read.body);
  if (!body.success) return json({ status: "invalid_invite" }, 400);
  try {
    const result = await requestCodeForInvite(await intakeContext(), body.data.token, networkKey(request));
    if (result.status === "rate_limited") return json({ status: "rate_limited" }, 429);
    if (result.status === "invalid_invite") return json({ status: "invalid_invite" }, 410);
    deliverAfterResponse(result.mail, "auth.invite");
    const response = json({ status: "sent", locale: result.locale });
    setPreauthCookie(response, result.preauthToken);
    return response;
  } catch (error) {
    return serverError("auth.invite", error);
  }
}
