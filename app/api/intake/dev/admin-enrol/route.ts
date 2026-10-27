import type { NextRequest } from "next/server";

import { createEnrolment } from "@/app/lib/intake/service/admin-auth";
import { isSameOrigin, json } from "@/app/lib/intake/service/http";
import { intakeContext, isIntakeDevMode } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Local development only (`npm run intake:dev`): an enrolment link for the
 * sandbox's own passkey. Production enrolment is the CLI script. Answers 404
 * everywhere else.
 */
export async function POST(request: NextRequest) {
  if (!isIntakeDevMode()) return json({ status: "not_found" }, 404);
  if (!isSameOrigin(request)) return json({ status: "forbidden" }, 403);
  const ctx = await intakeContext();
  const { token, expiresAt } = await createEnrolment(ctx);
  return json({ status: "ok", link: `${ctx.origin}/intake/admin/enrol#t=${token}`, expiresAt });
}
