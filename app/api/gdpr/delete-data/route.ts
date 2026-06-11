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

interface DeleteDataRequest {
  email: string;
  reason?: string;
  confirmationToken?: string;
}

// Rate limiting to prevent enumeration attacks
// Security audit recommendation: 3 requests per hour per email
const GDPR_RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hour
const GDPR_RATE_LIMIT_MAX = 3; // requests per window per email
const gdprBuckets = new Map<string, { count: number; windowStart: number }>();

function pruneExpiredBuckets(
  buckets: Map<string, { count: number; windowStart: number }>,
  windowMs: number,
) {
  const now = Date.now();

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStart > windowMs) {
      buckets.delete(key);
    }
  }
}

function isGdprRateLimited(email: string): boolean {
  pruneExpiredBuckets(gdprBuckets, GDPR_RATE_LIMIT_WINDOW_MS);
  const now = Date.now();
  const bucket = gdprBuckets.get(email);

  if (!bucket || now - bucket.windowStart > GDPR_RATE_LIMIT_WINDOW_MS) {
    gdprBuckets.set(email, { count: 1, windowStart: now });
    return false;
  }

  if (bucket.count >= GDPR_RATE_LIMIT_MAX) {
    return true;
  }

  bucket.count += 1;
  return false;
}

// Per-IP rate limiting for both methods. The per-email POST limit alone
// does not stop enumeration: an attacker rotating email addresses gets a
// fresh bucket every request, so the IP itself must also be limited.
const GDPR_IP_RATE_LIMIT_WINDOW_MS = 900_000; // 15 minutes
const GDPR_IP_RATE_LIMIT_MAX = 10; // requests per window per IP
const gdprIpBuckets = new Map<string, { count: number; windowStart: number }>();

function isGdprIpRateLimited(ip: string): boolean {
  pruneExpiredBuckets(gdprIpBuckets, GDPR_IP_RATE_LIMIT_WINDOW_MS);
  const now = Date.now();
  const bucket = gdprIpBuckets.get(ip);

  if (!bucket || now - bucket.windowStart > GDPR_IP_RATE_LIMIT_WINDOW_MS) {
    gdprIpBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (bucket.count >= GDPR_IP_RATE_LIMIT_MAX) {
    return true;
  }

  bucket.count += 1;
  return false;
}

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

    // Rate limiting to prevent abuse: per IP (enumeration across many
    // emails) and per email (hammering a single address)
    if (isGdprIpRateLimited(ip) || isGdprRateLimited(email)) {
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
        { status: 429, headers: { "Retry-After": "3600" } },
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

      // Log the request for the audit trail
      await db.collection("deletion_requests").insertOne({
        email,
        reason: reason || "User request",
        requestedAt: new Date(),
        requestIp: ip,
        requestUserAgent: userAgent,
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

  if (isGdprIpRateLimited(ip)) {
    SecurityLogger.logRateLimitExceeded(
      ip,
      userAgent,
      "/api/gdpr/delete-data",
    );
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "900" } },
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
