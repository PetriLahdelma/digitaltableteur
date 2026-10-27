import { and, eq, lt, notExists, or, sql } from "drizzle-orm";

import { RETENTION } from "../data-policy";
import type { IntakeDb } from "./client";
import { adminChallenges, adminEnrolments, auditLog, clients, drafts, invites, loginCodes, rateLimits, sessions, submissions } from "./schema";

const DAY = 24 * 60 * 60 * 1000;

function monthsBefore(now: Date, months: number): Date {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
}

export type PurgeCounts = Record<
  | "codes"
  | "sessions"
  | "rateLimits"
  | "adminChallenges"
  | "adminEnrolments"
  | "drafts"
  | "submissions"
  | "invites"
  | "clients"
  | "auditEntries",
  number
>;

/**
 * Deletes everything past its retention window (decisions in
 * app/lib/intake/data-policy.ts). Run daily by a cron route. Order matters:
 * drafts and submissions go first, then every invite with nothing live left
 * on it, then every client with no invites, so a client's sealed contact
 * details never outlive their last submission. Writes one audit entry with
 * counts only.
 */
export async function purgeExpired(db: IntakeDb, now = new Date()): Promise<PurgeCounts> {
  return db.transaction(async (tx) => {
    const count = async (rows: Promise<unknown[]>) => (await rows).length;
    const draftCutoff = new Date(now.getTime() - RETENTION.draftDaysSinceLastEdit * DAY);
    const hasDraft = tx.select({ one: sql`1` }).from(drafts).where(eq(drafts.inviteId, invites.id));
    const hasSubmission = tx.select({ one: sql`1` }).from(submissions).where(eq(submissions.inviteId, invites.id));

    const codesCount = await count(tx.delete(loginCodes).where(lt(loginCodes.expiresAt, now)).returning({ id: loginCodes.clientId }));
    const sessionsCount = await count(
      tx
        .delete(sessions)
        .where(or(lt(sessions.expiresAt, now), sql`${sessions.revokedAt} is not null`))
        .returning({ id: sessions.idHash }),
    );
    const rateLimitsCount = await count(tx.delete(rateLimits).where(lt(rateLimits.resetAt, now)).returning({ id: rateLimits.bucket }));
    // Passkey ceremonies and enrolment links are minutes long; expired ones are noise.
    const challengesCount = await count(
      tx.delete(adminChallenges).where(lt(adminChallenges.expiresAt, now)).returning({ id: adminChallenges.preauthHash }),
    );
    const enrolmentsCount = await count(
      tx.delete(adminEnrolments).where(lt(adminEnrolments.expiresAt, now)).returning({ id: adminEnrolments.tokenHash }),
    );
    const draftsCount = await count(tx.delete(drafts).where(lt(drafts.updatedAt, draftCutoff)).returning({ id: drafts.inviteId }));
    const submissionsCount = await count(
      tx.delete(submissions).where(lt(submissions.deleteAfter, now)).returning({ id: submissions.id }),
    );
    const invitesCount = await count(
      tx
        .delete(invites)
        .where(
          or(
            // Link never redeemed before it expired: nothing was entered.
            and(eq(invites.status, "invited"), lt(invites.tokenExpiresAt, now)),
            // Submitted, and the submission has reached its retention limit.
            and(eq(invites.status, "submitted"), notExists(hasSubmission)),
            // Revoked by the owner; the audit log keeps the record of it.
            and(eq(invites.status, "revoked"), notExists(hasSubmission)),
            // Redeemed but abandoned: no draft left and older than the draft window.
            and(eq(invites.status, "active"), notExists(hasDraft), notExists(hasSubmission), lt(invites.createdAt, draftCutoff)),
          ),
        )
        .returning({ id: invites.id }),
    );
    const clientsCount = await count(
      tx
        .delete(clients)
        .where(notExists(tx.select({ one: sql`1` }).from(invites).where(eq(invites.clientId, clients.id))))
        .returning({ id: clients.id }),
    );
    const auditCount = await count(
      tx.delete(auditLog).where(lt(auditLog.at, monthsBefore(now, RETENTION.auditLogMonths))).returning({ id: auditLog.id }),
    );

    const counts: PurgeCounts = {
      codes: codesCount,
      sessions: sessionsCount,
      rateLimits: rateLimitsCount,
      adminChallenges: challengesCount,
      adminEnrolments: enrolmentsCount,
      drafts: draftsCount,
      submissions: submissionsCount,
      invites: invitesCount,
      clients: clientsCount,
      auditEntries: auditCount,
    };
    await tx.insert(auditLog).values({ actor: "system", action: "retention.purge", detail: counts });
    return counts;
  });
}

/** Submissions are kept for RETENTION.submissionMonths after submission. */
export function submissionDeleteAfter(submittedAt: Date): Date {
  return monthsBefore(submittedAt, -RETENTION.submissionMonths);
}
