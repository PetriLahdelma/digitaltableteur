import { describe, expect, it } from "vitest";

import {
  CHAT_MAX_BODY_BYTES,
  CHAT_MAX_MESSAGES,
  CHAT_MAX_USER_TEXT_CHARS,
  ChatApiError,
  buildSystemPrompt,
  readChatBody,
  validateMessages,
} from "./chat-shared";

describe("Donny AI Act boundaries", () => {
  it("identifies the assistant as AI and forbids regulated decision uses", () => {
    const prompt = buildSystemPrompt([]);

    expect(prompt).toContain("an AI assistant");
    expect(prompt).toContain("never a human");
    expect(prompt).toContain("Do NOT rank, score, profile");
    expect(prompt).toContain("recruitment");
    expect(prompt).toContain("Do NOT infer emotions, biometric traits");
    expect(prompt).toContain("Do NOT make binding commitments");
  });
});

const statusOf = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return (error as ChatApiError).status;
  }
  return null;
};

const userText = (text: string) => ({
  role: "user",
  parts: [{ type: "text", text }],
});

describe("chat request limits", () => {
  it("accepts a user message at the composer limit", () => {
    expect(statusOf(() => validateMessages([userText("a".repeat(CHAT_MAX_USER_TEXT_CHARS))]))).toBeNull();
  });

  it("refuses a user message over the composer limit, in parts or content", () => {
    const long = "a".repeat(CHAT_MAX_USER_TEXT_CHARS + 1);
    expect(statusOf(() => validateMessages([userText(long)]))).toBe(413);
    expect(statusOf(() => validateMessages([{ role: "user", content: long }]))).toBe(413);
  });

  it("does not apply the user limit to assistant replies", () => {
    const reply = { role: "assistant", parts: [{ type: "text", text: "a".repeat(5_000) }] };
    expect(statusOf(() => validateMessages([userText("hi"), reply, userText("thanks")]))).toBeNull();
  });

  it("refuses empty and oversized message lists", () => {
    expect(statusOf(() => validateMessages([]))).toBe(400);
    const many = Array.from({ length: CHAT_MAX_MESSAGES + 1 }, () => userText("hi"));
    expect(statusOf(() => validateMessages(many))).toBe(413);
  });

  it("refuses a body over the byte limit and invalid JSON", async () => {
    const big = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ messages: [], pad: "a".repeat(CHAT_MAX_BODY_BYTES) }),
    });
    await expect(readChatBody(big)).rejects.toMatchObject({ status: 413 });

    const broken = new Request("https://example.com", { method: "POST", body: "{" });
    await expect(readChatBody(broken)).rejects.toMatchObject({ status: 400 });
  });

  it("parses a normal body", async () => {
    const ok = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ messages: [userText("hi")] }),
    });
    await expect(readChatBody(ok)).resolves.toEqual({ messages: [userText("hi")] });
  });
});
