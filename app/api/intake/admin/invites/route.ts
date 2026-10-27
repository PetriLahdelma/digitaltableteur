import type { NextRequest } from "next/server";

import { requireAdmin } from "@/app/lib/intake/service/admin-http";
import { deliverNow } from "@/app/lib/intake/service/deliver";
import { json, readJsonBody, serverError } from "@/app/lib/intake/service/http";
import {
  createInvite,
  IntakeExistsError,
} from "@/app/lib/intake/service/invites";
import { hit } from "@/app/lib/intake/service/rate-limit";

import { InviteBody } from "./schema";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

/**
 * Creates the invite and sends it while the owner waits, so a failed send is
 * reported ("mail_failed") instead of a "sent" that never left. A client has
 * one intake per form.
 */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = InviteBody.safeParse(read.body);
  if (!body.success)
    return json(
      {
        status: "invalid",
        fields: body.error.issues.map((issue) => String(issue.path[0])),
      },
      422,
    );
  try {
    if (!(await hit(auth.ctx, "adminInvitesPerDay", "owner")))
      return json({ status: "rate_limited" }, 429);
    const created = await createInvite(auth.ctx, body.data);
    const delivered = await deliverNow(created.mail, "admin.invite");
    return json({
      status: delivered ? "sent" : "mail_failed",
      inviteId: created.inviteId,
    });
  } catch (error) {
    if (error instanceof IntakeExistsError)
      return json({ status: "exists" }, 409);
    return serverError("admin.invite", error);
  }
}
