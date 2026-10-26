import { z } from "zod";
import type { NextRequest } from "next/server";

import { saveDraft } from "@/app/lib/intake/service/forms";
import { json, readJsonBody, serverError } from "@/app/lib/intake/service/http";
import { hit } from "@/app/lib/intake/service/rate-limit";
import { currentClient } from "@/app/lib/intake/service/session";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const Body = z
  .object({
    revision: z.number().int().min(0),
    answers: z.record(z.string(), z.unknown()),
    completedParts: z.array(z.string().max(64)).max(32).optional(),
  })
  .strict();
const InviteId = z.uuid();

/** Autosave. 409 means another tab saved first; the page offers a reload. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const inviteId = InviteId.safeParse((await params).inviteId);
  const body = Body.safeParse(read.body);
  if (!inviteId.success) return json({ status: "not_found" }, 404);
  if (!body.success) return json({ status: "invalid", fields: [] }, 422);
  try {
    const { ctx, session } = await currentClient();
    if (!session) return json({ status: "signed_out" }, 401);
    if (!(await hit(ctx, "savesPerSession", session.idHash))) return json({ status: "rate_limited" }, 429);
    const result = await saveDraft(ctx, session.clientId, inviteId.data, body.data);
    const status = { saved: 200, conflict: 409, not_found: 404, invalid: 422 }[result.status];
    return json(result, status);
  } catch (error) {
    return serverError("forms.draft", error);
  }
}
