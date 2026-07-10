/**
 * GDPR Data Deletion API Endpoint
 * Allows users to request deletion of their personal data
 * Complies with GDPR Article 17 (Right to Erasure)
 */

import { NextRequest, NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import { getDatabase } from "../../../lib/mongodb";
import {
  SecurityLogger,
  getClientIp,
  getUserAgent,
} from "../../../lib/security-logger";
import { createCorsHeaders } from "../../chat-shared";
import { checkRateLimit } from "../../../lib/rate-limit";

interface DeleteDataRequest {
  email: string;
  reason?: string;
  confirmationToken?: string;
}

const GDPR_RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hour
const GDPR_RATE_LIMIT_MAX = 3; // requests per window per email
const GDPR_IP_RATE_LIMIT_WINDOW_MS = 900_000; // 15 minutes
const GDPR_IP_RATE_LIMIT_MAX = 10; // requests per window per IP

/**
 * Audit-trail retention. The deletion_requests record exists to demonstrate
 * that an erasure request was honoured (GDPR Art. 5(2) accountability and
 * Art. 17(3)(e) legal-claims defence), so it keeps the requested email but is
 * data-minimised: no user agent, IP truncated to network granularity, and the
 * whole record expires via a TTL index after 12 months.
 */
const DELETION_AUDIT_TTL_SECONDS = 60 * 60 * 24 * 365;

/** Truncate an IP to network granularity (IPv4 /24, IPv6 /48-ish). */
const anonymizeIp = (ip: string): string => {
  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 3).join(":")}::`;
  }
  const parts = ip.split(".");
  return parts.length === 4 ? `${parts.slice(0, 3).join(".")}.0` : "unknown";
};

let auditTtlIndexEnsured: Promise<unknown> | null = null;

/**
 * POST /api/gdpr/delete-data
 * Request deletion of user data from the database
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const rawEmail = body.email;
    const email = rawEmail ? sanitize(rawEmail) : null;
    const reason = body.reason;

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

    try {
      const db = await getDatabase();
      const contacts = db.collection("contacts");

      // Delete any data associated with this email. No existence check
      // first: the response must be identical whether or not records
      // existed, so the endpoint cannot be used to probe which email
      // addresses are stored. The actual count goes to the audit trail only.
      const deletionResult = await contacts.deleteMany({ email });

      // Data-minimised audit trail (see DELETION_AUDIT_TTL_SECONDS note).
      const deletionRequests = db.collection("deletion_requests");
      auditTtlIndexEnsured ??= deletionRequests
        .createIndex(
          { requestedAt: 1 },
          { expireAfterSeconds: DELETION_AUDIT_TTL_SECONDS },
        )
        .catch((indexError) => {
          console.error("deletion_requests TTL index error:", indexError);
          auditTtlIndexEnsured = null;
        });
      await auditTtlIndexEnsured;
      await deletionRequests.insertOne({
        email,
        reason: reason || "User request",
        requestedAt: new Date(),
        requestIp: anonymizeIp(ip),
        deletedCount: deletionResult.deletedCount,
        status: "completed",
      });

      SecurityLogger.logDataDeletion(ip, userAgent, email, true);

      return NextResponse.json(
        {
          message:
            "If data was associated with this email address, it has been deleted.",
          deleted: true,
        },
        { status: 200 },
      );
    } catch (err) {
      console.error("MongoDB deletion error:", err);
      SecurityLogger.logDataDeletion(
        ip,
        userAgent,
        email,
        false,
        "Database error",
      );
      return NextResponse.json(
        { error: "Failed to delete data. Please try again later." },
        { status: 500 },
      );
    }
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
      "To request deletion of your personal data, send a POST request with your email address. The request is processed the same way whether or not data exists.",
  });
}

export async function OPTIONS(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
