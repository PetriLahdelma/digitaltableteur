import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDatabase } from "@/app/lib/mongodb";
import { GET } from "./route";

vi.mock("@/app/lib/mongodb", () => ({ getDatabase: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const call = (authorization?: string) =>
  GET(
    new NextRequest("https://www.example.test/api/cron/site-retention", {
      headers: authorization ? { authorization } : {},
    }),
  );

describe("site retention cron", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("refuses a missing, wrong or unset secret before touching the database", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "s3cret-value");
    expect((await call()).status).toBe(401);
    expect((await call("Bearer s3cret-valuX")).status).toBe(401);
    expect((await call("Bearer s3cret")).status).toBe(401);
    expect(getDatabase).not.toHaveBeenCalled();
  });

  it("purges, then retries failed and stale pending notifications", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret-value");
    vi.stubEnv("RESEND_API_KEY", "test_key");
    const due = [
      { _id: "c1", name: "A", email: "a@example.com", message: "Hello there" },
      { _id: "c2", name: "B", email: "b@example.com", message: "Hello again" },
    ];
    let findFilter: unknown;
    const contacts = {
      deleteMany: vi.fn(async () => ({ deletedCount: 0 })),
      find: vi.fn((filter: unknown) => {
        findFilter = filter;
        return { limit: () => ({ toArray: async () => due }) };
      }),
      updateOne: vi.fn(async () => ({ modifiedCount: 1 })),
    };
    vi.mocked(getDatabase).mockResolvedValue({
      collection: (name: string) =>
        name === "contacts" ? contacts : { deleteMany: vi.fn(async () => ({ deletedCount: 0 })) },
    } as unknown as Awaited<ReturnType<typeof getDatabase>>);
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 500 }));

    const response = await call("Bearer s3cret-value");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      purged: { contacts: 0, donnyLeads: 0 },
      notifications: { sent: 1, failed: 1 },
    });
    expect(JSON.stringify(findFilter)).toContain("failed");
    expect(JSON.stringify(findFilter)).toContain("pending");
  });
});
