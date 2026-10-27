import { randomUUID } from "node:crypto";

import { and, desc, eq, gt, inArray, max } from "drizzle-orm";

import { submissionDeleteAfter } from "../db/retention";
import { auditLog, clients, drafts, invites, submissions } from "../db/schema";
import { draftSchema, getQuestionnaire, pruneHiddenAnswers, submissionSchema } from "../index";
import { openJson, sealJson } from "../security/envelope";
import { snapshotDigest } from "../security/snapshot";
import type { Answers, IntakeLocale, Questionnaire } from "../types";
import type { IntakeContext, IntakeMail } from "./context";
import { openContact } from "./invites";
import { submittedMail } from "./mail";
import { answerOutline } from "../answer-text";
import { ownerSubmittedMail } from "./owner-mail";

export const draftAad = (inviteId: string) => `draft:${inviteId}`;
export const submissionAad = (submissionId: string) => `submission:${submissionId}`;

export type IntakeSummary = Readonly<{
  inviteId: string;
  questionnaireId: string;
  title: string;
  locale: IntakeLocale;
  status: "active" | "submitted";
  updatedAt: Date | null;
  submissionId: string | null;
  submittedAt: Date | null;
}>;

/** The client home: every intake this client can open, newest first. Scoped by the session's client id (STRIDE E1). */
export async function listClientIntakes(ctx: IntakeContext, clientId: string): Promise<IntakeSummary[]> {
  const rows = await ctx.db
    .select({ invite: invites, draftUpdatedAt: drafts.updatedAt })
    .from(invites)
    .leftJoin(drafts, eq(drafts.inviteId, invites.id))
    .where(and(eq(invites.clientId, clientId), inArray(invites.status, ["active", "submitted"])))
    .orderBy(desc(invites.createdAt));
  // A reopened intake has several versions; the home shows the latest.
  const latest = new Map<string, { id: string; submittedAt: Date }>();
  const versions = await ctx.db
    .select({ inviteId: submissions.inviteId, id: submissions.id, submittedAt: submissions.submittedAt })
    .from(submissions)
    .where(and(eq(submissions.clientId, clientId), gt(submissions.deleteAfter, ctx.now())))
    .orderBy(desc(submissions.version));
  for (const row of versions) if (!latest.has(row.inviteId)) latest.set(row.inviteId, row);
  return rows.flatMap(({ invite, draftUpdatedAt }) => {
    const submissionId = latest.get(invite.id)?.id ?? null;
    const submittedAt = latest.get(invite.id)?.submittedAt ?? null;
    const questionnaire = getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion);
    // A submitted invite whose submission reached its retention limit has nothing left to show.
    if (!questionnaire || (invite.status === "submitted" && !submissionId)) return [];
    const locale = invite.locale as IntakeLocale;
    return [
      {
        inviteId: invite.id,
        questionnaireId: invite.questionnaireId,
        title: questionnaire.title[locale],
        locale,
        status: invite.status as "active" | "submitted",
        updatedAt: draftUpdatedAt,
        submissionId,
        submittedAt,
      },
    ];
  });
}

export type DraftState = Readonly<{
  inviteId: string;
  questionnaire: Questionnaire;
  locale: IntakeLocale;
  answers: Answers;
  revision: number;
  /** Page ids the client has finished. */
  completedParts: string[];
  /** Name and email from the invite, offered as answers before the first save. */
  contact: Readonly<{ name: string; email: string }>;
}>;

async function activeInvite(ctx: IntakeContext, clientId: string, inviteId: string) {
  const [invite] = await ctx.db
    .select()
    .from(invites)
    .where(and(eq(invites.id, inviteId), eq(invites.clientId, clientId), eq(invites.status, "active")));
  return invite;
}

/** Null when the invite is not this client's or is no longer editable. */
export async function loadDraft(ctx: IntakeContext, clientId: string, inviteId: string): Promise<DraftState | null> {
  const [row] = await ctx.db
    .select({ invite: invites, client: clients })
    .from(invites)
    .innerJoin(clients, eq(clients.id, invites.clientId))
    .where(and(eq(invites.id, inviteId), eq(invites.clientId, clientId), eq(invites.status, "active")));
  const questionnaire = row && getQuestionnaire(row.invite.questionnaireId, row.invite.questionnaireVersion);
  if (!row || !questionnaire) return null;
  const [draft] = await ctx.db.select().from(drafts).where(eq(drafts.inviteId, inviteId));
  const contact = openContact(ctx, row.client);
  return {
    inviteId,
    questionnaire,
    locale: row.invite.locale as IntakeLocale,
    answers: draft ? openJson<Answers>(draft.answersSealed, ctx.ring, draftAad(inviteId)) : {},
    revision: draft?.revision ?? 0,
    completedParts: draft?.completedParts ?? [],
    contact: { name: contact.name, email: contact.email },
  };
}

export type SaveResult =
  | Readonly<{ status: "saved"; revision: number }>
  | Readonly<{ status: "conflict" | "not_found" }>
  | Readonly<{ status: "invalid"; fields: string[] }>;

/**
 * Autosave. The revision makes saves conditional: a save based on an older
 * revision (a second tab) is refused with a conflict instead of overwriting
 * newer answers (README section 6). Only active invites accept writes (T2).
 */
export async function saveDraft(
  ctx: IntakeContext,
  clientId: string,
  inviteId: string,
  input: { revision: number; answers: unknown; completedParts?: string[] },
): Promise<SaveResult> {
  const invite = await activeInvite(ctx, clientId, inviteId);
  const questionnaire = invite && getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion);
  if (!invite || !questionnaire) return { status: "not_found" };
  const parsed = draftSchema(questionnaire).safeParse(input.answers);
  if (!parsed.success) return { status: "invalid", fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? "")))] };

  const pageIds = new Set(questionnaire.pages.map((page) => page.id));
  const completedParts = [...new Set(input.completedParts ?? [])];
  if (completedParts.some((id) => !pageIds.has(id))) return { status: "invalid", fields: ["completedParts"] };

  const sealed = sealJson(parsed.data, ctx.ring, draftAad(inviteId));
  const now = ctx.now();
  const next = input.revision + 1;
  if (input.revision === 0) {
    const inserted = await ctx.db
      .insert(drafts)
      .values({ inviteId, revision: 1, answersSealed: sealed, completedParts, updatedAt: now })
      .onConflictDoNothing()
      .returning({ revision: drafts.revision });
    return inserted.length === 1 ? { status: "saved", revision: 1 } : { status: "conflict" };
  }
  const updated = await ctx.db
    .update(drafts)
    .set({ revision: next, answersSealed: sealed, completedParts, updatedAt: now })
    .where(and(eq(drafts.inviteId, inviteId), eq(drafts.revision, input.revision)))
    .returning({ revision: drafts.revision });
  return updated.length === 1 ? { status: "saved", revision: next } : { status: "conflict" };
}

export type SubmitResult =
  | Readonly<{
      status: "submitted";
      submissionId: string;
      digest: string;
      version: number;
      mail: IntakeMail;
      /** The owner's copy with every answer; pass the rendered PDF to attach it. */
      ownerMail: (pdf: { filename: string; bytes: Buffer } | null) => IntakeMail;
      /** The attachment's file name, as the admin download names it. */
      pdfFilename: string;
    }>
  | Readonly<{ status: "conflict" | "not_found" }>
  | Readonly<{ status: "incomplete"; fields: string[] }>;

/** The snapshot frozen at submit. Its canonical digest is printed on the PDF and kept in the audit log. */
export type SubmissionSnapshot = Readonly<{
  questionnaireId: string;
  questionnaireVersion: string;
  locale: IntakeLocale;
  submittedAt: string;
  answers: Answers;
}>;

/**
 * Freezes the saved draft into an immutable, hashed submission. Submits only
 * what the server has stored at `revision`, so the client cannot submit
 * answers it has not saved. Hidden sections are pruned (data minimisation).
 */
export async function submitIntake(
  ctx: IntakeContext,
  clientId: string,
  inviteId: string,
  revision: number,
  /** The language on screen when the client submitted; the invite's language otherwise. */
  screenLocale?: IntakeLocale,
): Promise<SubmitResult> {
  const now = ctx.now();
  return ctx.db.transaction(async (tx) => {
    // The invite row is locked for the whole submit, so a second submit (a
    // double click, two tabs) or a revoke waits, then finds it no longer
    // active, instead of both writing a version.
    const [row] = await tx
      .select({ invite: invites, client: clients })
      .from(invites)
      .innerJoin(clients, eq(clients.id, invites.clientId))
      .where(and(eq(invites.id, inviteId), eq(invites.clientId, clientId), eq(invites.status, "active")))
      .for("update", { of: invites });
    const questionnaire = row && getQuestionnaire(row.invite.questionnaireId, row.invite.questionnaireVersion);
    if (!row || !questionnaire) return { status: "not_found" } as const;
    const [draft] = await tx.select().from(drafts).where(eq(drafts.inviteId, inviteId));
    if ((draft?.revision ?? 0) !== revision) return { status: "conflict" } as const;

    const answers = draft ? openJson<Answers>(draft.answersSealed, ctx.ring, draftAad(inviteId)) : {};
    const checked = submissionSchema(questionnaire).safeParse(answers);
    if (!checked.success) {
      return { status: "incomplete", fields: [...new Set(checked.error.issues.map((issue) => String(issue.path[0] ?? "")))] } as const;
    }

    const locale = screenLocale ?? (row.invite.locale as IntakeLocale);
    const snapshot: SubmissionSnapshot = {
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      locale,
      submittedAt: now.toISOString(),
      answers: pruneHiddenAnswers(questionnaire, checked.data as Answers),
    };
    const digest = snapshotDigest(snapshot);
    const submissionId = randomUUID();
    // Each reopen and resubmit adds a version; earlier ones stay locked.
    const [{ previous }] = await tx
      .select({ previous: max(submissions.version) })
      .from(submissions)
      .where(eq(submissions.inviteId, inviteId));
    const version = (previous ?? 0) + 1;
    await tx.insert(submissions).values({
      id: submissionId,
      version,
      inviteId,
      clientId,
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      locale,
      snapshotSealed: sealJson(snapshot, ctx.ring, submissionAad(submissionId)),
      snapshotDigest: digest,
      submittedAt: now,
      deleteAfter: submissionDeleteAfter(now),
    });
    await tx.delete(drafts).where(eq(drafts.inviteId, inviteId));
    await tx.update(invites).set({ status: "submitted", submittedAt: now }).where(eq(invites.id, inviteId));
    await tx.insert(auditLog).values({
      actor: "client",
      action: "intake.submit",
      clientId,
      inviteId,
      submissionId,
      detail: { digest, answers: Object.keys(snapshot.answers).length },
    });

    const contact = openContact(ctx, row.client);
    return {
      status: "submitted",
      submissionId,
      digest,
      version,
      // Labels in English like every owner mail; the answers as the client wrote them.
      ownerMail: (pdf) =>
        ownerSubmittedMail({
          name: contact.name,
          email: contact.email,
          questionnaire: questionnaire.title.en,
          version,
          submittedAt: now,
          adminLink: `${ctx.origin}/intake/admin/intakes/${inviteId}`,
          answers: answerOutline(questionnaire, snapshot.answers, "en", { answeredOnly: true }),
          pdf,
        }),
      pdfFilename: `intake-${now.toISOString().slice(0, 10)}-v${version}.pdf`,
      mail: submittedMail({
        to: contact.email,
        locale,
        questionnaire: questionnaire.title[locale],
        date: now,
        link: `${ctx.origin}/intake/submissions/${submissionId}`,
      }),
    } as const;
  });
}

export type SubmissionView = Readonly<{
  submissionId: string;
  clientId: string;
  inviteId: string;
  version: number;
  questionnaire: Questionnaire;
  snapshot: SubmissionSnapshot;
  digest: string;
  submittedAt: Date;
}>;

/** Read-only view of one past submission, scoped to the session's client. */
export async function getSubmission(ctx: IntakeContext, clientId: string, submissionId: string): Promise<SubmissionView | null> {
  return readSubmission(ctx, submissionId, { clientId });
}

/**
 * The same view without a client scope, for the PDF print page only. That
 * page is authorised by a one-minute print token instead of a session.
 */
export async function getSubmissionForPrint(ctx: IntakeContext, submissionId: string): Promise<SubmissionView | null> {
  return readSubmission(ctx, submissionId, "unscoped");
}

/** `scope` is explicit, so a missing client id can never widen the read. */
async function readSubmission(
  ctx: IntakeContext,
  submissionId: string,
  scope: { clientId: string } | "unscoped",
): Promise<SubmissionView | null> {
  const [row] = await ctx.db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.id, submissionId),
        scope === "unscoped" ? undefined : eq(submissions.clientId, scope.clientId),
        gt(submissions.deleteAfter, ctx.now()),
      ),
    );
  const questionnaire = row && getQuestionnaire(row.questionnaireId, row.questionnaireVersion);
  if (!row || !questionnaire) return null;
  return {
    submissionId,
    clientId: row.clientId,
    inviteId: row.inviteId,
    version: row.version,
    questionnaire,
    snapshot: openJson<SubmissionSnapshot>(row.snapshotSealed, ctx.ring, submissionAad(submissionId)),
    digest: row.snapshotDigest,
    submittedAt: row.submittedAt,
  };
}
