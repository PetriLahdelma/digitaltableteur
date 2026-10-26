import { z } from "zod";
import type { NextRequest } from "next/server";

import { isEnabledLocale } from "@/app/lib/intake/copy";
import { requestCodeForEmail } from "@/app/lib/intake/service/auth";
import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { json, networkKey, readJsonBody, serverError, setPreauthCookie } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z.object({ email: z.email().max(254), locale: z.string().refine(isEnabledLocale) }).strict();

/** Returning clients: the answer never says whether the address has an intake. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const body = Body.safeParse(read.body);
  if (!body.success) return json({ status: "invalid_email" }, 400);
  try {
    const result = await requestCodeForEmail(await intakeContext(), body.data.email, body.data.locale, networkKey(request));
    if (result.status !== "sent") return json({ status: "rate_limited" }, 429);
    deliverAfterResponse(result.mail, "auth.email");
    const response = json({ status: "sent" });
    setPreauthCookie(response, result.preauthToken);
    return response;
  } catch (error) {
    return serverError("auth.email", error);
  }
}
