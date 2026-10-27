import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import type { NextRequest } from "next/server";

import { intakeCopy, isEnabledLocale } from "@/app/lib/intake/copy";
import { signPrintToken } from "@/app/lib/intake/pdf/print-token";
import { renderSubmissionPdf } from "@/app/lib/intake/pdf/render";
import { deliverAfterResponse } from "@/app/lib/intake/service/deliver";
import { submitIntake } from "@/app/lib/intake/service/forms";
import { json, readJsonBody, serverError } from "@/app/lib/intake/service/http";
import { OWNER, submissionPdf } from "@/app/lib/intake/service/pdf";
import { currentClient } from "@/app/lib/intake/service/session";
import type { IntakeLocale } from "@/app/lib/intake/types";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";
// The owner's copy renders the PDF after the response (headless Chromium).
export const maxDuration = 60;

// locale: the language on screen at submit; the receipt and the PDF follow it.
const Body = z.object({ revision: z.number().int().min(0), locale: z.string().refine(isEnabledLocale).optional() }).strict();
const InviteId = z.uuid();

/** Freezes the saved draft. The answers submitted are the ones the server already holds. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const read = await readJsonBody(request);
  if (!read.ok) return read.response;
  const inviteId = InviteId.safeParse((await params).inviteId);
  const body = Body.safeParse(read.body);
  if (!inviteId.success) return json({ status: "not_found" }, 404);
  if (!body.success) return json({ status: "conflict" }, 409);
  try {
    const { ctx, session } = await currentClient();
    if (!session) return json({ status: "signed_out" }, 401);
    const result = await submitIntake(ctx, session.clientId, inviteId.data, body.data.revision, body.data.locale as IntakeLocale | undefined);
    if (result.status === "submitted") {
      deliverAfterResponse(result.mail, "forms.submit");
      // The owner's copy: every answer, plus the PDF (rendered once and stored,
      // the same file the client and admin download). If rendering fails the
      // mail still goes, with every answer and a pointer to admin.
      deliverAfterResponse(async () => {
        try {
          const pdf = await submissionPdf(
            ctx,
            OWNER,
            result.submissionId,
            (view) =>
              renderSubmissionPdf({
                origin: ctx.origin,
                submissionId: view.submissionId,
                token: signPrintToken(view.submissionId, ctx.hmacKey, ctx.now()),
                pageLabel: intakeCopy(view.snapshot.locale)("pdfPage"),
              }),
            "mail",
          );
          return result.ownerMail(pdf ? { filename: result.pdfFilename, bytes: pdf.bytes } : null);
        } catch (error) {
          Sentry.captureMessage(`[intake] forms.submit.owner pdf failed: ${error instanceof Error ? error.name : "unknown error"}`, {
            level: "error",
            tags: { area: "intake", route: "forms.submit.owner", kind: "pdf" },
          });
          return result.ownerMail(null);
        }
      }, "forms.submit.owner");
      return json({ status: "submitted", submissionId: result.submissionId });
    }
    const status = { conflict: 409, not_found: 404, incomplete: 422 }[result.status];
    return json(result, status);
  } catch (error) {
    return serverError("forms.submit", error);
  }
}
