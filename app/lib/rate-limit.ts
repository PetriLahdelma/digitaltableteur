import { createHash } from "crypto";

import { getDatabase } from "./mongodb";

type RateLimitOptions = {
  scope: string;
  key: string;
  windowMs: number;
  max: number;
  failureMode?: "allow" | "block";
};

type RateLimitKey = Pick<RateLimitOptions, "scope" | "key">;

export type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
  remaining: number;
  source: "mongodb" | "memory" | "unavailable";
};

type MemoryBucket = {
  count: number;
  resetAt: number;
};

type RateLimitDocument = {
  _id: string;
  scope: string;
  key: string;
  count: number;
  resetAt: Date;
  updatedAt: Date;
};

const memoryBuckets = new Map<string, MemoryBucket>();
let indexReady: Promise<string> | null = null;

function hashRateLimitKey(key: string): string {
  return createHash("sha256")
    .update(key.trim().toLowerCase() || "unknown")
    .digest("hex")
    .slice(0, 24);
}

const getBucketId = ({ scope, key }: RateLimitKey) =>
  `${scope}:${hashRateLimitKey(key)}`;

function shouldFailClosed(options: RateLimitOptions): boolean {
  return options.failureMode === "block" && process.env.NODE_ENV === "production";
}

function unavailableRateLimit(options: RateLimitOptions): RateLimitResult {
  return {
    limited: true,
    retryAfterSeconds: Math.max(1, Math.ceil(options.windowMs / 1000)),
    remaining: 0,
    source: "unavailable",
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown limiter error";
}

function memoryRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucketId = getBucketId(options);
  const bucket = memoryBuckets.get(bucketId);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(bucketId, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      limited: false,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      remaining: Math.max(options.max - 1, 0),
      source: "memory",
    };
  }

  bucket.count += 1;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((bucket.resetAt - now) / 1000),
  );

  return {
    limited: bucket.count > options.max,
    retryAfterSeconds,
    remaining: Math.max(options.max - bucket.count, 0),
    source: "memory",
  };
}

async function ensureIndexes() {
  if (!indexReady) {
    indexReady = getDatabase().then((db) =>
      db
        .collection("rate_limits")
        .createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 }),
    );
  }
  return indexReady;
}

export async function checkRateLimit(
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    if (shouldFailClosed(options)) {
      console.error(
        `[rate-limit] Durable limiter is not configured for ${options.scope}; blocking request.`,
      );
      return unavailableRateLimit(options);
    }

    return memoryRateLimit(options);
  }

  try {
    await ensureIndexes();

    const now = new Date();
    const resetAt = new Date(now.getTime() + options.windowMs);
    const db = await getDatabase();
    const collection = db.collection<RateLimitDocument>("rate_limits");
    const result = await collection.findOneAndUpdate(
      { _id: getBucketId(options) },
      [
        {
          $set: {
            scope: options.scope,
            key: hashRateLimitKey(options.key),
            resetAt: {
              $cond: [{ $gt: ["$resetAt", now] }, "$resetAt", resetAt],
            },
            count: {
              $cond: [
                { $gt: ["$resetAt", now] },
                { $add: [{ $ifNull: ["$count", 0] }, 1] },
                1,
              ],
            },
            updatedAt: now,
          },
        },
      ],
      { upsert: true, returnDocument: "after" },
    );

    const value = result as RateLimitDocument | null;
    const count = typeof value?.count === "number" ? value.count : 1;
    const valueResetAt =
      value?.resetAt instanceof Date ? value.resetAt : resetAt;

    return {
      limited: count > options.max,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((valueResetAt.getTime() - now.getTime()) / 1000),
      ),
      remaining: Math.max(options.max - count, 0),
      source: "mongodb",
    };
  } catch (error) {
    indexReady = null;
    const message = getErrorMessage(error);

    if (shouldFailClosed(options)) {
      console.error(
        `[rate-limit] Durable limiter unavailable for ${options.scope}; blocking request: ${message}`,
      );
      return unavailableRateLimit(options);
    }

    console.warn(
      `[rate-limit] Falling back to memory limiter for ${options.scope}: ${message}`,
    );
    return memoryRateLimit(options);
  }
}

export async function clearRateLimit(options: RateLimitKey): Promise<void> {
  const bucketId = getBucketId(options);
  memoryBuckets.delete(bucketId);

  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    return;
  }

  try {
    const db = await getDatabase();
    await db
      .collection<RateLimitDocument>("rate_limits")
      .deleteOne({ _id: bucketId });
  } catch (error) {
    console.warn(
      `[rate-limit] Could not clear limiter for ${options.scope}: ${getErrorMessage(error)}`,
    );
  }
}

export function resetRateLimitStateForTests(): void {
  memoryBuckets.clear();
  indexReady = null;
}
