import { z } from "zod";
import type { NextRequest } from "next/server";

import { ADMIN_PREAUTH_COOKIE, finishRegistration } from "@/app/lib/intake/service/admin-auth";
import { adminAuthAllowed, currentAdmin, setAdminCookie } from "@/app/lib/intake/service/admin-http";
import { deliverNow } from "@/app/lib/intake/service/deliver";
import { clearCookie, json, readJsonBody, serverError } from "@/app/lib/intake/service/http";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z
  .object({
    response: z.object({ id: z.string().min(1).max(1024) }).passthrough(),
    label: z.string().max(60),
    enrolmentToken: z.string().max(200).optional(),
  })
  .strict();

/** New passkey, step 2: store it; through an enrolment token this also signs the owner in. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const body = Body.safeParse(read.body);
  if (!body.success) return json({ status: "invalid" }, 400);
  try {
    const { ctx, admin } = await currentAdmin();
    if (!(await adminAuthAllowed(ctx, request))) return json({ status: "rate_limited" }, 429);
    const result = await finishRegistration(ctx, {
      preauthToken: request.cookies.get(ADMIN_PREAUTH_COOKIE)?.value,
      response: body.data.response as never,
      label: body.data.label,
      enrolmentToken: body.data.enrolmentToken,
      adminSession: admin,
    });
    if (result.status !== "ok") return json({ status: result.status }, result.status === "invalid" ? 400 : 403);
    // A security notice: sent while the owner waits, so a failed send is reported.
    await deliverNow(result.ownerMail, "admin.passkey.add");
    const response = json({ status: "ok" });
    clearCookie(response, ADMIN_PREAUTH_COOKIE);
    if (result.session) setAdminCookie(response, result.session.sessionToken);
    return response;
  } catch (error) {
    return serverError("admin.enrol.verify", error);
  }
}
