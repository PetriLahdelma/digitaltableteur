import type { NextRequest } from "next/server";

import { previewInvite } from "@/app/lib/intake/service/admin";
import { requireAdmin } from "@/app/lib/intake/service/admin-http";
import { json, readJsonBody } from "@/app/lib/intake/service/http";
import { MAIL_LOGO } from "@/app/lib/intake/service/mail-logo";

import { InviteBody } from "../schema";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

/** The invite email exactly as the client will get it; nothing is saved or sent. */
export async function POST(request: NextRequest) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = InviteBody.safeParse(read.body);
  if (!body.success) return json({ status: "invalid", fields: body.error.issues.map((issue) => String(issue.path[0])) }, 422);
  const mail = previewInvite(auth.ctx, body.data);
  if (!mail) return json({ status: "invalid", fields: ["questionnaireId"] }, 422);
  // Mail clients resolve the brand mark from its inline attachment (cid:); a page cannot.
  const html = mail.html.replaceAll(`cid:${MAIL_LOGO.contentId}`, `data:${MAIL_LOGO.contentType};base64,${MAIL_LOGO.base64}`);
  return json({ status: "ok", subject: mail.subject, html, text: mail.text });
}
