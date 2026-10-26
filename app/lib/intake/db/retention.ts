import { and, eq, lt, notExists, or, sql } from "drizzle-orm";

import { RETENTION } from "../data-policy";
import type { IntakeDb } from "./client";
import { auditLog, clients, drafts, invites, loginCodes, rateLimits, sessions, submissions } from "./schema";

const DAY = 24 * 60 * 60 * 1000;

function monthsBefore(now: Date, months: number): Date {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
}

export type PurgeCounts = Record<
  "codes" | "sessions" | "rateLimits" | "unusedInvites" | "drafts" | "submissions" | "clients" | "auditEntries",
  number
>;

/**
 * Deletes everything past its retention window (decisions in
 * app/lib/intake/data-policy.ts). Run daily by a cron route. Writes one audit
 * entry with counts only.
 */
export async function purgeExpired(db: IntakeDb, now = new Date()): Promise<PurgeCounts> {
  return db.transaction(async (tx) => {
    const count = async (rows: Promise<unknown[]>) => (await rows).length;
    const counts: PurgeCounts = {
      codes: await count(tx.delete(loginCodes).where(lt(loginCodes.expiresAt, now)).returning({ id: loginCodes.clientId })),
      sessions: await count(
        tx
          .delete(sessions)
          .where(or(lt(sessions.expiresAt, now), sql`${sessions.revokedAt} is not null`))
          .returning({ id: sessions.idHash }),
      ),
      rateLimits: await count(tx.delete(rateLimits).where(lt(rateLimits.resetAt, now)).returning({ id: rateLimits.bucket })),
      // Links never redeemed before they expired: nothing was entered yet.
      unusedInvites: await count(
        tx
          .delete(invites)
          .where(and(eq(invites.status, "invited"), lt(invites.tokenExpiresAt, now)))
          .returning({ id: invites.id }),
      ),
      drafts: await count(
        tx
          .delete(drafts)
          .where(lt(drafts.updatedAt, new Date(now.getTime() - RETENTION.draftDaysSinceLastEdit * DAY)))
          .returning({ id: drafts.inviteId }),
      ),
      submissions: await count(tx.delete(submissions).where(lt(submissions.deleteAfter, now)).returning({ id: submissions.id })),
      clients: 0,
      auditEntries: await count(
        tx.delete(auditLog).where(lt(auditLog.at, monthsBefore(now, RETENTION.auditLogMonths))).returning({ id: auditLog.id }),
      ),
    };
    // A client with no invites left has nothing to come back to.
    counts.clients = await count(
      tx
        .delete(clients)
        .where(notExists(tx.select({ one: sql`1` }).from(invites).where(eq(invites.clientId, clients.id))))
        .returning({ id: clients.id }),
    );
    await tx.insert(auditLog).values({ actor: "system", action: "retention.purge", detail: counts });
    return counts;
  });
}

/** Submissions are kept for RETENTION.submissionMonths after submission. */
export function submissionDeleteAfter(submittedAt: Date): Date {
  return monthsBefore(submittedAt, -RETENTION.submissionMonths);
}
