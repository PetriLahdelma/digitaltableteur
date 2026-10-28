/**
 * POST /api/gdpr/delete-data/confirm { token }
 *
 * The second step of erasure: the token from the emailed link proves the
 * requester controls the address. Spends the token and deletes every record
 * for that address (app/lib/gdpr-deletion.ts).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { anonymizeIp, confirmDeletion } from "../../../../lib/gdpr-deletion";
import { getDatabase } from "../../../../lib/mongodb";
import { checkRateLimit } from "../../../../lib/rate-limit";
import {
  SecurityLogger,
  getClientIp,
  getUserAgent,
} from "../../../../lib/security-logger";

const CONFIRM_RATE_LIMIT_WINDOW_MS = 900_000; // 15 minutes
const CONFIRM_RATE_LIMIT_MAX = 10; // requests per window per IP

// base64url of 32 random bytes is 43 characters.
const Body = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rateLimit = await checkRateLimit({
    scope: "gdpr:confirm",
    key: ip,
    windowMs: CONFIRM_RATE_LIMIT_WINDOW_MS,
    max: CONFIRM_RATE_LIMIT_MAX,
    failureMode: "block",
  });
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_link" }, { status: 400 });
  }

  try {
    const outcome = await confirmDeletion(await getDatabase(), parsed.data.token, anonymizeIp(ip));
    if (outcome.status === "invalid") {
      return NextResponse.json({ error: "invalid_link" }, { status: 400 });
    }
    SecurityLogger.logDataDeletion(ip, userAgent, "confirmed-by-link", true);
    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    console.error("GDPR deletion confirm error:", error instanceof Error ? error.message : "Unknown");
    SecurityLogger.logDataDeletion(ip, userAgent, "confirmed-by-link", false, "Database error");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
