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

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const getDatabaseMock = vi.mocked(getDatabase);
type MockDb = Awaited<ReturnType<typeof getDatabase>>;

const payload = {
  name: "Person Example",
  email: "person@example.com",
  message: "I would like to discuss a project.",
};

const SUBMISSION_ID = "6f1c2b9e-2d4a-4c7e-9b1a-3e5f7a9c1d2e";

function createContactRequest(extra: Record<string, unknown> = {}): NextRequest {
  return new Request("https://digitaltableteur.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, ...extra }),
  }) as NextRequest;
}

function duplicateKeyError() {
  return Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
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

  it("keeps the submission and answers 202 when email delivery fails", async () => {
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

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ status: "accepted" });
    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: "contact-2" },
      expect.objectContaining({
        $set: expect.objectContaining({
          emailDeliveryStatus: "failed",
          emailDeliveryError: "Resend send failed: 400",
        }),
        $inc: { emailDeliveryAttempts: 1 },
      }),
    );
  });

  it("stores the submission id and ensures its unique index", async () => {
    const collection = {
      createIndex: vi.fn(async () => "submissionId_1"),
      insertOne: vi.fn(async () => ({ insertedId: "contact-3" })),
      updateOne: vi.fn(async () => ({ modifiedCount: 1 })),
    };
    getDatabaseMock.mockResolvedValue({
      collection: vi.fn(() => collection),
    } as unknown as MockDb);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 200 }));

    const response = await POST(createContactRequest({ submissionId: SUBMISSION_ID }));

    expect(response.status).toBe(200);
    expect(collection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ submissionId: SUBMISSION_ID }),
    );
  });

  it("does not store or send twice when a sent submission is retried", async () => {
    const collection = {
      createIndex: vi.fn(async () => "submissionId_1"),
      insertOne: vi.fn(async () => {
        throw duplicateKeyError();
      }),
      findOne: vi.fn(async () => ({ _id: "contact-4", emailDeliveryStatus: "sent" })),
      updateOne: vi.fn(),
    };
    getDatabaseMock.mockResolvedValue({
      collection: vi.fn(() => collection),
    } as unknown as MockDb);
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await POST(createContactRequest({ submissionId: SUBMISSION_ID }));

    expect(response.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(collection.updateOne).not.toHaveBeenCalled();
  });

  it("finishes the notification when a failed submission is retried", async () => {
    const collection = {
      createIndex: vi.fn(async () => "submissionId_1"),
      insertOne: vi.fn(async () => {
        throw duplicateKeyError();
      }),
      findOne: vi.fn(async () => ({ _id: "contact-5", emailDeliveryStatus: "failed" })),
      updateOne: vi.fn(async () => ({ modifiedCount: 1 })),
    };
    getDatabaseMock.mockResolvedValue({
      collection: vi.fn(() => collection),
    } as unknown as MockDb);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 200 }));

    const response = await POST(createContactRequest({ submissionId: SUBMISSION_ID }));

    expect(response.status).toBe(200);
    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: "contact-5" },
      expect.objectContaining({
        $set: expect.objectContaining({ emailDeliveryStatus: "sent" }),
      }),
    );
  });

  it("rejects a submission id that is not a UUID", async () => {
    const response = await POST(createContactRequest({ submissionId: "not-a-uuid" }));
    expect(response.status).toBe(400);
  });
});
