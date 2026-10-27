import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { IntakeDb } from "../db/client";
import { adminChallenges, adminCredentials, adminEnrolments, auditLog, clients, invites, sessions, submissions } from "../db/schema";
import { purgeExpired } from "../db/retention";
import { createTestIntakeDb } from "../db/test-db";
import { getQuestionnaire, visibleFields } from "../index";
import { parseDataKeys, parseHmacKey } from "../security/keys";
import type { Answers } from "../types";
import { deleteIntake, dueExpiryReminders, getIntake, listIntakes, previewInvite, releaseExpiryReminder, reopenIntake, resendInvite, revokeInvite } from "./admin";
import {
  createEnrolment,
  finishAuthentication,
  finishRegistration,
  readAdminSession,
  removePasskey,
  STEP_UP_MINUTES,
  startAuthentication,
  startRegistration,
  type AdminSession,
} from "./admin-auth";
import { readSession, requestCodeForInvite, verifyLoginCode } from "./auth";
import { HOUR, type IntakeContext, type IntakeMail } from "./context";
import { saveDraft, submitIntake } from "./forms";
import { createInvite } from "./invites";

const ring = parseDataKeys(`k1:${randomBytes(32).toString("base64")}`);
const hmacKey = parseHmacKey(randomBytes(32).toString("base64"));
const START = new Date("2026-11-02T09:00:00Z");

let db: IntakeDb;
let close: () => Promise<void>;
let clock: Date;
let ctx: IntakeContext;

beforeEach(async () => {
  const test = await createTestIntakeDb();
  db = test.db;
  close = () => test.pg.close();
  clock = START;
  ctx = { db, ring, hmacKey, origin: "https://www.example.test", now: () => clock };
});
afterEach(async () => close());

const advance = (ms: number) => {
  clock = new Date(clock.getTime() + ms);
};

function codeFrom(mail: IntakeMail | null): string {
  const match = mail?.text.match(/\b(\d{8})\b/);
  if (!match) throw new Error("No code in mail");
  return match[1];
}

/** An admin session that has just signed in (step-up satisfied). */
function freshSession(): AdminSession {
  return { idHash: "fresh-session", createdAt: clock, expiresAt: new Date(clock.getTime() + 8 * HOUR) };
}

async function invite(email = "client@example.test") {
  return createInvite(ctx, { email, name: "Aino", questionnaireId: "client-brand-discovery", locale: "en" });
}

async function signIn(token: string) {
  const request = await requestCodeForInvite(ctx, token, "net-1");
  if (request.status !== "sent") throw new Error(request.status);
  const check = await verifyLoginCode(ctx, request.preauthToken, codeFrom(request.mail), "net-1");
  if (check.status !== "ok") throw new Error(check.status);
  const session = await readSession(ctx, check.sessionToken);
  if (!session) throw new Error("no session");
  return { session, ownerMails: check.ownerMails };
}

function completeAnswers(): Answers {
  const questionnaire = getQuestionnaire("client-brand-discovery")!;
  const answers: Record<string, Answers[string]> = {};
  for (const field of visibleFields(questionnaire, {})) {
    if (field.required !== "submit") continue;
    answers[field.id] = field.kind === "confirm" ? true : field.kind === "email" ? "aino@example.test" : "zq-private-answer";
  }
  return { ...answers, business_name: "Northwind" };
}

async function submitted() {
  const created = await invite();
  const { session } = await signIn(created.token);
  await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: completeAnswers() });
  const result = await submitIntake(ctx, session.clientId, created.inviteId, 1);
  if (result.status !== "submitted") throw new Error(result.status);
  return { created, session, result };
}

describe("admin intakes", () => {
  it("lists each intake with a derived status and the company from its answers", async () => {
    const open = await invite("open@example.test");
    expect((await listIntakes(ctx))[0]).toMatchObject({ inviteId: open.inviteId, status: "invited", name: "Aino", email: "open@example.test" });
    advance(73 * HOUR);
    expect((await listIntakes(ctx))[0].status).toBe("expired");
    await submitted();
    const rows = await listIntakes(ctx);
    expect(rows[0]).toMatchObject({ status: "submitted", company: "Northwind", versions: 1 });
  });

  it("tells the owner on the first sign-in and on submit, never with an answer in it", async () => {
    const created = await invite();
    const first = await signIn(created.token);
    expect(first.ownerMails).toHaveLength(1);
    expect(first.ownerMails[0].subject).toBe("Intake started: Aino");
    expect(first.ownerMails[0].text).toContain(`/intake/admin/intakes/${created.inviteId}`);
    await saveDraft(ctx, first.session.clientId, created.inviteId, { revision: 0, answers: completeAnswers() });
    const result = await submitIntake(ctx, first.session.clientId, created.inviteId, 1);
    if (result.status !== "submitted") throw new Error(result.status);
    expect(result.ownerMail.subject).toBe("Intake submitted: Aino");
    expect(result.ownerMail.subject).not.toContain("Northwind");
    expect(result.ownerMail.text).not.toContain("zq-private-answer");
    expect(result.ownerMail.html).not.toContain("zq-private-answer");
  });

  it("reopens a submission as a new draft and keeps version 1 locked", async () => {
    const { created, session, result } = await submitted();
    const mail = await reopenIntake(ctx, created.inviteId);
    expect(typeof mail === "object" && mail?.subject).toBe("Your intake form is open again");
    // A second click finds it open already: one reopen, one email.
    expect(await reopenIntake(ctx, created.inviteId)).toBe("not_allowed");
    expect((await getIntake(ctx, created.inviteId))?.status).toBe("reopened");
    const again = await submitIntake(ctx, session.clientId, created.inviteId, 1);
    if (again.status !== "submitted") throw new Error(again.status);
    expect(again.version).toBe(2);
    expect(again.ownerMail.subject).toContain("Intake resubmitted");
    const detail = await getIntake(ctx, created.inviteId);
    expect(detail?.versionList.map((version) => version.version)).toEqual([2, 1]);
    expect(detail?.versionList[1].submissionId).toBe(result.submissionId);
    expect(typeof (await reopenIntake(ctx, created.inviteId))).toBe("object");
  });

  it("hides versions past their retention date and will not reopen them", async () => {
    const { created } = await submitted();
    await db.update(submissions).set({ deleteAfter: new Date(clock.getTime() - 1000) });
    expect((await listIntakes(ctx))[0].versions).toBe(0);
    expect((await getIntake(ctx, created.inviteId))?.versionList).toHaveLength(0);
    expect(await reopenIntake(ctx, created.inviteId)).toBeNull();
  });

  it("records opening an intake in admin without listing it as activity", async () => {
    const { created } = await submitted();
    const detail = await getIntake(ctx, created.inviteId);
    expect(detail?.audit.map((entry) => entry.action)).not.toContain("intake.view");
    const views = await db.select().from(auditLog).where(eq(auditLog.action, "intake.view"));
    expect(views).toHaveLength(1);
  });

  it("revokes an open intake and ends the client's sessions", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    expect(await revokeInvite(ctx, created.inviteId)).toBe("revoked");
    const [row] = await db.select().from(sessions).where(eq(sessions.idHash, session.idHash));
    expect(row.revokedAt).not.toBeNull();
    expect((await getIntake(ctx, created.inviteId))?.status).toBe("revoked");
  });

  it("deletes an intake with every version and the client it leaves empty", async () => {
    const { created } = await submitted();
    expect(await deleteIntake(ctx, created.inviteId)).toBe("deleted");
    expect(await db.select().from(invites)).toHaveLength(0);
    expect(await db.select().from(submissions)).toHaveLength(0);
    expect(await db.select().from(clients)).toHaveLength(0);
    const [tombstone] = await db.select().from(auditLog).where(eq(auditLog.action, "intake.delete"));
    expect(tombstone.detail).toMatchObject({ versions: 1, clientDeleted: true });
  });

  it("reminds the owner once about an invite that expires within a day", async () => {
    const created = await invite();
    expect(await dueExpiryReminders(ctx)).toHaveLength(0);
    advance(25 * HOUR);
    const due = await dueExpiryReminders(ctx);
    expect(due).toHaveLength(1);
    expect(due[0].mail.subject).toBe("Invite expires soon: Aino");
    expect(await dueExpiryReminders(ctx)).toHaveLength(0);
    // A send that failed is released and tried again on the next run.
    await releaseExpiryReminder(ctx, due[0].inviteId);
    expect(await dueExpiryReminders(ctx)).toHaveLength(1);
    // Resending gives a new link and a new reminder later.
    expect(typeof (await resendInvite(ctx, created.inviteId))).toBe("object");
    advance(49 * HOUR);
    expect(await dueExpiryReminders(ctx)).toHaveLength(1);
  });

  it("previews the invite with the owner's personal line", () => {
    const mail = previewInvite(ctx, { email: "a@example.test", name: "Aino", questionnaireId: "client-brand-discovery", locale: "en", note: "Looking forward to it." });
    expect(mail?.text).toContain("Looking forward to it.");
    expect(mail?.html).toContain("Looking forward to it.");
  });
});

describe("admin passkeys", () => {
  it("offers registration only with a live enrolment token or an admin session", async () => {
    expect((await startRegistration(ctx, {})).status).toBe("forbidden");
    expect((await startRegistration(ctx, { enrolmentToken: "made-up" })).status).toBe("forbidden");
    const { token } = await createEnrolment(ctx);
    const start = await startRegistration(ctx, { enrolmentToken: token });
    expect(start.status).toBe("ok");
    if (start.status === "ok") {
      expect(start.options.rp.id).toBe("www.example.test");
      expect(start.options.authenticatorSelection).toMatchObject({ residentKey: "required", userVerification: "required" });
    }
    advance(16 * 60 * 1000);
    expect((await startRegistration(ctx, { enrolmentToken: token })).status).toBe("forbidden");
  });

  it("spends a sign-in challenge on the first try and refuses unknown passkeys", async () => {
    const { preauthToken } = await startAuthentication(ctx);
    const fake = { id: "nope", rawId: "nope", type: "public-key", response: {}, clientExtensionResults: {} } as never;
    expect((await finishAuthentication(ctx, preauthToken, fake)).status).toBe("invalid");
    expect((await finishAuthentication(ctx, preauthToken, fake)).status).toBe("invalid");
    expect(await readAdminSession(ctx, "not-a-session")).toBeNull();
  });

  it("refuses a spent or expired enrolment token at the finish, before verifying", async () => {
    const { token } = await createEnrolment(ctx);
    const start = await startRegistration(ctx, { enrolmentToken: token });
    if (start.status !== "ok") throw new Error(start.status);
    // Another registration spent the link between this one's start and finish.
    await db.update(adminEnrolments).set({ usedAt: clock });
    const fake = { id: "x", rawId: "x", type: "public-key", response: {}, clientExtensionResults: {} } as never;
    expect((await finishRegistration(ctx, { preauthToken: start.preauthToken, response: fake, label: "Mac", enrolmentToken: token })).status).toBe("forbidden");
    expect(await db.select().from(adminCredentials)).toHaveLength(0);
  });

  it("ends every other admin session when a passkey is removed", async () => {
    await db.insert(adminCredentials).values([
      { id: "one", publicKey: "a", label: "Mac" },
      { id: "two", publicKey: "b", label: "iPhone" },
    ]);
    const expiresAt = new Date(clock.getTime() + 8 * HOUR);
    await db.insert(sessions).values([
      { idHash: "current", kind: "admin", clientId: null, createdAt: clock, lastSeenAt: clock, expiresAt },
      { idHash: "lost-phone", kind: "admin", clientId: null, createdAt: clock, lastSeenAt: clock, expiresAt },
    ]);
    expect((await removePasskey(ctx, "two", { idHash: "current", createdAt: clock, expiresAt })).status).toBe("removed");
    const rows = await db.select({ idHash: sessions.idHash, revokedAt: sessions.revokedAt }).from(sessions);
    expect(rows.find((row) => row.idHash === "current")?.revokedAt).toBeNull();
    expect(rows.find((row) => row.idHash === "lost-phone")?.revokedAt).not.toBeNull();
  });

  it("never removes the last passkey", async () => {
    const session = freshSession();
    await db.insert(adminCredentials).values({ id: "one", publicKey: "a", label: "Mac" });
    expect((await removePasskey(ctx, "one", session)).status).toBe("last");
    await db.insert(adminCredentials).values({ id: "two", publicKey: "b", label: "iPhone" });
    const removed = await removePasskey(ctx, "one", session);
    expect(removed.status).toBe("removed");
    if (removed.status === "removed") expect(removed.ownerMail.subject).toBe("Passkey removed: Mac");
    expect((await removePasskey(ctx, "one", session)).status).toBe("not_found");
  });

  it("asks for a fresh sign-in before passkeys change from a session", async () => {
    await db.insert(adminCredentials).values([
      { id: "one", publicKey: "a", label: "Mac" },
      { id: "two", publicKey: "b", label: "iPhone" },
    ]);
    const session = freshSession();
    advance((STEP_UP_MINUTES + 1) * 60 * 1000);
    expect((await removePasskey(ctx, "two", session)).status).toBe("reauth");
    expect((await startRegistration(ctx, { adminSession: session })).status).toBe("reauth");
    expect(await db.select().from(adminCredentials)).toHaveLength(2);
  });

  it("spends an enrolment link even when the owner is signed in", async () => {
    const { token } = await createEnrolment(ctx);
    const start = await startRegistration(ctx, { enrolmentToken: token, adminSession: freshSession() });
    expect(start.status).toBe("ok");
    // A made-up token is refused even alongside a valid session.
    expect((await startRegistration(ctx, { enrolmentToken: "made-up", adminSession: freshSession() })).status).toBe("forbidden");
  });

  it("purges expired passkey challenges and enrolment links", async () => {
    await createEnrolment(ctx);
    await startAuthentication(ctx);
    advance(16 * 60 * 1000);
    const counts = await purgeExpired(db, clock);
    expect(counts).toMatchObject({ adminChallenges: 1, adminEnrolments: 1 });
    expect(await db.select().from(adminChallenges)).toHaveLength(0);
    expect(await db.select().from(adminEnrolments)).toHaveLength(0);
  });
});
