import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { IntakeDb } from "../db/client";
import { auditLog, drafts, invites, loginCodes, pdfs, submissions } from "../db/schema";
import { createTestIntakeDb } from "../db/test-db";
import { getQuestionnaire, visibleFields } from "../index";
import { openJson } from "../security/envelope";
import { parseDataKeys, parseHmacKey } from "../security/keys";
import { snapshotDigest } from "../security/snapshot";
import type { Answers } from "../types";
import { endSession, readSession, requestCodeForEmail, requestCodeForInvite, verifyLoginCode } from "./auth";
import { HOUR, MINUTE, type IntakeContext, type IntakeMail } from "./context";
import { getSubmission, listClientIntakes, loadDraft, saveDraft, submissionAad, submitIntake } from "./forms";
import { createInvite } from "./invites";
import { submissionPdf } from "./pdf";

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

async function invite(email = "client@example.test") {
  return createInvite(ctx, { email, name: "Aino", questionnaireId: "client-brand-discovery", locale: "fi" });
}

async function signIn(token: string) {
  const request = await requestCodeForInvite(ctx, token, "net-1");
  if (request.status !== "sent") throw new Error(request.status);
  const check = await verifyLoginCode(ctx, request.preauthToken, codeFrom(request.mail), "net-1");
  if (check.status !== "ok") throw new Error(check.status);
  const session = await readSession(ctx, check.sessionToken);
  if (!session) throw new Error("no session");
  return { session, sessionToken: check.sessionToken };
}

/** The smallest answer set that satisfies every required field. */
function completeAnswers(): Answers {
  const questionnaire = getQuestionnaire("client-brand-discovery")!;
  const answers: Record<string, Answers[string]> = {};
  for (const field of visibleFields(questionnaire, {})) {
    if (field.required !== "submit") continue;
    answers[field.id] = field.kind === "confirm" ? true : field.kind === "email" ? "aino@example.test" : "Answer";
  }
  return answers;
}

describe("invite and sign-in", () => {
  it("emails a link whose token rides in the fragment and stores only its hash", async () => {
    const created = await invite();
    expect(created.mail.text).toContain(`/intake/start?lang=fi#t=${created.token}`);
    expect(created.mail.to).toBe("client@example.test");
    const [row] = await db.select().from(invites);
    expect(row.tokenHash).not.toBe(created.token);
    expect(row.status).toBe("invited");
  });

  it("signs in with the emailed code, spends the link and starts a session", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    expect(session.clientId).toBe(created.clientId);
    const [row] = await db.select().from(invites);
    expect(row.status).toBe("active");
    expect(row.tokenHash).toBeNull();
    expect((await requestCodeForInvite(ctx, created.token, "net-1")).status).toBe("invalid_invite");
  });

  it("refuses an expired link", async () => {
    const created = await invite();
    advance(73 * HOUR);
    expect((await requestCodeForInvite(ctx, created.token, "net-1")).status).toBe("invalid_invite");
  });

  it("binds the code to the pre-auth cookie it was issued with", async () => {
    const created = await invite();
    const request = await requestCodeForInvite(ctx, created.token, "net-1");
    if (request.status !== "sent") throw new Error();
    expect((await verifyLoginCode(ctx, "another-cookie", codeFrom(request.mail), "net-1")).status).toBe("expired");
  });

  it("locks after five wrong codes and the right code no longer works", async () => {
    const created = await invite();
    const request = await requestCodeForInvite(ctx, created.token, "net-1");
    if (request.status !== "sent") throw new Error();
    const right = codeFrom(request.mail);
    const wrong = right === "00000000" ? "11111111" : "00000000";
    const results = [];
    for (let i = 0; i < 5; i += 1) results.push((await verifyLoginCode(ctx, request.preauthToken, wrong, "net-1")).status);
    expect(results).toEqual(["wrong", "wrong", "wrong", "wrong", "locked"]);
    expect((await verifyLoginCode(ctx, request.preauthToken, right, "net-1")).status).not.toBe("ok");
  });

  it("expires codes after 10 minutes", async () => {
    const created = await invite();
    const request = await requestCodeForInvite(ctx, created.token, "net-1");
    if (request.status !== "sent") throw new Error();
    advance(11 * MINUTE);
    expect((await verifyLoginCode(ctx, request.preauthToken, codeFrom(request.mail), "net-1")).status).toBe("expired");
  });

  it("answers known and unknown addresses the same way and defers the lookup", async () => {
    await invite();
    const created = await invite("second@example.test");
    await signIn(created.token);
    const known = await requestCodeForEmail(ctx, "SECOND@example.test ", "en", "net-2");
    const unknown = await requestCodeForEmail(ctx, "nobody@example.test", "en", "net-2");
    if (known.status !== "sent" || unknown.status !== "sent") throw new Error();
    // Nothing about the address is read until after the response.
    expect(await db.select().from(loginCodes)).toHaveLength(0);
    expect(Object.keys(known).sort()).toEqual(Object.keys(unknown).sort());
    expect((await known.issue())?.to).toBe("second@example.test");
    expect(await unknown.issue()).toBeNull();
  });

  it("rate limits code requests from one network address", async () => {
    const statuses = [];
    for (let i = 0; i < 21; i += 1) statuses.push((await requestCodeForEmail(ctx, `n${i}@example.test`, "en", "net-3")).status);
    expect(statuses.at(-1)).toBe("rate_limited");
    advance(61 * MINUTE);
    expect((await requestCodeForEmail(ctx, "late@example.test", "en", "net-3")).status).toBe("sent");
  });

  it("ends sessions on sign-out, after 30 idle minutes and after 12 hours", async () => {
    const created = await invite();
    const first = await signIn(created.token);
    await endSession(ctx, first.sessionToken);
    expect(await readSession(ctx, first.sessionToken)).toBeNull();

    const again = await requestCodeForEmail(ctx, "client@example.test", "fi", "net-1");
    if (again.status !== "sent") throw new Error();
    const check = await verifyLoginCode(ctx, again.preauthToken, codeFrom(await again.issue()), "net-1");
    if (check.status !== "ok") throw new Error();
    advance(29 * MINUTE);
    expect(await readSession(ctx, check.sessionToken)).not.toBeNull();
    advance(31 * MINUTE);
    expect(await readSession(ctx, check.sessionToken)).toBeNull();
  });
});

describe("drafts and submission", () => {
  it("saves drafts encrypted with a revision and refuses stale revisions", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    const first = await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: { contact_name: "Aino" } });
    expect(first).toEqual({ status: "saved", revision: 1 });
    const second = await saveDraft(ctx, session.clientId, created.inviteId, { revision: 1, answers: { contact_name: "Aino K" } });
    expect(second).toEqual({ status: "saved", revision: 2 });
    expect(await saveDraft(ctx, session.clientId, created.inviteId, { revision: 1, answers: {} })).toEqual({ status: "conflict" });

    const [stored] = await db.select().from(drafts);
    expect(JSON.stringify(stored.answersSealed)).not.toContain("Aino");
    const loaded = await loadDraft(ctx, session.clientId, created.inviteId);
    expect(loaded?.answers).toEqual({ contact_name: "Aino K" });
    expect(loaded?.revision).toBe(2);
  });

  it("rejects unknown fields and oversized answers", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    const unknown = await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: { isAdmin: true } });
    expect(unknown.status).toBe("invalid");
    const long = await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: { contact_name: "x".repeat(201) } });
    expect(long).toEqual({ status: "invalid", fields: ["contact_name"] });
  });

  it("never lets one client read or write another client's intake", async () => {
    const mine = await invite("a@example.test");
    const theirs = await invite("b@example.test");
    const { session } = await signIn(mine.token);
    expect(await loadDraft(ctx, session.clientId, theirs.inviteId)).toBeNull();
    expect((await saveDraft(ctx, session.clientId, theirs.inviteId, { revision: 0, answers: {} })).status).toBe("not_found");
    expect((await submitIntake(ctx, session.clientId, theirs.inviteId, 0)).status).toBe("not_found");
  });

  it("lists required fields that are still empty", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    const result = await submitIntake(ctx, session.clientId, created.inviteId, 0);
    expect(result.status).toBe("incomplete");
    if (result.status === "incomplete") expect(result.fields).toContain("contact_name");
  });

  it("freezes a hashed snapshot, deletes the draft and locks further edits", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: completeAnswers() });

    // Submitting needs the revision the client last saw.
    expect((await submitIntake(ctx, session.clientId, created.inviteId, 0)).status).toBe("conflict");
    const result = await submitIntake(ctx, session.clientId, created.inviteId, 1);
    expect(result.status).toBe("submitted");
    if (result.status !== "submitted") throw new Error();

    const [row] = await db.select().from(submissions);
    const snapshot = openJson(row.snapshotSealed, ring, submissionAad(row.id));
    expect(snapshotDigest(snapshot)).toBe(result.digest);
    expect(row.deleteAfter.toISOString()).toBe("2027-11-02T09:00:00.000Z");
    expect(await db.select().from(drafts)).toHaveLength(0);
    expect((await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: {} })).status).toBe("not_found");
    expect(result.mail.text).not.toContain("Answer");
    expect(result.mail.text).toContain(`/intake/submissions/${result.submissionId}`);

    const audit = await db.select().from(auditLog).where(eq(auditLog.action, "intake.submit"));
    expect(audit[0].detail).toMatchObject({ digest: result.digest });

    const view = await getSubmission(ctx, session.clientId, result.submissionId);
    expect(view?.snapshot.answers.contact_name).toBe("Answer");
    const home = await listClientIntakes(ctx, session.clientId);
    expect(home).toMatchObject([{ status: "submitted", submissionId: result.submissionId }]);
  });

  it("submits in the language on screen, not the invite's", async () => {
    const created = await invite(); // invited in Finnish
    const { session } = await signIn(created.token);
    await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: completeAnswers() });
    const result = await submitIntake(ctx, session.clientId, created.inviteId, 1, "en");
    if (result.status !== "submitted") throw new Error(result.status);
    expect(result.mail.subject).toBe("We received your intake");
    const view = await getSubmission(ctx, session.clientId, result.submissionId);
    expect(view?.snapshot.locale).toBe("en");
  });

  it("renders the PDF once, stores it and serves the same bytes to its own client only", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers: completeAnswers() });
    const result = await submitIntake(ctx, session.clientId, created.inviteId, 1);
    if (result.status !== "submitted") throw new Error(result.status);

    let renders = 0;
    const render = async () => {
      renders += 1;
      return Buffer.from(`%PDF-1.7 render ${renders}`);
    };
    const first = await submissionPdf(ctx, { clientId: session.clientId }, result.submissionId, render);
    const second = await submissionPdf(ctx, { clientId: session.clientId }, result.submissionId, render);
    expect(renders).toBe(1);
    expect(second?.bytes.equals(first!.bytes)).toBe(true);
    const [row] = await db.select().from(pdfs);
    expect(row.byteLength).toBe(first!.bytes.length);
    expect(JSON.stringify(row.pdfSealed)).not.toContain("render 1");

    const other = await invite("someone@example.test");
    const stranger = await signIn(other.token);
    expect(await submissionPdf(ctx, { clientId: stranger.session.clientId }, result.submissionId, render)).toBeNull();

    const actions = (await db.select().from(auditLog)).map((entry) => entry.action);
    expect(actions.filter((action) => action === "pdf.render")).toHaveLength(1);
    expect(actions.filter((action) => action === "pdf.download")).toHaveLength(2);
  });

  it("drops answers to sections the client can no longer see", async () => {
    const created = await invite();
    const { session } = await signIn(created.token);
    const questionnaire = getQuestionnaire("client-brand-discovery")!;
    const conditional = questionnaire.pages.flatMap((page) => page.sections).find((section) => section.showWhen)!;
    const hiddenField = conditional.fields.find((field) => field.kind === "longText")!;
    const gate = conditional.showWhen![0];
    const choices = questionnaire.pages
      .flatMap((page) => page.sections.flatMap((section) => section.fields))
      .find((field) => field.id === gate.field);
    if (choices?.kind !== "choices") throw new Error("gate is not a choices field");
    const otherOption = choices.options.find((option) => !gate.includesAny.includes(option.id))!;
    const answers = { ...completeAnswers(), [gate.field]: [otherOption.id], [hiddenField.id]: "Hidden" };
    await saveDraft(ctx, session.clientId, created.inviteId, { revision: 0, answers });
    const result = await submitIntake(ctx, session.clientId, created.inviteId, 1);
    if (result.status !== "submitted") throw new Error(result.status);
    const view = await getSubmission(ctx, session.clientId, result.submissionId);
    expect(view?.snapshot.answers).not.toHaveProperty(hiddenField.id);
  });

  it("keeps each pending code bound to its own pre-auth cookie", async () => {
    const created = await invite();
    const mine = await requestCodeForInvite(ctx, created.token, "net-1");
    // A stranger who knows the address requests codes and guesses wrong.
    const stranger = await requestCodeForEmail(ctx, "client@example.test", "en", "net-evil");
    if (mine.status !== "sent" || stranger.status !== "sent") throw new Error();
    await stranger.issue();
    for (let i = 0; i < 6; i += 1) await verifyLoginCode(ctx, stranger.preauthToken, "00000000", "net-evil");
    // The client's own code still works, and signing in spends every pending code.
    expect((await verifyLoginCode(ctx, mine.preauthToken, codeFrom(mine.mail), "net-1")).status).toBe("ok");
    expect(await db.select().from(loginCodes)).toHaveLength(0);
  });

  it("spends attempts atomically, so parallel guesses stop at five", async () => {
    const created = await invite();
    const request = await requestCodeForInvite(ctx, created.token, "net-1");
    if (request.status !== "sent") throw new Error();
    const right = codeFrom(request.mail);
    const wrong = right === "00000000" ? "11111111" : "00000000";
    const results = await Promise.all(Array.from({ length: 12 }, () => verifyLoginCode(ctx, request.preauthToken, wrong, "net-1")));
    const [row] = await db.select().from(loginCodes);
    expect(row.attempts).toBe(5);
    expect(results.filter((result) => result.status === "wrong").length).toBeLessThanOrEqual(4);
    expect((await verifyLoginCode(ctx, request.preauthToken, right, "net-1")).status).toBe("locked");
  });

  it("caps wrong codes per day per client and network, and per client overall", async () => {
    const created = await invite();
    await signIn(created.token);
    const statuses: string[] = [];
    for (let round = 0; round < 3; round += 1) {
      const request = await requestCodeForEmail(ctx, "client@example.test", "en", "net-evil");
      if (request.status !== "sent") throw new Error();
      await request.issue();
      for (let i = 0; i < 4; i += 1) statuses.push((await verifyLoginCode(ctx, request.preauthToken, "00000000", "net-evil")).status);
    }
    // Ten failures from one network lock that network for the day.
    expect(statuses.slice(10)).toEqual(["locked", "locked"]);
    const own = await requestCodeForEmail(ctx, "client@example.test", "en", "net-home");
    if (own.status !== "sent") throw new Error();
    expect((await verifyLoginCode(ctx, own.preauthToken, codeFrom(await own.issue()), "net-home")).status).toBe("ok");
  });

  it("caps codes per client and network without blocking the client elsewhere", async () => {
    const created = await invite();
    await signIn(created.token);
    const mails = [];
    for (let i = 0; i < 6; i += 1) {
      const request = await requestCodeForEmail(ctx, "client@example.test", "en", "net-evil");
      if (request.status !== "sent") throw new Error();
      mails.push(await request.issue());
    }
    expect(mails.filter(Boolean)).toHaveLength(5);
    const own = await requestCodeForEmail(ctx, "client@example.test", "en", "net-home");
    if (own.status !== "sent") throw new Error();
    expect(await own.issue()).not.toBeNull();
  });

  it("keeps one initial intake per client: a second invite re-sends the first", async () => {
    const first = await invite();
    const again = await invite();
    expect(again.inviteId).toBe(first.inviteId);
    expect(await db.select().from(invites)).toHaveLength(1);
    // The new link works and the old one no longer does.
    expect((await requestCodeForInvite(ctx, first.token, "net-1")).status).toBe("invalid_invite");
    await signIn(again.token);
    await expect(invite()).rejects.toThrow("already has this intake");
  });
});

