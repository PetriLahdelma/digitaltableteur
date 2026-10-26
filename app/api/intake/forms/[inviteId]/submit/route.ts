import { z } from "zod";
import type { NextRequest } from "next/server";

import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { submitIntake } from "@/app/lib/intake/service/forms";
import { json, readJsonBody, serverError } from "@/app/lib/intake/service/http";
import { currentClient } from "@/app/lib/intake/service/session";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z.object({ revision: z.number().int().min(0) }).strict();
const InviteId = z.uuid();

/** Freezes the saved draft. The answers submitted are the ones the server already holds. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const inviteId = InviteId.safeParse((await params).inviteId);
  const body = Body.safeParse(read.body);
  if (!inviteId.success) return json({ status: "not_found" }, 404);
  if (!body.success) return json({ status: "conflict" }, 409);
  try {
    const { ctx, session } = await currentClient();
    if (!session) return json({ status: "signed_out" }, 401);
    const result = await submitIntake(ctx, session.clientId, inviteId.data, body.data.revision);
    if (result.status === "submitted") {
      deliverAfterResponse(result.mail, "forms.submit");
      return json({ status: "submitted", submissionId: result.submissionId });
    }
    const status = { conflict: 409, not_found: 404, incomplete: 422 }[result.status];
    return json(result, status);
  } catch (error) {
    return serverError("forms.submit", error);
  }
}
