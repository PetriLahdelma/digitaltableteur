import { timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { purgeExpired } from "@/app/lib/intake/db/retention";
import { dueExpiryReminders, releaseExpiryReminder } from "@/app/lib/intake/service/admin";
import { deliverNow } from "@/app/lib/intake/service/deliver";
import { json, serverError } from "@/app/lib/intake/service/http";
import { intakeContext } from "@/app/lib/intake/service/runtime";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return Boolean(secret) && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/**
 * Daily (vercel.json, CRON_SECRET bearer): first deletes everything past its
 * retention window (data-policy.ts), then tells the owner about unopened
 * invites that expire in about a day. A reminder whose send fails is released
 * for the next run; the others still go out.
 */
export async function GET(request: NextRequest) {
  if (!authorised(request)) return json({ status: "forbidden" }, 401);
  try {
    const ctx = await intakeContext();
    const purged = await purgeExpired(ctx.db, ctx.now());
    let sent = 0;
    let failed = 0;
    for (const reminder of await dueExpiryReminders(ctx)) {
      if (await deliverNow(reminder.mail, "cron.reminder")) sent += 1;
      else {
        failed += 1;
        await releaseExpiryReminder(ctx, reminder.inviteId);
      }
    }
    return json({ status: "ok", purged, reminders: { sent, failed } });
  } catch (error) {
    return serverError("cron.daily", error);
  }
}
