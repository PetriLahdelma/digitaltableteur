import { beforeEach, describe, expect, it, vi } from "vitest";
import { after, type NextRequest } from "next/server";

import { issueDeletionLink } from "../../../lib/gdpr-deletion";
import { checkRateLimit } from "../../../lib/rate-limit";
import { getDatabase } from "../../../lib/mongodb";
import { POST } from "./route";

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: vi.fn(),
}));

vi.mock("../../../lib/gdpr-deletion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/gdpr-deletion")>()),
  issueDeletionLink: vi.fn(async () => true),
}));

vi.mock("../../../lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("../../../lib/mongodb", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("../../../lib/security-logger", () => ({
  SecurityLogger: {
    logDataDeletion: vi.fn(),
    logRateLimitExceeded: vi.fn(),
  },
  getClientIp: vi.fn(() => "203.0.113.20"),
  getUserAgent: vi.fn(() => "Test Agent"),
}));

vi.mock("../../chat-shared", () => ({
  createCorsHeaders: vi.fn(() => ({ Vary: "Origin" })),
}));

const checkRateLimitMock = vi.mocked(checkRateLimit);

function createDeletionRequest(
  body: Record<string, unknown> = { email: "person@example.com" },
): NextRequest {
  return new Request("https://digitaltableteur.com/api/gdpr/delete-data", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("GDPR deletion route rate limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not increment the email limiter when the IP limiter blocks", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      limited: true,
      retryAfterSeconds: 300,
      remaining: 0,
      source: "mongodb",
    });

    const response = await POST(createDeletionRequest());

    expect(response.status).toBe(429);
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1);
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "gdpr:ip" }),
    );
  });

  it("checks the email limiter only after the IP limiter allows the request", async () => {
    checkRateLimitMock
      .mockResolvedValueOnce({
        limited: false,
        retryAfterSeconds: 300,
        remaining: 9,
        source: "mongodb",
      })
      .mockResolvedValueOnce({
        limited: true,
        retryAfterSeconds: 1200,
        remaining: 0,
        source: "mongodb",
      });

    const response = await POST(createDeletionRequest());

    expect(response.status).toBe(429);
    expect(checkRateLimitMock).toHaveBeenCalledTimes(2);
    expect(checkRateLimitMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ scope: "gdpr:ip" }),
    );
    expect(checkRateLimitMock.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ scope: "gdpr:email" }),
    );
  });
});

describe("GDPR deletion request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({
      limited: false,
      retryAfterSeconds: 0,
      remaining: 9,
      source: "mongodb",
    });
  });

  it("deletes nothing: it defers a confirmation link to after the response", async () => {
    const deleteMany = vi.fn();
    vi.mocked(getDatabase).mockResolvedValue({
      collection: () => ({ deleteMany }),
    } as unknown as Awaited<ReturnType<typeof getDatabase>>);

    const response = await POST(
      createDeletionRequest({ email: "  Person@Example.COM ", locale: "sv" }),
    );

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      message: expect.stringContaining("confirmation link"),
      requested: true,
    });
    expect(deleteMany).not.toHaveBeenCalled();
    expect(issueDeletionLink).not.toHaveBeenCalled();

    const deferred = vi.mocked(after).mock.calls[0]?.[0] as () => Promise<void>;
    await deferred();
    expect(issueDeletionLink).toHaveBeenCalledWith(
      expect.anything(),
      "person@example.com",
      "sv",
    );
  });

  it("answers identically for any valid address", async () => {
    const first = await (await POST(createDeletionRequest({ email: "a@example.com" }))).json();
    const second = await (await POST(createDeletionRequest({ email: "b@example.com" }))).json();
    expect(first).toEqual(second);
  });

  it("falls back to English for an unknown locale", async () => {
    vi.mocked(getDatabase).mockResolvedValue({} as Awaited<ReturnType<typeof getDatabase>>);
    await POST(createDeletionRequest({ email: "a@example.com", locale: "de" }));
    const deferred = vi.mocked(after).mock.calls[0]?.[0] as () => Promise<void>;
    await deferred();
    expect(issueDeletionLink).toHaveBeenCalledWith(expect.anything(), "a@example.com", "en");
  });

  it("rejects an invalid address", async () => {
    const response = await POST(createDeletionRequest({ email: "not-an-email" }));
    expect(response.status).toBe(400);
    expect(after).not.toHaveBeenCalled();
  });
});
