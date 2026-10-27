import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseDataKeys } from "../security/keys";
import { sealJson } from "../security/envelope";
import type { IntakeDb } from "./client";
import { purgeExpired, submissionDeleteAfter } from "./retention";
import { auditLog, clients, drafts, invites, loginCodes, sessions, submissions } from "./schema";
import { createTestIntakeDb } from "./test-db";

const ring = parseDataKeys(`k1:${randomBytes(32).toString("base64")}`);
const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-01T12:00:00Z");

let db: IntakeDb;
let close: () => Promise<void>;

beforeEach(async () => {
  const test = await createTestIntakeDb();
  db = test.db;
  close = () => test.pg.close();
});
afterEach(async () => close());

async function addClient(lookup = randomBytes(8).toString("hex")) {
  const [row] = await db
    .insert(clients)
    .values({ emailLookup: lookup, contactSealed: sealJson({ email: "x@example.com", name: "X" }, ring, "client:new") })
    .returning();
  return row;
}

async function addInvite(clientId: string, overrides: Partial<typeof invites.$inferInsert> = {}) {
  const [row] = await db
    .insert(invites)
    .values({
      clientId,
      questionnaireId: "client-brand-discovery",
      questionnaireVersion: "1.0.0",
      locale: "fi",
      tokenHash: randomBytes(32).toString("hex"),
      tokenExpiresAt: new Date(now.getTime() + DAY),
      ...overrides,
    })
    .returning();
  return row;
}

describe("intake schema constraints", () => {
  it("allows one client per email lookup key", async () => {
    await addClient("same");
    await expect(addClient("same")).rejects.toThrow();
  });

  it("rejects unknown invite statuses and locales", async () => {
    const client = await addClient();
    await expect(addInvite(client.id, { status: "hacked" as never })).rejects.toThrow();
    await expect(addInvite(client.id, { locale: "de" })).rejects.toThrow();
  });

  it("allows one submission per invite", async () => {
    const client = await addClient();
    const invite = await addInvite(client.id);
    const row = {
      inviteId: invite.id,
      clientId: client.id,
      questionnaireId: invite.questionnaireId,
      questionnaireVersion: invite.questionnaireVersion,
      locale: invite.locale,
      snapshotSealed: sealJson({}, ring, "submission:x"),
      snapshotDigest: "d",
      submittedAt: now,
      deleteAfter: submissionDeleteAfter(now),
    };
    await db.insert(submissions).values(row);
    await expect(db.insert(submissions).values(row)).rejects.toThrow();
  });

  it("ties client sessions to a client and admin sessions to none", async () => {
    const client = await addClient();
    const base = { expiresAt: new Date(now.getTime() + DAY) };
    await db.insert(sessions).values({ ...base, idHash: "a", kind: "client", clientId: client.id });
    await db.insert(sessions).values({ ...base, idHash: "b", kind: "admin" });
    await expect(db.insert(sessions).values({ ...base, idHash: "c", kind: "client" })).rejects.toThrow();
    await expect(db.insert(sessions).values({ ...base, idHash: "d", kind: "admin", clientId: client.id })).rejects.toThrow();
  });

  it("cascades a client deletion to everything except the audit log", async () => {
    const client = await addClient();
    const invite = await addInvite(client.id);
    await db.insert(drafts).values({ inviteId: invite.id, answersSealed: sealJson({}, ring, `draft:${invite.id}`) });
    await db.insert(auditLog).values({ actor: "owner", action: "invite.create", inviteId: invite.id });
    await db.delete(clients).where(eq(clients.id, client.id));
    expect(await db.select().from(invites)).toHaveLength(0);
    expect(await db.select().from(drafts)).toHaveLength(0);
    expect(await db.select().from(auditLog)).toHaveLength(1);
  });
});

describe("retention purge", () => {
  it("deletes only what is past its window and logs counts", async () => {
    const keepClient = await addClient();
    const goneClient = await addClient();
    const live = await addInvite(keepClient.id, { status: "active", tokenHash: null });
    await addInvite(goneClient.id, { tokenExpiresAt: new Date(now.getTime() - DAY) }); // never redeemed

    await db.insert(drafts).values([
      { inviteId: live.id, answersSealed: sealJson({}, ring, `draft:${live.id}`), updatedAt: new Date(now.getTime() - 89 * DAY) },
    ]);
    const old = await addInvite(keepClient.id, { status: "active", tokenHash: null, createdAt: new Date(now.getTime() - 120 * DAY) });
    await db.insert(drafts).values({ inviteId: old.id, answersSealed: sealJson({}, ring, `draft:${old.id}`), updatedAt: new Date(now.getTime() - 91 * DAY) });

    const submitted = await addInvite(keepClient.id, { status: "submitted", tokenHash: null, createdAt: new Date("2025-09-20T00:00:00Z") });
    await db.insert(submissions).values({
      inviteId: submitted.id,
      clientId: keepClient.id,
      questionnaireId: "client-brand-discovery",
      questionnaireVersion: "1.0.0",
      locale: "fi",
      snapshotSealed: sealJson({}, ring, "submission:old"),
      snapshotDigest: "d",
      submittedAt: new Date("2025-10-01T00:00:00Z"),
      deleteAfter: submissionDeleteAfter(new Date("2025-10-01T00:00:00Z")),
    });
    await db.insert(loginCodes).values({ clientId: keepClient.id, preauthHash: "p", digest: "d", expiresAt: new Date(now.getTime() - 1) });
    await db.insert(sessions).values({ idHash: "old", kind: "admin", expiresAt: new Date(now.getTime() - 1) });
    await db.insert(sessions).values({ idHash: "live", kind: "admin", expiresAt: new Date(now.getTime() + DAY) });
    await db.insert(auditLog).values({ actor: "owner", action: "old", at: new Date("2025-09-01T00:00:00Z") });

    const counts = await purgeExpired(db, now);

    // Gone: the unredeemed invite, the stale draft (and then its abandoned
    // invite), the year-old submission (and then its invite).
    expect(counts).toEqual({ codes: 1, sessions: 1, rateLimits: 0, adminChallenges: 0, adminEnrolments: 0, drafts: 1, submissions: 1, invites: 3, clients: 1, auditEntries: 1 });
    expect((await db.select().from(drafts)).map((row) => row.inviteId)).toEqual([live.id]);
    expect((await db.select().from(invites)).map((row) => row.id)).toEqual([live.id]);
    expect((await db.select().from(clients)).map((row) => row.id)).toEqual([keepClient.id]);
    const [entry] = await db.select().from(auditLog).where(eq(auditLog.action, "retention.purge"));
    expect(entry.detail).toEqual(counts);
  });

  async function addSubmission(clientId: string, inviteId: string, submittedAt: Date) {
    await db.insert(submissions).values({
      inviteId,
      clientId,
      questionnaireId: "client-brand-discovery",
      questionnaireVersion: "1.0.0",
      locale: "en",
      snapshotSealed: sealJson({}, ring, `submission:${inviteId}`),
      snapshotDigest: "d",
      submittedAt,
      deleteAfter: submissionDeleteAfter(submittedAt),
    });
  }

  it("removes a submitted client completely once the submission reaches 12 months", async () => {
    const client = await addClient();
    const invite = await addInvite(client.id, { status: "submitted", tokenHash: null });
    await addSubmission(client.id, invite.id, new Date("2025-10-15T00:00:00Z"));
    await db.insert(sessions).values({ idHash: "s", kind: "client", clientId: client.id, expiresAt: new Date(now.getTime() + DAY) });

    await purgeExpired(db, now);

    expect(await db.select().from(submissions)).toHaveLength(0);
    expect(await db.select().from(invites)).toHaveLength(0);
    expect(await db.select().from(clients)).toHaveLength(0);
    expect(await db.select().from(sessions)).toHaveLength(0);
  });

  it("keeps a submitted client inside the 12 months", async () => {
    const client = await addClient();
    const invite = await addInvite(client.id, { status: "submitted", tokenHash: null });
    await addSubmission(client.id, invite.id, new Date("2026-01-15T00:00:00Z"));
    await purgeExpired(db, now);
    expect(await db.select().from(clients)).toHaveLength(1);
  });

  it("removes revoked invites and then the client", async () => {
    const client = await addClient();
    await addInvite(client.id, { status: "revoked", tokenHash: null, revokedAt: now });
    await purgeExpired(db, now);
    expect(await db.select().from(invites)).toHaveLength(0);
    expect(await db.select().from(clients)).toHaveLength(0);
  });

  it("keeps an active invite with a recent draft and a new invite with no draft yet", async () => {
    const client = await addClient();
    const old = await addInvite(client.id, { status: "active", tokenHash: null, createdAt: new Date(now.getTime() - 200 * DAY) });
    await db.insert(drafts).values({ inviteId: old.id, answersSealed: sealJson({}, ring, `draft:${old.id}`), updatedAt: new Date(now.getTime() - DAY) });
    await addInvite(client.id, { status: "active", tokenHash: null, createdAt: new Date(now.getTime() - 2 * DAY) });
    await purgeExpired(db, now);
    expect(await db.select().from(invites)).toHaveLength(2);
  });

  it("keeps submissions for 12 months", () => {
    expect(submissionDeleteAfter(new Date("2026-10-26T10:00:00Z")).toISOString()).toBe("2027-10-26T10:00:00.000Z");
  });
});
