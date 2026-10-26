import { sql } from "drizzle-orm";

import { rateLimits } from "../db/schema";
import { sha256Hex } from "../security/snapshot";
import type { IntakeContext, Tx } from "./context";

/**
 * Fixed-window counters in the intake database (STRIDE D1, E3). Keys are
 * hashed before they are stored, so no IP address or email address sits in
 * the table. A database error propagates: callers fail closed.
 */
export const LIMITS = {
  /** Code requests from one network address. */
  codeRequestsPerIp: { limit: 20, windowMs: 60 * 60 * 1000 },
  /**
   * Codes emailed to one client from one network address. Keyed on both, so
   * a stranger spending the quota does not stop the client's own requests.
   */
  codesPerClientNetwork: { limit: 5, windowMs: 60 * 60 * 1000 },
  /**
   * Codes emailed to one client in total. With 5 attempts per code this
   * bounds guessing at 100 tries an hour against 10^8 codes.
   */
  codesPerClient: { limit: 20, windowMs: 60 * 60 * 1000 },
  /**
   * Wrong codes for one client from one network address in a day. Keyed on
   * both, so a stranger guessing locks out only their own network.
   */
  codeFailuresPerClientNetwork: { limit: 10, windowMs: 24 * 60 * 60 * 1000 },
  /**
   * Wrong codes for one client in a day from everywhere. Reaching it raises
   * an alert instead of refusing codes, so nobody can lock a client out;
   * guessing stays bounded by codesPerClient (20 codes x 5 attempts an hour).
   */
  codeFailuresPerClient: { limit: 100, windowMs: 24 * 60 * 60 * 1000 },
  /** One owner alert per client per day when codeFailuresPerClient is reached. */
  codeFailureAlerts: { limit: 1, windowMs: 24 * 60 * 60 * 1000 },
  /** Draft saves for one session, generous for autosave. */
  savesPerSession: { limit: 600, windowMs: 60 * 60 * 1000 },
} as const;

export type LimitName = keyof typeof LIMITS;

/** Counts one hit; true while the bucket is still within its limit. */
export async function hit(ctx: Pick<IntakeContext, "db" | "now">, name: LimitName, key: string, tx?: Tx): Promise<boolean> {
  const { limit, windowMs } = LIMITS[name];
  const now = ctx.now();
  const resetAt = new Date(now.getTime() + windowMs);
  const bucket = `${name}:${sha256Hex(key)}`;
  const nowIso = now.toISOString();
  const [row] = await (tx ?? ctx.db)
    .insert(rateLimits)
    .values({ bucket, count: 1, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.bucket,
      set: {
        count: sql`case when ${rateLimits.resetAt} <= ${nowIso}::timestamptz then 1 else ${rateLimits.count} + 1 end`,
        resetAt: sql`case when ${rateLimits.resetAt} <= ${nowIso}::timestamptz then ${resetAt.toISOString()}::timestamptz else ${rateLimits.resetAt} end`,
      },
    })
    .returning({ count: rateLimits.count });
  return row.count <= limit;
}

/** True when a bucket has reached its limit, without counting a hit. */
export async function isOver(ctx: Pick<IntakeContext, "db" | "now">, name: LimitName, key: string): Promise<boolean> {
  const bucket = `${name}:${sha256Hex(key)}`;
  const [row] = await ctx.db.select().from(rateLimits).where(sql`${rateLimits.bucket} = ${bucket}`);
  return Boolean(row && row.resetAt > ctx.now() && row.count >= LIMITS[name].limit);
}
