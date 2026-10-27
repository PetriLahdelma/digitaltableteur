import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";

import { auditLog, pdfs } from "../db/schema";
import { openBytes, sealBytes } from "../security/envelope";
import type { IntakeContext } from "./context";
import { getSubmission, type SubmissionView } from "./forms";

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
  clientId: string,
  submissionId: string,
  render: PdfRenderer,
): Promise<{ bytes: Buffer; view: SubmissionView } | null> {
  const view = await getSubmission(ctx, clientId, submissionId);
  if (!view) return null;

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
  await ctx.db.insert(auditLog).values({ actor: "client", action: "pdf.download", clientId, submissionId });
  return bytes ? { bytes, view } : null;
}
