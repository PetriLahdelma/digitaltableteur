import { randomUUID } from "node:crypto";

import { and, desc, eq, gt, inArray } from "drizzle-orm";

import { submissionDeleteAfter } from "../db/retention";
import { auditLog, clients, drafts, invites, submissions } from "../db/schema";
import { draftSchema, getQuestionnaire, pruneHiddenAnswers, submissionSchema } from "../index";
import { openJson, sealJson } from "../security/envelope";
import { snapshotDigest } from "../security/snapshot";
import type { Answers, IntakeLocale, Questionnaire } from "../types";
import type { IntakeContext, IntakeMail } from "./context";
import { openContact } from "./invites";
import { submittedMail } from "./mail";

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
    .select({ invite: invites, draftUpdatedAt: drafts.updatedAt, submissionId: submissions.id, submittedAt: submissions.submittedAt })
    .from(invites)
    .leftJoin(drafts, eq(drafts.inviteId, invites.id))
    .leftJoin(submissions, eq(submissions.inviteId, invites.id))
    .where(and(eq(invites.clientId, clientId), inArray(invites.status, ["active", "submitted"])))
    .orderBy(desc(invites.createdAt));
  return rows.flatMap(({ invite, draftUpdatedAt, submissionId, submittedAt }) => {
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
  const invite = await activeInvite(ctx, clientId, inviteId);
  const questionnaire = invite && getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion);
  if (!invite || !questionnaire) return null;
  const [draft] = await ctx.db.select().from(drafts).where(eq(drafts.inviteId, inviteId));
  return {
    inviteId,
    questionnaire,
    locale: invite.locale as IntakeLocale,
    answers: draft ? openJson<Answers>(draft.answersSealed, ctx.ring, draftAad(inviteId)) : {},
    revision: draft?.revision ?? 0,
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
  input: { revision: number; answers: unknown },
): Promise<SaveResult> {
  const invite = await activeInvite(ctx, clientId, inviteId);
  const questionnaire = invite && getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion);
  if (!invite || !questionnaire) return { status: "not_found" };
  const parsed = draftSchema(questionnaire).safeParse(input.answers);
  if (!parsed.success) return { status: "invalid", fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? "")))] };

  const sealed = sealJson(parsed.data, ctx.ring, draftAad(inviteId));
  const now = ctx.now();
  const next = input.revision + 1;
  if (input.revision === 0) {
    const inserted = await ctx.db
      .insert(drafts)
      .values({ inviteId, revision: 1, answersSealed: sealed, updatedAt: now })
      .onConflictDoNothing()
      .returning({ revision: drafts.revision });
    return inserted.length === 1 ? { status: "saved", revision: 1 } : { status: "conflict" };
  }
  const updated = await ctx.db
    .update(drafts)
    .set({ revision: next, answersSealed: sealed, updatedAt: now })
    .where(and(eq(drafts.inviteId, inviteId), eq(drafts.revision, input.revision)))
    .returning({ revision: drafts.revision });
  return updated.length === 1 ? { status: "saved", revision: next } : { status: "conflict" };
}

export type SubmitResult =
  | Readonly<{ status: "submitted"; submissionId: string; digest: string; mail: IntakeMail }>
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
export async function submitIntake(ctx: IntakeContext, clientId: string, inviteId: string, revision: number): Promise<SubmitResult> {
  const now = ctx.now();
  return ctx.db.transaction(async (tx) => {
    const [row] = await tx
      .select({ invite: invites, client: clients })
      .from(invites)
      .innerJoin(clients, eq(clients.id, invites.clientId))
      .where(and(eq(invites.id, inviteId), eq(invites.clientId, clientId), eq(invites.status, "active")));
    const questionnaire = row && getQuestionnaire(row.invite.questionnaireId, row.invite.questionnaireVersion);
    if (!row || !questionnaire) return { status: "not_found" } as const;
    const [draft] = await tx.select().from(drafts).where(eq(drafts.inviteId, inviteId));
    if ((draft?.revision ?? 0) !== revision) return { status: "conflict" } as const;

    const answers = draft ? openJson<Answers>(draft.answersSealed, ctx.ring, draftAad(inviteId)) : {};
    const checked = submissionSchema(questionnaire).safeParse(answers);
    if (!checked.success) {
      return { status: "incomplete", fields: [...new Set(checked.error.issues.map((issue) => String(issue.path[0] ?? "")))] } as const;
    }

    const locale = row.invite.locale as IntakeLocale;
    const snapshot: SubmissionSnapshot = {
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      locale,
      submittedAt: now.toISOString(),
      answers: pruneHiddenAnswers(questionnaire, checked.data as Answers),
    };
    const digest = snapshotDigest(snapshot);
    const submissionId = randomUUID();
    await tx.insert(submissions).values({
      id: submissionId,
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
  questionnaire: Questionnaire;
  snapshot: SubmissionSnapshot;
  digest: string;
  submittedAt: Date;
}>;

/** Read-only view of one past submission, scoped to the session's client. */
export async function getSubmission(ctx: IntakeContext, clientId: string, submissionId: string): Promise<SubmissionView | null> {
  const [row] = await ctx.db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, submissionId), eq(submissions.clientId, clientId), gt(submissions.deleteAfter, ctx.now())));
  const questionnaire = row && getQuestionnaire(row.questionnaireId, row.questionnaireVersion);
  if (!row || !questionnaire) return null;
  return {
    submissionId,
    questionnaire,
    snapshot: openJson<SubmissionSnapshot>(row.snapshotSealed, ctx.ring, submissionAad(submissionId)),
    digest: row.snapshotDigest,
    submittedAt: row.submittedAt,
  };
}
