import { z } from "zod";
import type { NextRequest } from "next/server";

import { QUESTIONNAIRE_IDS } from "@/app/lib/intake";
import { isEnabledLocale } from "@/app/lib/intake/copy";
import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { json, readJsonBody } from "@/app/lib/intake/service/http";
import { createInvite } from "@/app/lib/intake/service/invites";
import { intakeContext, isIntakeDevMode } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z
  .object({
    email: z.email(),
    name: z.string().min(1).max(200),
    questionnaireId: z.enum(QUESTIONNAIRE_IDS),
    locale: z.string().refine(isEnabledLocale),
  })
  .strict();

/**
 * Local development only (`npm run intake:dev`): creates an invite in the
 * PGlite database until the admin area exists. Answers 404 everywhere else,
 * including every production build, where NODE_ENV is always "production".
 */
export async function POST(request: NextRequest) {
  if (!isIntakeDevMode()) return json({ status: "not_found" }, 404);
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const body = Body.safeParse(read.body);
  if (!body.success) return json({ status: "invalid" }, 422);
  const created = await createInvite(await intakeContext(), body.data);
  deliverAfterResponse(created.mail, "dev.invite");
  return json({ status: "created", inviteId: created.inviteId });
}
