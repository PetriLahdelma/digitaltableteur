/**
 * GDPR Data Deletion API Endpoint (GDPR Article 17, Right to Erasure)
 *
 * POST /api/gdpr/delete-data asks for erasure: when data exists for the
 * address, a one-time confirmation link is mailed to it (app/lib/gdpr-
 * deletion.ts). Nothing is deleted here. The link opens
 * /privacy-policy/delete, which confirms through
 * POST /api/gdpr/delete-data/confirm.
 */

import * as Sentry from "@sentry/nextjs";
import { after, NextRequest, NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import { getDatabase } from "../../../lib/mongodb";
import {
  issueDeletionLink,
  normalizeEmail,
  type DeletionLocale,
} from "../../../lib/gdpr-deletion";
import {
  SecurityLogger,
  getClientIp,
  getUserAgent,
} from "../../../lib/security-logger";
import { createCorsHeaders } from "../../chat-shared";
import { checkRateLimit } from "../../../lib/rate-limit";

const GDPR_RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hour
const GDPR_RATE_LIMIT_MAX = 3; // requests per window per email
const GDPR_IP_RATE_LIMIT_WINDOW_MS = 900_000; // 15 minutes
const GDPR_IP_RATE_LIMIT_MAX = 10; // requests per window per IP

const LOCALES: readonly DeletionLocale[] = ["en", "fi", "sv"];

/** The same answer whether or not data exists, so nothing can be probed. */
const REQUEST_ACCEPTED_MESSAGE =
  "If data is associated with this email address, a confirmation link has been sent to it. Nothing is deleted until the link is opened and the deletion confirmed.";

/**
 * POST /api/gdpr/delete-data
 * Request deletion of user data from the database
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const rawEmail = typeof body.email === "string" ? body.email : null;
    const email = rawEmail ? normalizeEmail(sanitize(rawEmail)) : null;
    const locale: DeletionLocale = LOCALES.includes(body.locale)
      ? body.locale
      : "en";

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      SecurityLogger.logDataDeletion(
        ip,
        userAgent,
        email || "invalid",
        false,
        "Invalid email format",
      );
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const ipRateLimit = await checkRateLimit({
      scope: "gdpr:ip",
      key: ip,
      windowMs: GDPR_IP_RATE_LIMIT_WINDOW_MS,
      max: GDPR_IP_RATE_LIMIT_MAX,
      failureMode: "block",
    });

    if (ipRateLimit.limited) {
      SecurityLogger.logDataDeletion(
        ip,
        userAgent,
        email,
        false,
        "Rate limit exceeded",
      );
      return NextResponse.json(
        {
          error: "Too many deletion requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(ipRateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const emailRateLimit = await checkRateLimit({
      scope: "gdpr:email",
      key: email,
      windowMs: GDPR_RATE_LIMIT_WINDOW_MS,
      max: GDPR_RATE_LIMIT_MAX,
      failureMode: "block",
    });

    if (emailRateLimit.limited) {
      SecurityLogger.logDataDeletion(
        ip,
        userAgent,
        email,
        false,
        "Rate limit exceeded",
      );
      return NextResponse.json(
        {
          error: "Too many deletion requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(emailRateLimit.retryAfterSeconds),
          },
        },
      );
    }

    // The lookup and the mail run after the response, so the answer and
    // its timing are the same whether or not data exists.
    after(async () => {
      try {
        await issueDeletionLink(await getDatabase(), email, locale);
      } catch (error) {
        Sentry.captureException(error, { tags: { area: "gdpr", step: "issue-link" } });
      }
    });

    SecurityLogger.logDataDeletion(ip, userAgent, email, true, "Link requested");

    return NextResponse.json(
      { message: REQUEST_ACCEPTED_MESSAGE, requested: true },
      { status: 202 },
    );
  } catch (error) {
    console.error("GDPR deletion request error:", error);
    SecurityLogger.logDataDeletion(
      ip,
      userAgent,
      "unknown",
      false,
      "Invalid request",
    );
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 },
    );
  }
}

/**
 * GET /api/gdpr/delete-data
 *
 * Previously returned { exists: boolean } for an email, which let anyone
 * enumerate which addresses are stored in the database. No code in this
 * repo consumed that response, so the existence check has been removed.
 * The route now returns a static instruction and never touches the
 * database.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rateLimitResult = await checkRateLimit({
    scope: "gdpr:ip",
    key: ip,
    windowMs: GDPR_IP_RATE_LIMIT_WINDOW_MS,
    max: GDPR_IP_RATE_LIMIT_MAX,
    failureMode: "block",
  });

  if (rateLimitResult.limited) {
    SecurityLogger.logRateLimitExceeded(
      ip,
      userAgent,
      "/api/gdpr/delete-data",
    );
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds) },
      },
    );
  }

  return NextResponse.json({
    message:
      "To request deletion of your personal data, use https://www.digitaltableteur.com/privacy-policy/delete or send a POST request with your email address. A confirmation link is mailed to that address; nothing is deleted until it is confirmed.",
  });
}

export async function OPTIONS(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
