import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { checkRateLimit } from "../../../lib/rate-limit";
import { POST } from "./route";

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

function createDeletionRequest(): NextRequest {
  return new Request("https://digitaltableteur.com/api/gdpr/delete-data", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "person@example.com" }),
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
