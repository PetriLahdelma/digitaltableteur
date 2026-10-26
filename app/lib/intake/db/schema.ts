import { sql } from "drizzle-orm";
import {
  bigserial,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { Sealed } from "../security/envelope";

/**
 * Intake database (Postgres on Neon, Frankfurt). Personal data and answers
 * are stored only as `Sealed` ciphertext or as digests; see docs/intake.
 * Rows cascade from the client, so deleting a client deletes everything
 * except audit entries, which keep ids and actions without content.
 */

const created = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const INVITE_STATUSES = ["invited", "active", "submitted", "revoked"] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

export const clients = pgTable("intake_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** HMAC of the normalised email address, for lookup without plaintext. */
  emailLookup: text("email_lookup").notNull().unique(),
  /** { email, name } sealed with aad `client:<id>`. */
  contactSealed: jsonb("contact_sealed").$type<Sealed>().notNull(),
  createdAt: created(),
});

export const invites = pgTable(
  "intake_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    questionnaireId: text("questionnaire_id").notNull(),
    questionnaireVersion: text("questionnaire_version").notNull(),
    locale: text("locale").notNull(),
    /** SHA-256 of the link token; null once the link has been redeemed. */
    tokenHash: text("token_hash").unique(),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }).notNull(),
    status: text("status").$type<InviteStatus>().notNull().default("invited"),
    createdAt: created(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    check("intake_invites_status", sql`${t.status} in ('invited', 'active', 'submitted', 'revoked')`),
    check("intake_invites_locale", sql`${t.locale} in ('en', 'fi', 'sv')`),
    index("intake_invites_client").on(t.clientId),
  ],
);

/**
 * Pending one-time codes, one per pre-auth cookie. Keyed by the cookie, not
 * the client, so a stranger who knows a client's address cannot replace or
 * lock the code the client is about to type.
 */
export const loginCodes = pgTable(
  "intake_login_codes",
  {
    /** SHA-256 of the pre-auth cookie the code is bound to (ASVS 6.6.2). */
    preauthHash: text("preauth_hash").primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    /** Invite redeemed by this code, when it was sent from an invite link. */
    inviteId: uuid("invite_id").references(() => invites.id, { onDelete: "cascade" }),
    digest: text("digest").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: created(),
  },
  (t) => [check("intake_login_codes_attempts", sql`${t.attempts} >= 0`), index("intake_login_codes_client").on(t.clientId)],
);

export const SESSION_KINDS = ["client", "admin"] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export const sessions = pgTable(
  "intake_sessions",
  {
    /** SHA-256 of the cookie value. */
    idHash: text("id_hash").primaryKey(),
    kind: text("kind").$type<SessionKind>().notNull(),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
    createdAt: created(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    check("intake_sessions_kind", sql`${t.kind} in ('client', 'admin')`),
    check("intake_sessions_owner", sql`(${t.kind} = 'admin') = (${t.clientId} is null)`),
    index("intake_sessions_client").on(t.clientId),
  ],
);

export const drafts = pgTable("intake_drafts", {
  inviteId: uuid("invite_id")
    .primaryKey()
    .references(() => invites.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull().default(0),
  /** Answers sealed with aad `draft:<inviteId>`. */
  answersSealed: jsonb("answers_sealed").$type<Sealed>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const submissions = pgTable(
  "intake_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inviteId: uuid("invite_id")
      .notNull()
      .references(() => invites.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    questionnaireId: text("questionnaire_id").notNull(),
    questionnaireVersion: text("questionnaire_version").notNull(),
    locale: text("locale").notNull(),
    /** Snapshot sealed with aad `submission:<id>`. */
    snapshotSealed: jsonb("snapshot_sealed").$type<Sealed>().notNull(),
    snapshotDigest: text("snapshot_digest").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
    deleteAfter: timestamp("delete_after", { withTimezone: true }).notNull(),
  },
  (t) => [uniqueIndex("intake_submissions_invite").on(t.inviteId), index("intake_submissions_client").on(t.clientId)],
);

export const pdfs = pgTable("intake_pdfs", {
  submissionId: uuid("submission_id")
    .primaryKey()
    .references(() => submissions.id, { onDelete: "cascade" }),
  /** PDF bytes sealed with aad `pdf:<submissionId>`. */
  pdfSealed: jsonb("pdf_sealed").$type<Sealed>().notNull(),
  pdfDigest: text("pdf_digest").notNull(),
  byteLength: integer("byte_length").notNull(),
  renderedAt: timestamp("rendered_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("intake_rate_limits", {
  /** `<scope>:<hashed key>`, never a raw IP or email. */
  bucket: text("bucket").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export const AUDIT_ACTORS = ["owner", "client", "system"] as const;
export type AuditActor = (typeof AUDIT_ACTORS)[number];

/** Append-only. No foreign keys, so entries outlive the rows they describe. */
export const auditLog = pgTable(
  "intake_audit_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actor: text("actor").$type<AuditActor>().notNull(),
    action: text("action").notNull(),
    clientId: uuid("client_id"),
    inviteId: uuid("invite_id"),
    submissionId: uuid("submission_id"),
    /** Digests and counts only, never answer content or contact details. */
    detail: jsonb("detail").$type<Record<string, string | number | boolean>>(),
  },
  (t) => [check("intake_audit_actor", sql`${t.actor} in ('owner', 'client', 'system')`), index("intake_audit_at").on(t.at)],
);
