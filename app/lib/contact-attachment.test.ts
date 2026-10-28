import { describe, expect, it } from "vitest";

import { CONTACT_ATTACHMENT_MAX_BYTES } from "@/nextjs-app/shared/components/contactFormUtils";
import { checkContactAttachment } from "./contact-attachment";

const dataUrl = (bytes: Buffer, mime = "application/pdf") =>
  `data:${mime};base64,${bytes.toString("base64")}`;

const PDF = Buffer.from("%PDF-1.7 body");
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);

describe("checkContactAttachment", () => {
  it("passes when there is no attachment", () => {
    expect(checkContactAttachment({})).toEqual({ ok: true, attachment: null });
  });

  it("accepts PDF, PNG and JPEG by their bytes", () => {
    expect(checkContactAttachment({ attachmentName: "a.pdf", attachmentData: dataUrl(PDF) })).toMatchObject({
      ok: true,
      attachment: { type: "application/pdf", size: PDF.length },
    });
    expect(
      checkContactAttachment({ attachmentName: "a.png", attachmentData: dataUrl(PNG, "image/png") }),
    ).toMatchObject({ ok: true, attachment: { type: "image/png" } });
    expect(
      checkContactAttachment({ attachmentName: "a.jpeg", attachmentData: dataUrl(JPEG, "") }),
    ).toMatchObject({ ok: true, attachment: { type: "image/jpeg" } });
  });

  it("refuses other file types even with an allowed name", () => {
    const html = Buffer.from("<html><script>alert(1)</script>");
    expect(checkContactAttachment({ attachmentName: "a.pdf", attachmentData: dataUrl(html) }).ok).toBe(false);
  });

  it("refuses a name whose extension does not match the bytes", () => {
    expect(checkContactAttachment({ attachmentName: "a.png", attachmentData: dataUrl(PDF) }).ok).toBe(false);
    expect(checkContactAttachment({ attachmentName: "", attachmentData: dataUrl(PDF) }).ok).toBe(false);
  });

  it("strips paths and control characters from the name", () => {
    const result = checkContactAttachment({ attachmentName: "C:\\x\\..\\re\u0007port.pdf", attachmentData: dataUrl(PDF) });
    expect(result).toMatchObject({ ok: true, attachment: { name: "report.pdf" } });
  });

  it("refuses data that is not a base64 data URL", () => {
    expect(checkContactAttachment({ attachmentName: "a.pdf", attachmentData: PDF.toString("base64") }).ok).toBe(false);
    expect(checkContactAttachment({ attachmentName: "a.pdf", attachmentData: "data:application/pdf;base64,%%%" }).ok).toBe(false);
  });

  it("refuses a file over the size limit", () => {
    const big = Buffer.concat([PDF, Buffer.alloc(CONTACT_ATTACHMENT_MAX_BYTES)]);
    expect(checkContactAttachment({ attachmentName: "a.pdf", attachmentData: dataUrl(big) })).toEqual({
      ok: false,
      reason: "Attachment is too large",
    });
  });
});
