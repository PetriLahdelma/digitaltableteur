import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { timingSafeEqual } from "crypto";
import {
  SecurityLogger,
  getClientIp,
  getUserAgent,
} from "../../lib/security-logger";
import { createCorsHeaders } from "../chat-shared";

/**
 * Rate limiting for CV password attempts
 * Prevents brute force attacks by limiting attempts per IP
 */
const authAttempts = new Map<string, { count: number; windowStart: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Constant-time password comparison to prevent timing attacks.
 * Pads both strings to the same length to avoid leaking length information.
 */
function constantTimeCompare(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length, 1);
  const bufA = Buffer.alloc(maxLen);
  const bufB = Buffer.alloc(maxLen);
  Buffer.from(a, "utf8").copy(bufA);
  Buffer.from(b, "utf8").copy(bufB);

  return timingSafeEqual(bufA, bufB) && a.length === b.length;
}

/**
 * Check if IP has exceeded rate limit
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = authAttempts.get(ip);

  if (!bucket || now - bucket.windowStart > AUTH_WINDOW_MS) {
    return false;
  }

  return bucket.count >= MAX_AUTH_ATTEMPTS;
}

/**
 * Increment failed attempt counter for IP
 */
function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const bucket = authAttempts.get(ip);

  if (!bucket || now - bucket.windowStart > AUTH_WINDOW_MS) {
    authAttempts.set(ip, { count: 1, windowStart: now });
  } else {
    bucket.count += 1;
  }
}

/**
 * Reset attempt counter on successful authentication
 */
function resetAttempts(ip: string): void {
  authAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Check rate limit BEFORE password verification (prevent timing attacks)
  if (isRateLimited(ip)) {
    SecurityLogger.logRateLimitExceeded(ip, userAgent, "/api/download-cv", {
      reason: "Too many failed authentication attempts",
      maxAttempts: MAX_AUTH_ATTEMPTS,
      windowMinutes: AUTH_WINDOW_MS / 60000,
    });

    return NextResponse.json(
      {
        error: "Too many failed attempts. Please try again in 15 minutes.",
        retryAfter: 900, // seconds
      },
      { status: 429 },
    );
  }

  // Fail closed: if CV_PASSWORD is not configured, refuse all attempts
  if (!process.env.CV_PASSWORD) {
    SecurityLogger.logAuthAttempt(
      ip,
      userAgent,
      "/api/download-cv",
      false,
      "CV_PASSWORD not configured",
    );
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 },
    );
  }

  try {
    let password = "";
    try {
      const body = await request.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "password" in body &&
        typeof body.password === "string"
      ) {
        password = body.password;
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Validate password with timing-safe comparison
    const isValid = constantTimeCompare(password, process.env.CV_PASSWORD);

    if (!isValid) {
      // Record failed attempt AFTER password check (timing-safe)
      recordFailedAttempt(ip);

      SecurityLogger.logAuthAttempt(
        ip,
        userAgent,
        "/api/download-cv",
        false,
        "Invalid password",
      );
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    // Reset rate limit counter on successful authentication
    resetAttempts(ip);

    // Log successful authentication
    SecurityLogger.logAuthAttempt(
      ip,
      userAgent,
      "/api/download-cv",
      true,
      "CV downloaded successfully",
    );

    const filePath = path.join(process.cwd(), "private", "CV.pdf");
    const file = await readFile(filePath);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=CV.pdf",
      },
    });
  } catch (error) {
    console.error("CV download error:", error);
    SecurityLogger.logDataAccess(
      ip,
      userAgent,
      "/api/download-cv",
      "POST",
      false,
      { error: error instanceof Error ? error.message : "Unknown error" },
    );
    return NextResponse.json({ error: "File not found" }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
