import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDatabase } from "./mongodb";
import {
  checkRateLimit,
  resetRateLimitStateForTests,
} from "./rate-limit";

vi.mock("./mongodb", () => ({
  getDatabase: vi.fn(),
}));

const getDatabaseMock = vi.mocked(getDatabase);
type MockDb = Awaited<ReturnType<typeof getDatabase>>;

const baseOptions = {
  scope: "test",
  key: "person@example.com",
  windowMs: 60_000,
  max: 2,
};

function createCollectionMock(count = 1) {
  const resetAt = new Date(Date.now() + 60_000);
  return {
    createIndex: vi.fn().mockResolvedValue("resetAt_1"),
    findOneAndUpdate: vi.fn().mockResolvedValue({ count, resetAt }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  };
}

function createDbMock(collection: ReturnType<typeof createCollectionMock>) {
  return {
    collection: vi.fn().mockReturnValue(collection),
  };
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses memory fallback outside production when durable storage is not configured", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("MONGODB_URI", "");
    vi.stubEnv("MONGODB_DB", "");

    const result = await checkRateLimit({
      ...baseOptions,
      failureMode: "block",
    });

    expect(result.limited).toBe(false);
    expect(result.source).toBe("memory");
    expect(getDatabaseMock).not.toHaveBeenCalled();
  });

  it("fails closed in production when durable storage is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "");
    vi.stubEnv("MONGODB_DB", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await checkRateLimit({
      ...baseOptions,
      failureMode: "block",
    });

    expect(result.limited).toBe(true);
    expect(result.source).toBe("unavailable");
    expect(result.remaining).toBe(0);
    expect(getDatabaseMock).not.toHaveBeenCalled();
  });

  it("retries index creation after a transient durable limiter failure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "mongodb://example.test/?tls=true");
    vi.stubEnv("MONGODB_DB", "digitaltableteur");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const collection = createCollectionMock();
    const db = createDbMock(collection);
    getDatabaseMock
      .mockRejectedValueOnce(new Error("transient index failure"))
      .mockResolvedValue(db as unknown as MockDb);

    const first = await checkRateLimit({
      ...baseOptions,
      failureMode: "allow",
    });
    const second = await checkRateLimit({
      ...baseOptions,
      failureMode: "allow",
    });

    expect(first.source).toBe("memory");
    expect(second.source).toBe("mongodb");
    expect(collection.createIndex).toHaveBeenCalledTimes(1);
    expect(collection.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it("stores hashed limiter keys instead of raw identifiers", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "mongodb://example.test/?tls=true");
    vi.stubEnv("MONGODB_DB", "digitaltableteur");

    const collection = createCollectionMock();
    const db = createDbMock(collection);
    getDatabaseMock.mockResolvedValue(db as unknown as MockDb);

    await checkRateLimit({
      ...baseOptions,
      failureMode: "block",
    });

    const filter = collection.findOneAndUpdate.mock.calls[0]?.[0];
    const pipeline = collection.findOneAndUpdate.mock.calls[0]?.[1];

    expect(filter._id).not.toContain(baseOptions.key);
    expect(filter._id).toMatch(/^test:[a-f0-9]{24}$/);
    expect(pipeline[0].$set.key).not.toBe(baseOptions.key);
    expect(pipeline[0].$set.key).toMatch(/^[a-f0-9]{24}$/);
  });
});
