import { createHmac } from "node:crypto";

import { safeEqualHex } from "../security/tokens";

/** Long enough for one headless render, short enough to be useless if it leaks. */
export const PRINT_TOKEN_TTL_MS = 60_000;

/** Header the renderer sends to the print page; headers stay out of request logs, unlike query strings. */
export const PRINT_TOKEN_HEADER = "x-intake-print";

function mac(submissionId: string, expiresAt: number, key: Buffer): string {
  return createHmac("sha256", key).update(`print:${submissionId}:${expiresAt}`).digest("hex");
}

/** Authorises one render of one submission's print page, for a minute. */
export function signPrintToken(submissionId: string, key: Buffer, now: Date): string {
  const expiresAt = now.getTime() + PRINT_TOKEN_TTL_MS;
  return `${expiresAt}.${mac(submissionId, expiresAt, key)}`;
}

export function verifyPrintToken(token: string | null | undefined, submissionId: string, key: Buffer, now: Date): boolean {
  const [expires, signature] = (token ?? "").split(".");
  const expiresAt = Number(expires);
  if (!signature || !Number.isSafeInteger(expiresAt) || expiresAt < now.getTime()) return false;
  if (expiresAt > now.getTime() + PRINT_TOKEN_TTL_MS) return false;
  return safeEqualHex(signature, mac(submissionId, expiresAt, key));
}
