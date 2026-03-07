import { NextRequest, NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import { getDatabase } from "../../lib/mongodb";
import {
  SecurityLogger,
  getClientIp,
  getUserAgent,
} from "../../lib/security-logger";
import { createCorsHeaders } from "../chat-shared";

// Simple in-memory rate limiter (best-effort; serverless cold starts reset this)
// Security audit recommendation: 3 submissions per 15 minutes to prevent spam amplification
const RATE_LIMIT_WINDOW_MS = 900_000; // 15 minutes
const RATE_LIMIT_MAX = 3; // requests per window per IP
const buckets = new Map<string, { count: number; windowStart: number }>();
const ALLOWED_CONTACT_TYPES = new Set(["newsletter"]);
const ALLOWED_CONTACT_SOURCES = new Set(["waitlist"]);

function rateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return true;
  bucket.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Rate limit check FIRST - before any expensive operations (JSON parsing, DB calls)
  if (rateLimit(ip)) {
    SecurityLogger.logRateLimitExceeded(ip, userAgent, "/api/save-contact");
    return NextResponse.json(
      {
        error:
          "Too many contact form submissions. Please try again in 15 minutes.",
      },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  try {
    const body = await request.json();

    // Sanitize all inputs to prevent NoSQL injection
    const name = body.name ? sanitize(body.name) : null;
    const email = body.email ? sanitize(body.email) : null;
    const phone = body.phone ? sanitize(body.phone) : null;
    const interest = body.interest ? sanitize(body.interest) : null;
    const message = body.message ? sanitize(body.message) : null;
    const time = body.time ? sanitize(body.time) : null;
    const rawType = body.type ? sanitize(body.type) : null;
    const rawSource = body.source ? sanitize(body.source) : null;
    const type =
      typeof rawType === "string" && ALLOWED_CONTACT_TYPES.has(rawType)
        ? rawType
        : null;
    const source =
      typeof rawSource === "string" && ALLOWED_CONTACT_SOURCES.has(rawSource)
        ? rawSource
        : null;

    if ((rawType !== null && type === null) || (rawSource !== null && source === null)) {
      SecurityLogger.logDataAccess(
        ip,
        userAgent,
        "/api/save-contact",
        "POST",
        false,
        { reason: "Invalid contact metadata" },
      );
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    if (source && type !== "newsletter") {
      SecurityLogger.logDataAccess(
        ip,
        userAgent,
        "/api/save-contact",
        "POST",
        false,
        { reason: "Invalid contact source" },
      );
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Newsletter signups only require a valid email
    const isNewsletter = type === "newsletter";
    const isValidEmail = typeof email === "string" && emailRegex.test(email);
    const hasName = typeof name === "string" && name.trim().length > 0;
    const isValid = isNewsletter ? isValidEmail : hasName && isValidEmail;

    if (!isValid) {
      SecurityLogger.logDataAccess(
        ip,
        userAgent,
        "/api/save-contact",
        "POST",
        false,
        { reason: "Invalid form data" },
      );
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    try {
      const db = await getDatabase();
      const contacts = db.collection("contacts");

      // Add IP and timestamp for audit purposes
      await contacts.insertOne({
        name,
        email,
        phone,
        interest,
        message,
        time,
        type,
        source,
        submittedFrom: ip,
        userAgent,
        createdAt: new Date(),
      });

      SecurityLogger.logDataAccess(
        ip,
        userAgent,
        "/api/save-contact",
        "POST",
        true,
        { email },
      );

      return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (err) {
      console.error("MongoDB error:", err);
      SecurityLogger.logDataAccess(
        ip,
        userAgent,
        "/api/save-contact",
        "POST",
        false,
        {
          reason: "Database error",
          error: err instanceof Error ? err.message : "Unknown",
        },
      );
      return NextResponse.json(
        { error: "Failed to save contact information" },
        { status: 500 },
      );
    }
  } catch {
    SecurityLogger.logDataAccess(
      ip,
      userAgent,
      "/api/save-contact",
      "POST",
      false,
      { reason: "Invalid JSON body" },
    );
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function OPTIONS(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
