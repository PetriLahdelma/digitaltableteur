import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Invite tokens, session ids and one-time codes.
 *
 * Only digests are ever stored. Tokens and session ids carry 256 bits, so a
 * plain SHA-256 is enough; codes are short, so their digest is a keyed HMAC
 * bound to the invite they were issued for (ASVS 6.5.2, 6.6.2).
 */

export const CODE_DIGITS = 8; // 26.6 bits; 6 digits (19.9) would miss ASVS 6.5.4
const CODE_FORMAT = new RegExp(`^\\d{${CODE_DIGITS}}$`);

/** 256-bit random value for invite links and session cookies. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Uniform 8-digit code, leading zeros kept. */
export function generateCode(): string {
  return String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, "0");
}

export function codeDigest(code: string, boundTo: string, key: Buffer): string {
  return createHmac("sha256", key).update(`${boundTo}:${code}`, "utf8").digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

/** Constant-time check of a submitted code against the stored digest. */
export function verifyCode(code: string, boundTo: string, key: Buffer, expectedDigest: string): boolean {
  if (!CODE_FORMAT.test(code)) return false;
  return safeEqualHex(codeDigest(code, boundTo, key), expectedDigest);
}

export function normaliseEmail(email: string): string {
  return email.normalize("NFC").trim().toLowerCase();
}

/** Lookup key for an email address; the address itself is stored encrypted. */
export function emailLookupKey(email: string, key: Buffer): string {
  return createHmac("sha256", key).update(`email:${normaliseEmail(email)}`, "utf8").digest("hex");
}
