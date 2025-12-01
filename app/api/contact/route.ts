import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { z } from "zod";

// Simple in-memory rate limiter (best-effort; serverless cold starts reset this)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // requests per window per IP
const buckets = new Map<string, { count: number; windowStart: number }>();

const contactSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional().nullable(),
  interest: z.string().max(500).optional().nullable(),
  message: z.string().min(5).max(5000),
  hearAbout: z.string().max(200).optional().nullable(),
  attachmentName: z.string().max(255).optional().nullable(),
  attachmentType: z.string().max(255).optional().nullable(),
  attachmentSize: z.number().int().nonnegative().optional().nullable(),
  attachmentData: z.string().max(5_000_000).optional().nullable(), // base64 payload if included
  attachmentNotice: z.string().max(2000).optional().nullable(),
  time: z.string().max(200).optional().nullable(),
});

function rateLimit(key: string) {
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

async function sendEmailViaResend(payload: {
  name: string;
  email: string;
  phone?: string | null;
  interest?: string | null;
  message: string;
  hearAbout?: string | null;
  time?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentData?: string | null;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.CONTACT_EMAIL_TO || "mail@digitaltableteur.com";
  const FROM =
    process.env.CONTACT_EMAIL_FROM ||
    "Digitaltableteur <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const subject = `New contact form submission from ${payload.name}`;
  const textLines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.interest ? `Interest: ${payload.interest}` : null,
    payload.hearAbout ? `Hear about: ${payload.hearAbout}` : null,
    payload.time ? `Time: ${payload.time}` : null,
    "",
    "Message:",
    payload.message,
  ].filter(Boolean);

  const attachments = [];
  if (payload.attachmentData && payload.attachmentName) {
    const parts = payload.attachmentData.split(",");
    const base64Content = parts.length > 1 ? parts[1] : parts[0];
    attachments.push({
      filename: payload.attachmentName,
      content: base64Content,
      contentType: payload.attachmentType || undefined,
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject,
      text: textLines.join("\n"),
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed: ${res.status} ${body}`);
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let parsed;
  try {
    const body = await req.json();
    parsed = contactSchema.parse(body);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => i.message).join(", ")
        : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 },
    );
  }

  const client = new MongoClient(uri);
  try {
    // Send email first; if this fails, return 500 so the client shows an error.
    await sendEmailViaResend(parsed);

    await client.connect();
    const db = client.db(dbName);
    const contacts = db.collection("contacts");
    await contacts.insertOne({
      ...parsed,
      source: "contact-form",
      createdAt: new Date(),
      ip,
    });
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Contact handler failed:", err);
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
