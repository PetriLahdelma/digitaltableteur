import { createHash, randomBytes } from "node:crypto";

import type { Db } from "mongodb";

import { getSiteUrl } from "./siteUrl";

/**
 * Erasure by email, proven by a link sent to that address. A request only
 * creates a one-time token and mails it; nothing is deleted until the token
 * comes back. Tokens are stored as SHA-256 hashes and expire after 24 hours.
 */

export const DELETION_LINK_HOURS = 24;
export const DELETION_PAGE_PATH = "/privacy-policy/delete";

/** Email equality ignoring case, for every lookup and delete by address. */
export const EMAIL_COLLATION = { locale: "en", strength: 2 } as const;

/** Collections that hold personal data keyed by the visitor's email. */
const ERASABLE_COLLECTIONS = ["contacts", "donny_leads"] as const;

/** Audit records prove the request was honoured; kept 12 months. */
const DELETION_AUDIT_TTL_SECONDS = 60 * 60 * 24 * 365;

export type DeletionLocale = "en" | "fi" | "sv";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Truncate an IP to network granularity (IPv4 /24, IPv6 /48-ish). */
export function anonymizeIp(ip: string): string {
  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 3).join(":")}::`;
  }
  const parts = ip.split(".");
  return parts.length === 4 ? `${parts.slice(0, 3).join(".")}.0` : "unknown";
}

export function hashDeletionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

let tokenTtlIndexEnsured: Promise<unknown> | null = null;
let auditTtlIndexEnsured: Promise<unknown> | null = null;

function ensureTokenIndexes(db: Db) {
  tokenTtlIndexEnsured ??= db
    .collection("deletion_tokens")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    .catch((error) => {
      console.error("deletion_tokens TTL index error:", error);
      tokenTtlIndexEnsured = null;
    });
  return tokenTtlIndexEnsured;
}

function ensureAuditIndex(db: Db) {
  auditTtlIndexEnsured ??= db
    .collection("deletion_requests")
    .createIndex({ requestedAt: 1 }, { expireAfterSeconds: DELETION_AUDIT_TTL_SECONDS })
    .catch((error) => {
      console.error("deletion_requests TTL index error:", error);
      auditTtlIndexEnsured = null;
    });
  return auditTtlIndexEnsured;
}

/** True when any erasable collection holds data for the address. */
export async function hasStoredData(db: Db, email: string): Promise<boolean> {
  for (const name of ERASABLE_COLLECTIONS) {
    const found = await db
      .collection(name)
      .findOne({ email }, { collation: EMAIL_COLLATION, projection: { _id: 1 } });
    if (found) return true;
  }
  return false;
}

const MAIL_COPY: Record<DeletionLocale, { subject: string; body: (link: string) => string }> = {
  en: {
    subject: "Confirm the deletion of your data",
    body: (link) =>
      [
        "Someone asked to delete the data Digitaltableteur holds for this email address: contact form messages and chat details.",
        "",
        `To delete it, open this link and confirm. The link works for ${DELETION_LINK_HOURS} hours and only once:`,
        link,
        "",
        "If you did not ask for this, ignore this email. Nothing is deleted without your confirmation.",
        "",
        "Digitaltableteur",
      ].join("\n"),
  },
  fi: {
    subject: "Vahvista tietojesi poistaminen",
    body: (link) =>
      [
        "Tähän sähköpostiosoitteeseen liittyvien tietojen poistamista on pyydetty: yhteydenottolomakkeen viestit ja chatin tiedot.",
        "",
        `Poista tiedot avaamalla tämä linkki ja vahvistamalla poisto. Linkki toimii ${DELETION_LINK_HOURS} tuntia ja vain kerran:`,
        link,
        "",
        "Jos et pyytänyt tätä, voit jättää viestin huomiotta. Mitään ei poisteta ilman vahvistustasi.",
        "",
        "Digitaltableteur",
      ].join("\n"),
  },
  sv: {
    subject: "Bekräfta raderingen av dina uppgifter",
    body: (link) =>
      [
        "Någon har bett om att få radera de uppgifter Digitaltableteur har för den här e-postadressen: meddelanden från kontaktformuläret och chattuppgifter.",
        "",
        `Öppna länken och bekräfta för att radera dem. Länken fungerar i ${DELETION_LINK_HOURS} timmar och bara en gång:`,
        link,
        "",
        "Om du inte bad om detta kan du ignorera meddelandet. Inget raderas utan din bekräftelse.",
        "",
        "Digitaltableteur",
      ].join("\n"),
  },
};

async function sendDeletionLink(to: string, link: string, locale: DeletionLocale) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM =
    process.env.CONTACT_EMAIL_FROM || "Digitaltableteur <onboarding@resend.dev>";
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const copy = MAIL_COPY[locale];
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject: copy.subject, text: copy.body(link) }),
  });
  if (!res.ok) throw new Error(`Resend send failed: ${res.status}`);
}

/**
 * Runs after the response (see the route): mails a confirmation link only
 * when data exists for the address, so the endpoint cannot be used to mail
 * arbitrary addresses and the response never reveals whether data exists.
 * The link is always built on the canonical site origin, never the request
 * host. The token rides in the URL fragment so it never reaches server logs.
 */
export async function issueDeletionLink(
  db: Db,
  email: string,
  locale: DeletionLocale,
  now: Date = new Date(),
): Promise<boolean> {
  if (!(await hasStoredData(db, email))) return false;
  await ensureTokenIndexes(db);
  const token = randomBytes(32).toString("base64url");
  await db.collection("deletion_tokens").insertOne({
    tokenHash: hashDeletionToken(token),
    email,
    createdAt: now,
    expiresAt: new Date(now.getTime() + DELETION_LINK_HOURS * 60 * 60 * 1000),
  });
  const link = `${getSiteUrl()}${DELETION_PAGE_PATH}#t=${token}`;
  await sendDeletionLink(email, link, locale);
  return true;
}

export type DeletionOutcome =
  | Readonly<{ status: "deleted"; deletedCount: number }>
  | Readonly<{ status: "invalid" }>;

/**
 * Spends the token (once, atomically) and deletes every record for its
 * address, ignoring case. The audit record keeps the address for 12 months
 * as proof the request was honoured (Art. 5(2)).
 */
export async function confirmDeletion(
  db: Db,
  token: string,
  requestIp: string,
  now: Date = new Date(),
): Promise<DeletionOutcome> {
  const spent = await db
    .collection("deletion_tokens")
    .findOneAndDelete({ tokenHash: hashDeletionToken(token), expiresAt: { $gt: now } });
  if (!spent) return { status: "invalid" };
  const email = String(spent.email);

  let deletedCount = 0;
  for (const name of ERASABLE_COLLECTIONS) {
    const result = await db.collection(name).deleteMany({ email }, { collation: EMAIL_COLLATION });
    deletedCount += result.deletedCount;
  }
  // Other pending links for the same address are now pointless.
  await db.collection("deletion_tokens").deleteMany({ email });

  await ensureAuditIndex(db);
  await db.collection("deletion_requests").insertOne({
    email,
    reason: "User request (confirmed by email link)",
    requestedAt: now,
    requestIp,
    deletedCount,
    status: "completed",
  });

  return { status: "deleted", deletedCount };
}
