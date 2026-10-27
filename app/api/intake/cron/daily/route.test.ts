import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const call = (authorization?: string) =>
  GET(new NextRequest("https://www.example.test/api/intake/cron/daily", { headers: authorization ? { authorization } : {} }));

describe("daily intake cron", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("refuses every call while CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    expect((await call()).status).toBe(401);
  });

  it("refuses a missing, wrong or differently sized bearer before touching the database", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret-value");
    expect((await call()).status).toBe(401);
    expect((await call("Bearer s3cret-valuX")).status).toBe(401);
    expect((await call("Bearer s3cret")).status).toBe(401);
    expect((await call("s3cret-value")).status).toBe(401);
  });
});
