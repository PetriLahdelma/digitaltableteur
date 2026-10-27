import { timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { dueExpiryReminders } from "@/app/lib/intake/service/admin";
import { json, serverError } from "@/app/lib/intake/service/http";
import { intakeMailer, intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return Boolean(secret) && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/** Daily (vercel.json): tells the owner about unopened invites that expire within a day. */
export async function GET(request: NextRequest) {
  if (!authorised(request)) return json({ status: "forbidden" }, 401);
  try {
    const mails = await dueExpiryReminders(await intakeContext());
    const mailer = intakeMailer();
    for (const mail of mails) await mailer.send(mail);
    return json({ status: "ok", sent: mails.length });
  } catch (error) {
    return serverError("cron.reminders", error);
  }
}
