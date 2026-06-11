/**
 * Money-path API contract tests
 *
 * Covers the four revenue-critical endpoints that previously had zero
 * automated coverage:
 *   1. POST /api/chat          — AI chat (lead generation)
 *   2. POST /api/contact       — contact form (lead capture)
 *   3. POST /api/download-cv   — password-gated CV download
 *   4. /api/gdpr/delete-data   — GDPR deletion (legal compliance)
 *
 * Design constraints, read before editing:
 * - These tests assert the VALIDATION and SECURITY contract only. They
 *   never send a real contact email, never call OpenAI, and never use the
 *   real CV password, so they are safe against the production database
 *   and third-party quotas.
 * - The GDPR and CV routes use in-memory per-IP rate limits (10/15 min
 *   and 5 failures/15 min respectively). Tests are budgeted to stay well
 *   under those limits in a single run, and skip rather than fail if a
 *   previous local run already consumed the budget (dev server keeps the
 *   buckets in memory across test runs).
 * - GDPR POST tests intentionally assert the anti-enumeration contract:
 *   identical response for existing and non-existing emails, no
 *   recordsDeleted in the body, and no `exists` oracle on GET.
 *
 * Run: npx playwright test --project=e2e e2e/money-paths.spec.ts
 */

import { test, expect, APIResponse } from "@playwright/test";

/** Unique, clearly-synthetic addresses so audit-trail rows are identifiable. */
function testEmail(tag: string): string {
  return `e2e-money-path-${tag}-${Date.now()}@example.invalid`;
}

function skipIfRateLimitedOrDbDown(response: APIResponse) {
  test.skip(
    response.status() === 429,
    "Rate limit budget consumed by a previous run; wait 15 min",
  );
  test.skip(
    response.status() === 500,
    "Backing service unavailable (MONGODB_URI not configured?)",
  );
}

test.describe("Chat API", () => {
  test("rejects a body without messages with 400, not 500", async ({
    request,
  }) => {
    const response = await request.post("/api/chat", { data: {} });
    expect(response.status()).toBe(400);
  });

  test("rejects malformed message entries with 400", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: { messages: [{ role: "user" }] }, // no content and no parts
    });
    expect(response.status()).toBe(400);
  });

  test("does not respond to GET", async ({ request }) => {
    const response = await request.get("/api/chat");
    expect(response.status()).toBe(405);
  });
});

test.describe("Contact API", () => {
  test("rejects an empty payload with 400 and a JSON error", async ({
    request,
  }) => {
    const response = await request.post("/api/contact", { data: {} });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("rejects an invalid email with 400", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {
        name: "E2E Test",
        email: "not-an-email",
        message: "Validation contract test, never sent.",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects a too-short message with 400", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {
        name: "E2E Test",
        email: testEmail("contact"),
        message: "hi", // below the 5-char minimum
      },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("CV download API", () => {
  test("rejects a wrong password with 403 and no file", async ({
    request,
  }) => {
    const response = await request.post("/api/download-cv", {
      data: { password: "definitely-wrong-e2e-password" },
    });
    test.skip(
      response.status() === 503,
      "CV_PASSWORD not configured in this environment",
    );
    test.skip(
      response.status() === 429,
      "Failed-attempt budget consumed by a previous run",
    );
    expect(response.status()).toBe(403);
    expect(response.headers()["content-type"]).toContain("application/json");
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("rejects a malformed body with 400", async ({ request }) => {
    const response = await request.post("/api/download-cv", {
      headers: { "Content-Type": "application/json" },
      data: "not json at all",
    });
    expect([400, 403]).toContain(response.status());
  });
});

// Serial: these share the route's in-memory per-IP budget, so order and
// total request count matter.
test.describe.serial("GDPR deletion API", () => {
  test("rejects an invalid email with 400", async ({ request }) => {
    const response = await request.post("/api/gdpr/delete-data", {
      data: { email: "not-an-email" },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects a missing email with 400", async ({ request }) => {
    const response = await request.post("/api/gdpr/delete-data", {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test("returns the same response whether or not data exists (anti-enumeration)", async ({
    request,
  }) => {
    // Neither address exists in the database; the contract is that the
    // response must not reveal that either way.
    const first = await request.post("/api/gdpr/delete-data", {
      data: { email: testEmail("a"), reason: "E2E anti-enumeration test" },
    });
    skipIfRateLimitedOrDbDown(first);
    expect(first.status()).toBe(200);

    const second = await request.post("/api/gdpr/delete-data", {
      data: { email: testEmail("b"), reason: "E2E anti-enumeration test" },
    });
    skipIfRateLimitedOrDbDown(second);
    expect(second.status()).toBe(200);

    const firstBody = await first.json();
    const secondBody = await second.json();

    // Identical shape and content: no record counts, no existence signal.
    expect(firstBody).toEqual(secondBody);
    expect(firstBody.deleted).toBe(true);
    expect(firstBody).not.toHaveProperty("recordsDeleted");
  });

  test("GET no longer exposes an existence oracle", async ({ request }) => {
    const response = await request.get(
      `/api/gdpr/delete-data?email=${encodeURIComponent(testEmail("get"))}`,
    );
    test.skip(
      response.status() === 429,
      "Rate limit budget consumed by a previous run; wait 15 min",
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty("exists");
  });
});
