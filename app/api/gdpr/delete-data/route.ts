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

function isGdprRateLimited(email: string): boolean {
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

    // Rate limiting to prevent enumeration attacks
    if (isGdprRateLimited(email)) {
      SecurityLogger.logDataDeletion(
        ip,
        userAgent,
        email,
        false,
        "Rate limit exceeded",
      );
      return NextResponse.json(
        { error: "Too many deletion requests for this email. Please try again in 1 hour." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    try {
      const db = await getDatabase();
      const contacts = db.collection("contacts");

      // Check if data exists
      const existingData = await contacts.findOne({ email });

      if (!existingData) {
        SecurityLogger.logDataDeletion(
          ip,
          userAgent,
          email,
          false,
          "No data found for email",
        );
        return NextResponse.json(
          {
            message: "No data found for this email address",
            deleted: false,
          },
          { status: 404 },
        );
      }

      // Delete all data associated with this email
      const deletionResult = await contacts.deleteMany({ email });

      // Log the deletion for audit trail (before actual deletion)
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
          message: "Your data has been successfully deleted",
          deleted: true,
          recordsDeleted: deletionResult.deletedCount,
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
 * Check if data exists for an email (without deleting)
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const { searchParams } = new URL(request.url);
    const rawEmail = searchParams.get("email");
    const email = rawEmail ? sanitize(rawEmail) : null;

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    try {
      const db = await getDatabase();
      const contacts = db.collection("contacts");

      const count = await contacts.countDocuments({ email });

      SecurityLogger.logDataAccess(
        ip,
        userAgent,
        "/api/gdpr/delete-data",
        "GET",
        true,
        { email, recordCount: count },
      );

      return NextResponse.json({
        exists: count > 0,
        recordCount: count,
        email,
      });
    } catch (err) {
      console.error("MongoDB query error:", err);
      return NextResponse.json(
        { error: "Failed to check data" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("GDPR data check error:", error);
    return NextResponse.json(
      { error: "Failed to check data" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
