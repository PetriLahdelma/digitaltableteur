import { z } from "zod";
import type { NextRequest } from "next/server";

import { intakeCopy } from "@/app/lib/intake/copy";
import { signPrintToken } from "@/app/lib/intake/pdf/print-token";
import { renderSubmissionPdf } from "@/app/lib/intake/pdf/render";
import { json, serverError } from "@/app/lib/intake/service/http";
import { submissionPdf } from "@/app/lib/intake/service/pdf";
import { currentClient } from "@/app/lib/intake/service/session";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";
// A cold headless Chromium plus one render.
export const maxDuration = 60;

const SubmissionId = z.uuid();

/** The signed-in client's PDF of their own submission, as a download. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  const submissionId = SubmissionId.safeParse((await params).submissionId);
  if (!submissionId.success) return json({ status: "not_found" }, 404);
  try {
    const { ctx, session } = await currentClient();
    if (!session) return json({ status: "signed_out" }, 401);
    const result = await submissionPdf(ctx, { clientId: session.clientId }, submissionId.data, (view) =>
      renderSubmissionPdf({
        origin: ctx.origin,
        submissionId: view.submissionId,
        token: signPrintToken(view.submissionId, ctx.hmacKey, ctx.now()),
        pageLabel: intakeCopy(view.snapshot.locale)("pdfPage"),
      }),
    );
    if (!result) return json({ status: "not_found" }, 404);
    const date = result.view.submittedAt.toISOString().slice(0, 10);
    return new Response(new Uint8Array(result.bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="digitaltableteur-intake-${date}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serverError("submissions.pdf", error);
  }
}
