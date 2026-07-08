import { NextRequest, NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import { getDatabase } from "../../lib/mongodb";
import { z } from "zod";
import { createCorsHeaders } from "../chat-shared";
import {
  buildContactNotificationHtml,
  buildContactNotificationSubject,
  buildContactNotificationText,
  type ContactNotificationPayload,
} from "../../lib/contact-notification-email";
import { checkRateLimit } from "../../lib/rate-limit";
import { getClientIp, getUserAgent } from "../../lib/security-logger";

const RATE_LIMIT_WINDOW_MS = 900_000; // 15 minutes
const RATE_LIMIT_MAX = 3; // requests per window per IP

const contactSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional().nullable(),
  interest: z.string().max(500).optional().nullable(),
  message: z.string().min(5).max(5000),
  hearAbout: z.string().max(200).optional().nullable(),
  budget: z.string().max(100).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  inspiration: z.string().max(2000).optional().nullable(),
  attachmentName: z.string().max(255).optional().nullable(),
  attachmentType: z.string().max(255).optional().nullable(),
  attachmentSize: z.number().int().nonnegative().optional().nullable(),
  attachmentData: z.string().max(5_000_000).optional().nullable(), // base64 payload if included
  attachmentNotice: z.string().max(2000).optional().nullable(),
  followUpPreferences: z.string().max(500).optional().nullable(),
  requestPortfolioMaterials: z.boolean().optional().nullable(),
  time: z.string().max(200).optional().nullable(),
});

async function sendEmailViaResend(payload: ContactNotificationPayload) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.CONTACT_EMAIL_TO || "mail@digitaltableteur.com";
  const FROM =
    process.env.CONTACT_EMAIL_FROM ||
    "Digitaltableteur <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const subject = buildContactNotificationSubject(payload);
  const text = buildContactNotificationText(payload);
  const html = buildContactNotificationHtml(payload);

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
      reply_to: payload.email,
      subject,
      text,
      html,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status}`);
  }
}

export async function POST(req: NextRequest) {
  const corsHeaders = createCorsHeaders(req.headers.get("origin"));
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);

  const rateLimitResult = await checkRateLimit({
    scope: "contact",
    key: ip,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    failureMode: "block",
  });

  if (rateLimitResult.limited) {
    return NextResponse.json(
      {
        error:
          "Too many contact form submissions. Please try again in 15 minutes.",
      },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
        },
      },
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
    return NextResponse.json(
      { error: message },
      { status: 400, headers: corsHeaders },
    );
  }

  // Sanitize all inputs to prevent NoSQL injection
  const sanitizedParsed = {
    name: sanitize(parsed.name),
    email: sanitize(parsed.email),
    phone: parsed.phone ? sanitize(parsed.phone) : null,
    interest: parsed.interest ? sanitize(parsed.interest) : null,
    message: sanitize(parsed.message),
    hearAbout: parsed.hearAbout ? sanitize(parsed.hearAbout) : null,
    budget: parsed.budget ? sanitize(parsed.budget) : null,
    timeline: parsed.timeline ? sanitize(parsed.timeline) : null,
    inspiration: parsed.inspiration ? sanitize(parsed.inspiration) : null,
    time: parsed.time ? sanitize(parsed.time) : null,
    attachmentName: parsed.attachmentName ? sanitize(parsed.attachmentName) : null,
    attachmentType: parsed.attachmentType ? sanitize(parsed.attachmentType) : null,
    attachmentData: parsed.attachmentData,
    attachmentSize:
      typeof parsed.attachmentSize === "number" ? parsed.attachmentSize : null,
    attachmentNotice: parsed.attachmentNotice
      ? sanitize(parsed.attachmentNotice)
      : null,
    followUpPreferences: parsed.followUpPreferences
      ? sanitize(parsed.followUpPreferences)
      : null,
    requestPortfolioMaterials: parsed.requestPortfolioMaterials === true,
  };

  try {
    const db = await getDatabase();
    const collection = db.collection("contacts");

    const insertResult = await collection.insertOne({
      ...sanitizedParsed,
      submittedFrom: ip,
      userAgent,
      emailDeliveryStatus: "pending",
      createdAt: new Date(),
    });

    try {
      await sendEmailViaResend(sanitizedParsed);
    } catch (emailError) {
      await collection.updateOne(
        { _id: insertResult.insertedId },
        {
          $set: {
            emailDeliveryStatus: "failed",
            emailDeliveryError:
              emailError instanceof Error ? emailError.message : "Unknown",
            emailDeliveryUpdatedAt: new Date(),
          },
        },
      );
      throw emailError;
    }

    try {
      await collection.updateOne(
        { _id: insertResult.insertedId },
        {
          $set: {
            emailDeliveryStatus: "sent",
            emailDeliveryUpdatedAt: new Date(),
          },
        },
      );
    } catch (updateError) {
      console.warn(
        "Contact email status update failed:",
        updateError instanceof Error ? updateError.message : "Unknown",
      );
    }

    return NextResponse.json(
      { status: "ok" },
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error(
      "Contact handler failed:",
      err instanceof Error ? err.message : "Unknown",
    );
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function OPTIONS(request: Request) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
