import { z } from "zod";
import type { NextRequest } from "next/server";

import { deleteIntake, reopenIntake, resendInvite, revokeInvite } from "@/app/lib/intake/service/admin";
import { requireAdmin } from "@/app/lib/intake/service/admin-http";
import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { isSameOrigin, json, serverError } from "@/app/lib/intake/service/http";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Params = z.object({ inviteId: z.uuid(), action: z.enum(["resend", "revoke", "reopen", "delete"]) });

/** The owner's actions on one intake. Each writes an audit entry in the service. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ inviteId: string; action: string }> }) {
  if (!isSameOrigin(request)) return json({ status: "forbidden" }, 403);
  const parsed = Params.safeParse(await params);
  if (!parsed.success) return json({ status: "not_found" }, 404);
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { inviteId, action } = parsed.data;
  try {
    if (action === "delete") {
      return (await deleteIntake(auth.ctx, inviteId)) ? json({ status: "deleted" }) : json({ status: "not_found" }, 404);
    }
    if (action === "revoke") {
      const result = await revokeInvite(auth.ctx, inviteId);
      return result === "revoked" ? json({ status: "revoked" }) : json({ status: result ?? "not_found" }, result ? 409 : 404);
    }
    const result = action === "resend" ? await resendInvite(auth.ctx, inviteId) : await reopenIntake(auth.ctx, inviteId);
    if (result === null) return json({ status: "not_found" }, 404);
    if (result === "not_allowed") return json({ status: "not_allowed" }, 409);
    deliverAfterResponse(result, `admin.${action}`);
    return json({ status: action === "resend" ? "sent" : "reopened" });
  } catch (error) {
    return serverError(`admin.${action}`, error);
  }
}
