import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { getDatabase } from "../../lib/mongodb";
import { POST } from "./route";

vi.mock("../../lib/mongodb", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("../../lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() =>
    Promise.resolve({
      limited: false,
      retryAfterSeconds: 0,
      remaining: 2,
      source: "mongodb",
    }),
  ),
}));

vi.mock("../../lib/security-logger", () => ({
  getClientIp: vi.fn(() => "203.0.113.30"),
  getUserAgent: vi.fn(() => "Test Agent"),
}));

vi.mock("../chat-shared", () => ({
  createCorsHeaders: vi.fn(() => ({ Vary: "Origin" })),
}));

const getDatabaseMock = vi.mocked(getDatabase);
type MockDb = Awaited<ReturnType<typeof getDatabase>>;

const payload = {
  name: "Person Example",
  email: "person@example.com",
  message: "I would like to discuss a project.",
};

function createContactRequest(): NextRequest {
  return new Request("https://digitaltableteur.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }) as NextRequest;
}

describe("contact route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RESEND_API_KEY", "test_resend_key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("stores the lead before sending the notification email", async () => {
    const events: string[] = [];
    const collection = {
      insertOne: vi.fn(async () => {
        events.push("insert");
        return { insertedId: "contact-1" };
      }),
      updateOne: vi.fn(async () => {
        events.push("update");
        return { modifiedCount: 1 };
      }),
    };
    getDatabaseMock.mockResolvedValue({
      collection: vi.fn(() => collection),
    } as unknown as MockDb);
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      events.push("send");
      return new Response("", { status: 200 });
    });

    const response = await POST(createContactRequest());

    expect(response.status).toBe(200);
    expect(events.slice(0, 2)).toEqual(["insert", "send"]);
    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: "contact-1" },
      expect.objectContaining({
        $set: expect.objectContaining({ emailDeliveryStatus: "sent" }),
      }),
    );
  });

  it("marks the stored lead as failed when email delivery fails", async () => {
    const collection = {
      insertOne: vi.fn(async () => ({ insertedId: "contact-2" })),
      updateOne: vi.fn(async () => ({ modifiedCount: 1 })),
    };
    getDatabaseMock.mockResolvedValue({
      collection: vi.fn(() => collection),
    } as unknown as MockDb);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Bad request", { status: 400 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(createContactRequest());

    expect(response.status).toBe(500);
    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: "contact-2" },
      expect.objectContaining({
        $set: expect.objectContaining({
          emailDeliveryStatus: "failed",
          emailDeliveryError: "Resend send failed: 400",
        }),
      }),
    );
  });
});
