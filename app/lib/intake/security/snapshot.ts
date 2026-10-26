import { createHash } from "node:crypto";

/**
 * Canonical JSON for submission snapshots: object keys sorted, strings in
 * Unicode NFC, undefined dropped. Equal answers always hash the same, so the
 * digest printed on the PDF and stored in the audit log can be re-verified.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalise(value));
}

function canonicalise(value: unknown): unknown {
  if (typeof value === "string") return value.normalize("NFC");
  if (Array.isArray(value)) return value.map(canonicalise);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key.normalize("NFC"), canonicalise(entry)] as const)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  }
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Non-finite number in snapshot");
  return value;
}

export function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

export function snapshotDigest(snapshot: unknown): string {
  return sha256Hex(canonicalJson(snapshot));
}
