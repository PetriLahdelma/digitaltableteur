import type { NextRequest } from "next/server";

import { sendInvite } from "@/app/lib/intake/service/admin";
import { requireAdmin } from "@/app/lib/intake/service/admin-http";
import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { json, readJsonBody, serverError } from "@/app/lib/intake/service/http";
import { IntakeExistsError } from "@/app/lib/intake/service/invites";

import { InviteBody } from "./schema";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

/** Creates the invite and sends it. A client has one intake per form. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = InviteBody.safeParse(read.body);
  if (!body.success) return json({ status: "invalid", fields: body.error.issues.map((issue) => String(issue.path[0])) }, 422);
  try {
    const created = await sendInvite(auth.ctx, body.data);
    deliverAfterResponse(created.mail, "admin.invite");
    return json({ status: "sent", inviteId: created.inviteId });
  } catch (error) {
    if (error instanceof IntakeExistsError) return json({ status: "exists" }, 409);
    return serverError("admin.invite", error);
  }
}
