import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";

import { auditLog, pdfs } from "../db/schema";
import { openBytes, sealBytes } from "../security/envelope";
import type { IntakeContext } from "./context";
import { getSubmission, getSubmissionForPrint, type SubmissionView } from "./forms";

/** The owner's scope for submissionPdf: any submission, from admin. */
export const OWNER = "owner";

export const pdfAad = (submissionId: string) => `pdf:${submissionId}`;

/** Renders one submission to PDF bytes (the headless print in production, a stub in tests). */
export type PdfRenderer = (view: SubmissionView) => Promise<Buffer>;

/**
 * The client's PDF of their own submission. Rendered once, on the first
 * download, from the immutable snapshot, then stored encrypted with its
 * SHA-256; every later download serves those same bytes. Null when the
 * submission is not this client's or has passed its retention.
 */
export async function submissionPdf(
  ctx: IntakeContext,
  /** A client id (their own submissions only), or "owner" from admin. */
  scope: string,
  submissionId: string,
  render: PdfRenderer,
): Promise<{ bytes: Buffer; view: SubmissionView } | null> {
  const view = scope === OWNER ? await getSubmissionForPrint(ctx, submissionId) : await getSubmission(ctx, scope, submissionId);
  if (!view) return null;
  const clientId = view.clientId;

  const stored = async () => {
    const [row] = await ctx.db.select().from(pdfs).where(eq(pdfs.submissionId, submissionId));
    return row ? openBytes(row.pdfSealed, ctx.ring, pdfAad(submissionId)) : null;
  };

  let bytes = await stored();
  if (!bytes) {
    const rendered = await render(view);
    const digest = createHash("sha256").update(rendered).digest("hex");
    const inserted = await ctx.db
      .insert(pdfs)
      .values({
        submissionId,
        pdfSealed: sealBytes(rendered, ctx.ring, pdfAad(submissionId)),
        pdfDigest: digest,
        byteLength: rendered.length,
        renderedAt: ctx.now(),
      })
      .onConflictDoNothing()
      .returning({ submissionId: pdfs.submissionId });
    if (inserted.length === 1) {
      await ctx.db.insert(auditLog).values({ actor: "system", action: "pdf.render", clientId, submissionId, detail: { digest, bytes: rendered.length } });
      bytes = rendered;
    } else {
      // Another request rendered it first: serve that one, so there is only ever one PDF.
      bytes = await stored();
    }
  }
  await ctx.db.insert(auditLog).values({ actor: scope === OWNER ? "owner" : "client", action: "pdf.download", clientId, submissionId });
  return bytes ? { bytes, view } : null;
}
