import * as Sentry from "@sentry/nextjs";
import type { Collection, Document, ObjectId } from "mongodb";

import {
  buildContactNotificationHtml,
  buildContactNotificationSubject,
  buildContactNotificationText,
  type ContactNotificationPayload,
} from "./contact-notification-email";

/** Sends after this many failed notification attempts stop (cron retries). */
export const MAX_DELIVERY_ATTEMPTS = 5;

export async function sendContactNotification(
  payload: ContactNotificationPayload,
): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.CONTACT_EMAIL_TO || "mail@digitaltableteur.com";
  const FROM =
    process.env.CONTACT_EMAIL_FROM ||
    "Digitaltableteur <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

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
      subject: buildContactNotificationSubject(payload),
      text: buildContactNotificationText(payload),
      html: buildContactNotificationHtml(payload),
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status}`);
  }
}

/**
 * Sends the owner notification for a stored submission and records the
 * outcome on it. The submission is already saved, so a failed send never
 * fails the visitor's request: it is marked failed, reported to Sentry and
 * retried by the daily cron (`/api/cron/site-retention`).
 */
export async function deliverStoredContact(
  collection: Collection<Document>,
  id: ObjectId,
  payload: ContactNotificationPayload,
): Promise<boolean> {
  try {
    await sendContactNotification(payload);
  } catch (error) {
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          emailDeliveryStatus: "failed",
          emailDeliveryError: error instanceof Error ? error.message : "Unknown",
          emailDeliveryUpdatedAt: new Date(),
        },
        $inc: { emailDeliveryAttempts: 1 },
      },
    );
    Sentry.captureException(error, { tags: { area: "contact", step: "notify" } });
    return false;
  }

  try {
    await collection.updateOne(
      { _id: id },
      {
        $set: { emailDeliveryStatus: "sent", emailDeliveryUpdatedAt: new Date() },
        $inc: { emailDeliveryAttempts: 1 },
      },
    );
  } catch (updateError) {
    console.warn(
      "Contact email status update failed:",
      updateError instanceof Error ? updateError.message : "Unknown",
    );
  }
  return true;
}
