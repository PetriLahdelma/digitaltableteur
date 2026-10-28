import { NextRequest, NextResponse } from "next/server";
import sanitize from "mongo-sanitize";
import type { Collection, Document, ObjectId } from "mongodb";
import { getDatabase } from "../../lib/mongodb";
import { z } from "zod";
import { createCorsHeaders } from "../chat-shared";
import {
  CONTACT_ATTACHMENT_MAX_BASE64_CHARS,
  checkContactAttachment,
} from "../../lib/contact-attachment";
import { deliverStoredContact } from "../../lib/contact-delivery";
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
  engagementPackage: z.string().max(200).optional().nullable(),
  inspiration: z.string().max(2000).optional().nullable(),
  orgStage: z.string().max(100).optional().nullable(),
  whyUs: z.string().max(2000).optional().nullable(),
  attachmentName: z.string().max(255).optional().nullable(),
  attachmentType: z.string().max(255).optional().nullable(),
  attachmentSize: z.number().int().nonnegative().optional().nullable(),
  // data: URL; checkContactAttachment verifies size, type and name.
  attachmentData: z
    .string()
    .max(CONTACT_ATTACHMENT_MAX_BASE64_CHARS + 100)
    .optional()
    .nullable(),
  attachmentNotice: z.string().max(2000).optional().nullable(),
  followUpPreferences: z.string().max(500).optional().nullable(),
  requestPortfolioMaterials: z.boolean().optional().nullable(),
  time: z.string().max(200).optional().nullable(),
  // One id per form fill, sent again on a retry, so a retried submit
  // finds the stored record instead of inserting a duplicate.
  submissionId: z.string().uuid().optional().nullable(),
});

let submissionIdIndexEnsured: Promise<unknown> | null = null;

function ensureSubmissionIdIndex(collection: Collection<Document>) {
  submissionIdIndexEnsured ??= collection
    .createIndex(
      { submissionId: 1 },
      {
        unique: true,
        partialFilterExpression: { submissionId: { $type: "string" } },
      },
    )
    .catch((indexError) => {
      console.error("contacts submissionId index error:", indexError);
      submissionIdIndexEnsured = null;
    });
  return submissionIdIndexEnsured;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === 11000
  );
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

  const attachmentCheck = checkContactAttachment(parsed);
  if (!attachmentCheck.ok) {
    return NextResponse.json(
      { error: attachmentCheck.reason },
      { status: 400, headers: corsHeaders },
    );
  }
  const attachment = attachmentCheck.attachment;

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
    engagementPackage: parsed.engagementPackage
      ? sanitize(parsed.engagementPackage)
      : null,
    inspiration: parsed.inspiration ? sanitize(parsed.inspiration) : null,
    orgStage: parsed.orgStage ? sanitize(parsed.orgStage) : null,
    whyUs: parsed.whyUs ? sanitize(parsed.whyUs) : null,
    time: parsed.time ? sanitize(parsed.time) : null,
    attachmentName: attachment
      ? sanitize(attachment.name)
      : parsed.attachmentName
        ? sanitize(parsed.attachmentName)
        : null,
    attachmentType: attachment
      ? attachment.type
      : parsed.attachmentType
        ? sanitize(parsed.attachmentType)
        : null,
    attachmentData: attachment?.data ?? null,
    attachmentSize: attachment
      ? attachment.size
      : typeof parsed.attachmentSize === "number"
        ? parsed.attachmentSize
        : null,
    attachmentNotice: parsed.attachmentNotice
      ? sanitize(parsed.attachmentNotice)
      : null,
    followUpPreferences: parsed.followUpPreferences
      ? sanitize(parsed.followUpPreferences)
      : null,
    requestPortfolioMaterials: parsed.requestPortfolioMaterials === true,
  };

  const submissionId = parsed.submissionId ?? null;

  try {
    const db = await getDatabase();
    const collection = db.collection("contacts");
    if (submissionId) await ensureSubmissionIdIndex(collection);

    let id: ObjectId;
    try {
      const insertResult = await collection.insertOne({
        ...sanitizedParsed,
        ...(submissionId ? { submissionId } : {}),
        submittedFrom: ip,
        userAgent,
        emailDeliveryStatus: "pending",
        emailDeliveryAttempts: 0,
        createdAt: new Date(),
      });
      id = insertResult.insertedId;
    } catch (insertError) {
      if (!submissionId || !isDuplicateKeyError(insertError)) throw insertError;
      // A retry of a submission that is already stored: never insert it
      // twice, only finish the notification if it has not gone out yet.
      const existing = await collection.findOne(
        { submissionId },
        { projection: { _id: 1, emailDeliveryStatus: 1 } },
      );
      if (!existing) throw insertError;
      if (existing.emailDeliveryStatus !== "failed") {
        // Sent, or still pending from the first attempt (the cron picks up
        // a pending record that never finished).
        const sent = existing.emailDeliveryStatus === "sent";
        return NextResponse.json(
          { status: sent ? "ok" : "accepted" },
          { status: sent ? 200 : 202, headers: corsHeaders },
        );
      }
      id = existing._id;
    }

    // The submission is saved, so the visitor gets a success either way. A
    // failed notification is marked, reported and retried by the daily cron.
    const delivered = await deliverStoredContact(collection, id, sanitizedParsed);

    return NextResponse.json(
      { status: delivered ? "ok" : "accepted" },
      { status: delivered ? 200 : 202, headers: corsHeaders },
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
