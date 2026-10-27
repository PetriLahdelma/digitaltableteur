import { z } from "zod";
import type { NextRequest } from "next/server";

import {
  deleteIntake,
  reopenIntake,
  resendInvite,
  revokeInvite,
} from "@/app/lib/intake/service/admin";
import { requireAdmin } from "@/app/lib/intake/service/admin-http";
import { deliverNow } from "@/app/lib/intake/service/deliver";
import { isSameOrigin, json, serverError } from "@/app/lib/intake/service/http";
import { hit } from "@/app/lib/intake/service/rate-limit";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Params = z.object({
  inviteId: z.uuid(),
  action: z.enum(["resend", "revoke", "reopen", "delete"]),
});

/** The owner's actions on one intake. Each writes an audit entry in the service. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string; action: string }> },
) {
  if (!isSameOrigin(request)) return json({ status: "forbidden" }, 403);
  // Signed in first, so the route says nothing about which actions exist.
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const parsed = Params.safeParse(await params);
  if (!parsed.success) return json({ status: "not_found" }, 404);
  const { inviteId, action } = parsed.data;
  try {
    if (action === "delete") {
      return (await deleteIntake(auth.ctx, inviteId))
        ? json({ status: "deleted" })
        : json({ status: "not_found" }, 404);
    }
    if (action === "revoke") {
      const result = await revokeInvite(auth.ctx, inviteId);
      return result === "revoked"
        ? json({ status: "revoked" })
        : json({ status: result ?? "not_found" }, result ? 409 : 404);
    }
    if (
      action === "resend" &&
      !(await hit(auth.ctx, "adminInvitesPerDay", "owner"))
    )
      return json({ status: "rate_limited" }, 429);
    const result =
      action === "resend"
        ? await resendInvite(auth.ctx, inviteId)
        : await reopenIntake(auth.ctx, inviteId);
    if (result === null) return json({ status: "not_found" }, 404);
    if (result === "not_allowed") return json({ status: "not_allowed" }, 409);
    // Sent while the owner waits, so a failed send shows in admin.
    const delivered = await deliverNow(result, `admin.${action}`);
    return json({
      status: action === "resend" ? "sent" : "reopened",
      mail: delivered ? "sent" : "failed",
    });
  } catch (error) {
    return serverError(`admin.${action}`, error);
  }
}
