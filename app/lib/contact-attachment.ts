import { CONTACT_ATTACHMENT_MAX_BYTES } from "@/nextjs-app/shared/components/contactFormUtils";

/**
 * Server-side check for the contact form's optional attachment. The form
 * limits the picker to PDF, PNG and JPEG under 2 MB, but any client can post
 * the JSON directly, so the route re-checks everything here and replaces the
 * client's declared type and size with what the bytes actually are.
 */

type AttachmentKind = { mime: string; extensions: readonly string[]; magic: readonly number[] };

const KINDS: readonly AttachmentKind[] = [
  { mime: "application/pdf", extensions: [".pdf"], magic: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { mime: "image/png", extensions: [".png"], magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/jpeg", extensions: [".jpg", ".jpeg"], magic: [0xff, 0xd8, 0xff] },
];

/** Upper bound on the base64 text for a file at the byte limit. */
export const CONTACT_ATTACHMENT_MAX_BASE64_CHARS =
  Math.ceil(CONTACT_ATTACHMENT_MAX_BYTES / 3) * 4;

const DATA_URL = /^data:([a-z]*\/?[a-z0-9.+-]*);base64,([A-Za-z0-9+/]+={0,2})$/;

export type ContactAttachmentInput = {
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentData?: string | null;
};

export type CheckedAttachment = {
  name: string;
  type: string;
  size: number;
  data: string;
};

export type AttachmentCheck =
  | { ok: true; attachment: CheckedAttachment | null }
  | { ok: false; reason: string };

function cleanFileName(name: string): string {
  // Keep the base name only and drop control characters, so the name cannot
  // carry a path or break the email header it ends up in.
  const base = name.split(/[\\/]/).pop() ?? "";
  const printable = Array.from(base)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 0x20 && code !== 0x7f && char !== "\"";
    })
    .join("");
  return printable.trim().slice(0, 255);
}

export function checkContactAttachment(input: ContactAttachmentInput): AttachmentCheck {
  const data = input.attachmentData;
  if (!data) return { ok: true, attachment: null };

  const match = DATA_URL.exec(data);
  if (!match) return { ok: false, reason: "Attachment is not a valid file" };
  // The declared type is not trusted (browsers send an empty or generic
  // type for some files); the bytes decide.
  const base64 = match[2];

  if (base64.length > CONTACT_ATTACHMENT_MAX_BASE64_CHARS) {
    return { ok: false, reason: "Attachment is too large" };
  }
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0) return { ok: false, reason: "Attachment is empty" };
  if (bytes.length > CONTACT_ATTACHMENT_MAX_BYTES) {
    return { ok: false, reason: "Attachment is too large" };
  }

  const kind = KINDS.find((candidate) =>
    candidate.magic.every((byte, index) => bytes[index] === byte),
  );
  if (!kind) return { ok: false, reason: "Attachment must be a PDF, PNG or JPEG file" };
  const name = cleanFileName(input.attachmentName ?? "");
  const lowerName = name.toLowerCase();
  if (!name || !kind.extensions.some((extension) => lowerName.endsWith(extension))) {
    return { ok: false, reason: "Attachment name does not match its type" };
  }

  return {
    ok: true,
    attachment: { name, type: kind.mime, size: bytes.length, data },
  };
}
