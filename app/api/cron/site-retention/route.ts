import { timingSafeEqual } from "node:crypto";

import * as Sentry from "@sentry/nextjs";
import { NextResponse, type NextRequest } from "next/server";

import {
  deliverStoredContact,
  MAX_DELIVERY_ATTEMPTS,
} from "@/app/lib/contact-delivery";
import type { ContactNotificationPayload } from "@/app/lib/contact-notification-email";
import { getDatabase } from "@/app/lib/mongodb";
import { purgeExpiredSiteData } from "@/app/lib/site-retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A pending record older than this never finished its first send. */
const STALE_PENDING_MS = 10 * 60 * 1000;
const RETRIES_PER_RUN = 20;

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return (
    Boolean(secret) &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

/**
 * Daily (vercel.json, CRON_SECRET bearer): deletes contact submissions and
 * chat leads past the 2-year retention window, then retries owner
 * notifications that failed or never finished.
 */
export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json({ status: "forbidden" }, { status: 401 });
  }
  try {
    const now = new Date();
    const db = await getDatabase();
    const purged = await purgeExpiredSiteData(db, now);

    const contacts = db.collection("contacts");
    const due = await contacts
      .find({
        $or: [
          { emailDeliveryStatus: "failed" },
          {
            emailDeliveryStatus: "pending",
            createdAt: { $lt: new Date(now.getTime() - STALE_PENDING_MS) },
          },
        ],
        emailDeliveryAttempts: { $lt: MAX_DELIVERY_ATTEMPTS },
      })
      .limit(RETRIES_PER_RUN)
      .toArray();

    let sent = 0;
    let failed = 0;
    for (const doc of due) {
      const delivered = await deliverStoredContact(
        contacts,
        doc._id,
        doc as unknown as ContactNotificationPayload,
      );
      if (delivered) sent += 1;
      else failed += 1;
    }

    return NextResponse.json({
      status: "ok",
      purged,
      notifications: { sent, failed },
    });
  } catch (error) {
    Sentry.captureException(error, { tags: { area: "cron", route: "site-retention" } });
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
