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
  /** Codes emailed to one client. */
  codesPerClient: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Wrong codes for one client before sign-in locks for the window. */
  codeFailuresPerClient: { limit: 10, windowMs: 24 * 60 * 60 * 1000 },
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

/** Reads a bucket without counting. */
export async function isOver(ctx: Pick<IntakeContext, "db" | "now">, name: LimitName, key: string): Promise<boolean> {
  const { limit } = LIMITS[name];
  const bucket = `${name}:${sha256Hex(key)}`;
  const rows = await ctx.db.select().from(rateLimits).where(sql`${rateLimits.bucket} = ${bucket}`);
  const row = rows[0];
  return Boolean(row && row.resetAt > ctx.now() && row.count >= limit);
}
