import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { confirmDeletion } from "../../../../lib/gdpr-deletion";
import { getDatabase } from "../../../../lib/mongodb";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { POST } from "./route";

vi.mock("../../../../lib/gdpr-deletion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../../lib/gdpr-deletion")>()),
  confirmDeletion: vi.fn(),
}));

vi.mock("../../../../lib/mongodb", () => ({ getDatabase: vi.fn(async () => ({})) }));

vi.mock("../../../../lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

vi.mock("../../../../lib/security-logger", () => ({
  SecurityLogger: { logDataDeletion: vi.fn() },
  getClientIp: vi.fn(() => "203.0.113.20"),
  getUserAgent: vi.fn(() => "Test Agent"),
}));

const TOKEN = "Abc_-".padEnd(43, "x");

const call = (body: unknown) =>
  POST(
    new Request("https://digitaltableteur.com/api/gdpr/delete-data/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as NextRequest,
  );

describe("GDPR deletion confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue({
      limited: false,
      retryAfterSeconds: 0,
      remaining: 9,
      source: "mongodb",
    });
  });

  it("rejects a malformed token without touching the database", async () => {
    expect((await call({ token: "short" })).status).toBe(400);
    expect((await call({})).status).toBe(400);
    expect(getDatabase).not.toHaveBeenCalled();
  });

  it("answers 400 for an unknown or expired token", async () => {
    vi.mocked(confirmDeletion).mockResolvedValue({ status: "invalid" });
    const response = await call({ token: TOKEN });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_link" });
  });

  it("deletes with a valid token and passes a truncated IP for the audit record", async () => {
    vi.mocked(confirmDeletion).mockResolvedValue({ status: "deleted", deletedCount: 2 });
    const response = await call({ token: TOKEN });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: true });
    expect(confirmDeletion).toHaveBeenCalledWith(expect.anything(), TOKEN, "203.0.113.0");
  });

  it("is rate limited per IP", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      limited: true,
      retryAfterSeconds: 60,
      remaining: 0,
      source: "mongodb",
    });
    expect((await call({ token: TOKEN })).status).toBe(429);
    expect(confirmDeletion).not.toHaveBeenCalled();
  });
});
