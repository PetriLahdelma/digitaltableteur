import { and, desc, eq, gt, isNull, lte, ne } from "drizzle-orm";

import { auditLog, clients, drafts, invites, pdfs, sessions, submissions } from "../db/schema";
import { getQuestionnaire, isVisible } from "../index";
import { openJson, sealJson } from "../security/envelope";
import type { Answers, IntakeLocale, Questionnaire } from "../types";
import { HOUR, type IntakeContext, type IntakeMail } from "./context";
import { draftAad, submissionAad, type SubmissionSnapshot } from "./forms";
import { createInvite, IntakeExistsError, openContact } from "./invites";
import { inviteMail, reopenedMail } from "./mail";
import { ownerExpiringMail } from "./owner-mail";

/**
 * The owner's view of every intake (README 6a). Called only from routes and
 * pages behind an admin session; every change writes one audit entry.
 */

export type AdminIntakeStatus = "invited" | "expired" | "started" | "reopened" | "submitted" | "revoked";

export type AdminIntakeRow = Readonly<{
  inviteId: string;
  clientId: string;
  name: string;
  email: string;
  company: string | null;
  questionnaireId: string;
  questionnaire: string;
  locale: IntakeLocale;
  status: AdminIntakeStatus;
  versions: number;
  lastActivity: Date;
}>;

type InviteRow = typeof invites.$inferSelect;

function statusOf(invite: InviteRow, now: Date): AdminIntakeStatus {
  if (invite.status === "revoked") return "revoked";
  if (invite.status === "submitted") return "submitted";
  if (invite.status === "active") return invite.reopenedAt ? "reopened" : "started";
  return invite.tokenExpiresAt <= now ? "expired" : "invited";
}

const company = (answers: Answers | null) => (typeof answers?.business_name === "string" && answers.business_name.trim() ? answers.business_name.trim() : null);

/**
 * Opens a sealed value, or null when it cannot be (a key retired from the
 * ring, a damaged row): one unreadable intake must not take down the list.
 */
function tryOpen<T>(open: () => T): T | null {
  try {
    return open();
  } catch {
    return null;
  }
}

/**
 * Every intake, most recent activity first; one intake with `inviteId`.
 * Submissions past their retention date are left out, as on the client side.
 */
export async function listIntakes(ctx: IntakeContext, inviteId?: string): Promise<AdminIntakeRow[]> {
  const now = ctx.now();
  const rows = await ctx.db
    .select({ invite: invites, client: clients, draft: drafts })
    .from(invites)
    .innerJoin(clients, eq(clients.id, invites.clientId))
    .leftJoin(drafts, eq(drafts.inviteId, invites.id))
    .where(inviteId ? eq(invites.id, inviteId) : undefined);
  const submitted = await ctx.db
    .select()
    .from(submissions)
    .where(and(gt(submissions.deleteAfter, now), inviteId ? eq(submissions.inviteId, inviteId) : undefined))
    .orderBy(desc(submissions.version));
  const latest = new Map<string, (typeof submitted)[number]>();
  const versions = new Map<string, number>();
  for (const row of submitted) {
    if (!latest.has(row.inviteId)) latest.set(row.inviteId, row);
    versions.set(row.inviteId, (versions.get(row.inviteId) ?? 0) + 1);
  }
  return rows
    .map(({ invite, client, draft }) => {
      const contact = tryOpen(() => openContact(ctx, client)) ?? { name: "?", email: "?" };
      const last = latest.get(invite.id);
      const answers = draft
        ? tryOpen(() => openJson<Answers>(draft.answersSealed, ctx.ring, draftAad(invite.id)))
        : last
          ? tryOpen(() => openJson<SubmissionSnapshot>(last.snapshotSealed, ctx.ring, submissionAad(last.id)).answers)
          : null;
      const questionnaire = getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion);
      const activity = [invite.createdAt, invite.firstSignedInAt, draft?.updatedAt, last?.submittedAt, invite.reopenedAt, invite.revokedAt]
        .filter((date): date is Date => date instanceof Date)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      return {
        inviteId: invite.id,
        clientId: client.id,
        name: contact.name,
        email: contact.email,
        company: company(answers),
        questionnaireId: invite.questionnaireId,
        questionnaire: questionnaire?.title.en ?? invite.questionnaireId,
        locale: invite.locale as IntakeLocale,
        status: statusOf(invite, now),
        versions: versions.get(invite.id) ?? 0,
        lastActivity: activity,
      };
    })
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
}

export type AdminVersion = Readonly<{ submissionId: string; version: number; submittedAt: Date; digest: string; hasPdf: boolean }>;
export type AdminAuditEntry = Readonly<{ at: Date; actor: string; action: string }>;

export type AdminIntakeDetail = AdminIntakeRow &
  Readonly<{
    questionnaireDefinition: Questionnaire;
    invitedAt: Date;
    linkExpiresAt: Date;
    firstSignedInAt: Date | null;
    /** The answers on file: the open draft, else the latest submitted version. */
    answers: Answers;
    answersSource: "draft" | "submission" | "none";
    versionList: AdminVersion[];
    audit: AdminAuditEntry[];
  }>;

/** One intake for its admin page. Opening it writes an audit entry, as reading answers should. */
export async function getIntake(ctx: IntakeContext, inviteId: string): Promise<AdminIntakeDetail | null> {
  const now = ctx.now();
  const [row] = await listIntakes(ctx, inviteId);
  const [invite] = await ctx.db.select().from(invites).where(eq(invites.id, inviteId));
  const questionnaireDefinition = invite && getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion);
  if (!row || !invite || !questionnaireDefinition) return null;
  const [draft] = await ctx.db.select().from(drafts).where(eq(drafts.inviteId, inviteId));
  const versionRows = await ctx.db
    .select({ submission: submissions, pdf: pdfs.submissionId })
    .from(submissions)
    .leftJoin(pdfs, eq(pdfs.submissionId, submissions.id))
    .where(and(eq(submissions.inviteId, inviteId), gt(submissions.deleteAfter, now)))
    .orderBy(desc(submissions.version));
  let answers: Answers = {};
  let answersSource: AdminIntakeDetail["answersSource"] = "none";
  if (draft) {
    answers = openJson<Answers>(draft.answersSealed, ctx.ring, draftAad(inviteId));
    answersSource = "draft";
  } else if (versionRows[0]) {
    const latest = versionRows[0].submission;
    answers = openJson<SubmissionSnapshot>(latest.snapshotSealed, ctx.ring, submissionAad(latest.id)).answers;
    answersSource = "submission";
  }
  await ctx.db.insert(auditLog).values({ actor: "owner", action: "intake.view", clientId: invite.clientId, inviteId });
  // Views are recorded but not listed: the activity list is about the intake.
  const audit = await ctx.db
    .select({ at: auditLog.at, actor: auditLog.actor, action: auditLog.action })
    .from(auditLog)
    .where(and(eq(auditLog.inviteId, inviteId), ne(auditLog.action, "intake.view")))
    .orderBy(desc(auditLog.at))
    .limit(50);
  return {
    ...row,
    questionnaireDefinition,
    invitedAt: invite.createdAt,
    linkExpiresAt: invite.tokenExpiresAt,
    firstSignedInAt: invite.firstSignedInAt,
    answers,
    answersSource,
    versionList: versionRows.map(({ submission, pdf }) => ({
      submissionId: submission.id,
      version: submission.version,
      submittedAt: submission.submittedAt,
      digest: submission.snapshotDigest,
      hasPdf: Boolean(pdf),
    })),
    audit,
  };
}

export type InviteInput = Readonly<{ email: string; name: string; questionnaireId: string; locale: IntakeLocale; note?: string }>;

/** The invite email exactly as it will be sent, with a placeholder link. */
export function previewInvite(ctx: Pick<IntakeContext, "origin" | "now">, input: InviteInput): IntakeMail | null {
  const questionnaire = getQuestionnaire(input.questionnaireId);
  if (!questionnaire) return null;
  return inviteMail({
    to: input.email,
    name: input.name.trim(),
    locale: input.locale,
    questionnaire: questionnaire.title[input.locale],
    link: `${ctx.origin}/intake/start?lang=${input.locale}#t=…`,
    expires: new Date(ctx.now().getTime() + 72 * HOUR),
    note: input.note,
  });
}

async function inviteWithContact(ctx: IntakeContext, inviteId: string) {
  const [row] = await ctx.db.select({ invite: invites, client: clients }).from(invites).innerJoin(clients, eq(clients.id, invites.clientId)).where(eq(invites.id, inviteId));
  return row ? { invite: row.invite, contact: openContact(ctx, row.client) } : null;
}

/** A fresh 72-hour link for an invite nobody has opened yet. */
export async function resendInvite(ctx: IntakeContext, inviteId: string): Promise<IntakeMail | "not_allowed" | null> {
  const found = await inviteWithContact(ctx, inviteId);
  if (!found) return null;
  if (found.invite.status !== "invited") return "not_allowed";
  let result;
  try {
    result = await createInvite(ctx, {
      email: found.contact.email,
      name: found.contact.name,
      questionnaireId: found.invite.questionnaireId,
      locale: found.invite.locale as IntakeLocale,
    });
  } catch (error) {
    // The client signed in between the check and the resend.
    if (error instanceof IntakeExistsError) return "not_allowed";
    throw error;
  }
  await ctx.db.update(invites).set({ expiryReminderSentAt: null }).where(eq(invites.id, inviteId));
  return result.mail;
}

/** Stops an invite: the link dies; with no other open intake, the client's sessions end. */
export async function revokeInvite(ctx: IntakeContext, inviteId: string): Promise<"revoked" | "not_allowed" | null> {
  const found = await inviteWithContact(ctx, inviteId);
  if (!found) return null;
  if (found.invite.status === "revoked" || found.invite.status === "submitted") return "not_allowed";
  const now = ctx.now();
  await ctx.db.transaction(async (tx) => {
    await tx.update(invites).set({ status: "revoked", tokenHash: null, revokedAt: now }).where(eq(invites.id, inviteId));
    const open = await tx
      .select({ id: invites.id })
      .from(invites)
      .where(and(eq(invites.clientId, found.invite.clientId), ne(invites.status, "revoked")));
    if (open.length === 0) {
      await tx.update(sessions).set({ revokedAt: now }).where(and(eq(sessions.clientId, found.invite.clientId), isNull(sessions.revokedAt)));
    }
    await tx.insert(auditLog).values({ actor: "owner", action: "invite.revoke", clientId: found.invite.clientId, inviteId });
  });
  return "revoked";
}

/**
 * Opens a submitted intake again. The submitted version stays locked with
 * its PDF; a new draft starts from its answers, every part marked done, so
 * the client's next submit becomes the next version.
 */
export async function reopenIntake(ctx: IntakeContext, inviteId: string): Promise<IntakeMail | "not_allowed" | null> {
  const found = await inviteWithContact(ctx, inviteId);
  if (!found) return null;
  if (found.invite.status !== "submitted") return "not_allowed";
  const questionnaire = getQuestionnaire(found.invite.questionnaireId, found.invite.questionnaireVersion);
  const now = ctx.now();
  // Only a version still within its retention can be reopened; an expired
  // one must not come back as a fresh draft with new retention clocks.
  const [latest] = await ctx.db
    .select()
    .from(submissions)
    .where(and(eq(submissions.inviteId, inviteId), gt(submissions.deleteAfter, now)))
    .orderBy(desc(submissions.version))
    .limit(1);
  if (!questionnaire || !latest) return null;
  const snapshot = openJson<SubmissionSnapshot>(latest.snapshotSealed, ctx.ring, submissionAad(latest.id));
  const completedParts = questionnaire.pages.filter((page) => isVisible(page, snapshot.answers)).map((page) => page.id);
  const reopened = await ctx.db.transaction(async (tx) => {
    // The status moves from submitted to active once: a double click reopens once.
    const moved = await tx
      .update(invites)
      .set({ status: "active", reopenedAt: now })
      .where(and(eq(invites.id, inviteId), eq(invites.status, "submitted")))
      .returning({ id: invites.id });
    if (moved.length !== 1) return false;
    await tx
      .insert(drafts)
      .values({ inviteId, revision: 1, answersSealed: sealJson(snapshot.answers, ctx.ring, draftAad(inviteId)), completedParts, updatedAt: now })
      .onConflictDoNothing();
    await tx.insert(auditLog).values({ actor: "owner", action: "intake.reopen", clientId: found.invite.clientId, inviteId, detail: { fromVersion: latest.version } });
    return true;
  });
  if (!reopened) return "not_allowed";
  const locale = found.invite.locale as IntakeLocale;
  return reopenedMail({ to: found.contact.email, locale, questionnaire: questionnaire.title[locale], link: `${ctx.origin}/intake?lang=${locale}` });
}

/**
 * Deletes an intake for good: invite, drafts, every version and PDF. A client
 * left with no intake is deleted too. The audit log keeps a tombstone (ids
 * and counts, no content).
 */
export async function deleteIntake(ctx: IntakeContext, inviteId: string): Promise<"deleted" | null> {
  const [invite] = await ctx.db.select().from(invites).where(eq(invites.id, inviteId));
  if (!invite) return null;
  await ctx.db.transaction(async (tx) => {
    const versions = await tx.select({ id: submissions.id }).from(submissions).where(eq(submissions.inviteId, inviteId));
    await tx.delete(invites).where(eq(invites.id, inviteId));
    const others = await tx.select({ id: invites.id }).from(invites).where(eq(invites.clientId, invite.clientId));
    if (others.length === 0) await tx.delete(clients).where(eq(clients.id, invite.clientId));
    await tx.insert(auditLog).values({
      actor: "owner",
      action: "intake.delete",
      clientId: invite.clientId,
      inviteId,
      detail: { versions: versions.length, clientDeleted: others.length === 0 },
    });
  });
  return "deleted";
}

/**
 * Owner reminders for unopened invites whose link expires in 24 to 48 hours:
 * the daily cron sees each link in that window once, so the owner hears about
 * it about a day ahead with time to resend. Each reminder is claimed before
 * it is returned; `releaseExpiryReminder` gives it back if the send fails.
 */
export async function dueExpiryReminders(ctx: IntakeContext): Promise<Array<{ inviteId: string; mail: IntakeMail }>> {
  const now = ctx.now();
  const due = await ctx.db
    .select({ invite: invites, client: clients })
    .from(invites)
    .innerJoin(clients, eq(clients.id, invites.clientId))
    .where(
      and(
        eq(invites.status, "invited"),
        isNull(invites.expiryReminderSentAt),
        gt(invites.tokenExpiresAt, now),
        lte(invites.tokenExpiresAt, new Date(now.getTime() + 48 * HOUR)),
      ),
    );
  const reminders: Array<{ inviteId: string; mail: IntakeMail }> = [];
  for (const { invite, client } of due) {
    const claimed = await ctx.db
      .update(invites)
      .set({ expiryReminderSentAt: now })
      .where(and(eq(invites.id, invite.id), isNull(invites.expiryReminderSentAt)))
      .returning({ id: invites.id });
    if (claimed.length !== 1) continue;
    await ctx.db.insert(auditLog).values({ actor: "system", action: "invite.expiry.reminder", clientId: client.id, inviteId: invite.id });
    reminders.push({
      inviteId: invite.id,
      mail: ownerExpiringMail({
        name: openContact(ctx, client).name,
        questionnaire: getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion)?.title.en ?? invite.questionnaireId,
        expiresAt: invite.tokenExpiresAt,
        adminLink: `${ctx.origin}/intake/admin/intakes/${invite.id}`,
      }),
    });
  }
  return reminders;
}

/** Un-claims a reminder whose send failed, so the next daily run tries again. */
export async function releaseExpiryReminder(ctx: IntakeContext, inviteId: string): Promise<void> {
  await ctx.db.update(invites).set({ expiryReminderSentAt: null }).where(eq(invites.id, inviteId));
}
