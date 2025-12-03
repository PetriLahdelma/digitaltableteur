import { NextRequest, NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import { getDatabase } from "../../lib/mongodb";
import {
  SecurityLogger,
  getClientIp,
  getUserAgent,
} from "../../lib/security-logger";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();

    // Sanitize all inputs to prevent NoSQL injection
    const name = body.name ? sanitize(body.name) : null;
    const email = body.email ? sanitize(body.email) : null;
    const phone = body.phone ? sanitize(body.phone) : null;
    const interest = body.interest ? sanitize(body.interest) : null;
    const message = body.message ? sanitize(body.message) : null;
    const time = body.time ? sanitize(body.time) : null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !emailRegex.test(email)) {
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
        { error: err instanceof Error ? err.message : "Database error" },
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
