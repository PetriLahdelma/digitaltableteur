import { z } from "zod";
import type { NextRequest } from "next/server";

import { intakeCopy } from "@/app/lib/intake/copy";
import { signPrintToken } from "@/app/lib/intake/pdf/print-token";
import { renderSubmissionPdf } from "@/app/lib/intake/pdf/render";
import { requireAdmin } from "@/app/lib/intake/service/admin-http";
import { json, serverError } from "@/app/lib/intake/service/http";
import { OWNER, submissionPdf } from "@/app/lib/intake/service/pdf";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SubmissionId = z.uuid();

/** The owner's copy of any submission's PDF: the same stored file the client downloads. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  const submissionId = SubmissionId.safeParse((await params).submissionId);
  if (!submissionId.success) return json({ status: "not_found" }, 404);
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    const result = await submissionPdf(auth.ctx, OWNER, submissionId.data, (view) =>
      renderSubmissionPdf({
        origin: auth.ctx.origin,
        submissionId: view.submissionId,
        token: signPrintToken(view.submissionId, auth.ctx.hmacKey, auth.ctx.now()),
        pageLabel: intakeCopy(view.snapshot.locale)("pdfPage"),
      }),
    );
    if (!result) return json({ status: "not_found" }, 404);
    const date = result.view.submittedAt.toISOString().slice(0, 10);
    return new Response(new Uint8Array(result.bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="intake-${date}-v${result.view.version}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serverError("admin.pdf", error);
  }
}
