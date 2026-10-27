import { z } from "zod";
import type { NextRequest } from "next/server";

import { startRegistration } from "@/app/lib/intake/service/admin-auth";
import { adminAuthAllowed, currentAdmin, setAdminPreauthCookie } from "@/app/lib/intake/service/admin-http";
import { json, readJsonBody, serverError } from "@/app/lib/intake/service/http";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z.object({ enrolmentToken: z.string().max(200).optional() }).strict();

/** New passkey, step 1: allowed with a CLI enrolment token or from inside admin. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const body = Body.safeParse(read.body);
  if (!body.success) return json({ status: "invalid" }, 400);
  try {
    const { ctx, admin } = await currentAdmin();
    if (!(await adminAuthAllowed(ctx, request))) return json({ status: "rate_limited" }, 429);
    const result = await startRegistration(ctx, { enrolmentToken: body.data.enrolmentToken, adminSession: admin });
    if (result.status !== "ok") return json({ status: "forbidden" }, 403);
    const response = json({ status: "ok", options: result.options });
    setAdminPreauthCookie(response, result.preauthToken);
    return response;
  } catch (error) {
    return serverError("admin.enrol.options", error);
  }
}
