import { describe, it, expect, vi, afterEach } from "vitest";
import type { UIMessage } from "ai";
import {
  generateId,
  toStoredMessages,
  parseStoredMessages,
  parseLegacyMessages,
  fromStoredMessages,
  resolveChatErrorMessage,
} from "@dt/ChatWidget";

const ERROR_COPY = {
  network: "network",
  auth: "auth",
  notFound: "notFound",
  rateLimit: "rateLimit",
  server: "server",
  fallback: "fallback",
} as const;

describe("ChatWidget helpers", () => {
  const cryptoDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "crypto",
  );
  const originalCrypto = globalThis.crypto;

  const setCrypto = (value: any) => {
    Object.defineProperty(globalThis, "crypto", {
      value,
      configurable: true,
      writable: true,
    });
  };

  afterEach(() => {
    if (cryptoDescriptor) {
      Object.defineProperty(globalThis, "crypto", cryptoDescriptor);
    }
    vi.restoreAllMocks();
  });

  it("uses crypto.randomUUID when available", () => {
    const mockCrypto = {
      ...originalCrypto,
      randomUUID: vi.fn().mockReturnValue("uuid-123"),
    } as any;
    setCrypto(mockCrypto);

    expect(generateId()).toBe("uuid-123");
    expect(mockCrypto.randomUUID).toHaveBeenCalled();
  });

  it("falls back to getRandomValues when randomUUID is missing", () => {
    const bytes = new Uint8Array(16).fill(0xab);
    const getRandomValues = vi.fn((arr: Uint8Array) => arr.set(bytes));
    setCrypto({ getRandomValues } as any);

    const id = generateId();

    expect(getRandomValues).toHaveBeenCalled();
    expect(id).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/,
    );
  });

  it("falls back to Date.now/Math.random when crypto is unavailable", () => {
    setCrypto(undefined as any);
    vi.spyOn(Date, "now").mockReturnValue(123456);
    vi.spyOn(Math, "random").mockReturnValue(0.42);

    const id = generateId();

    expect(id).toContain("123456");
    expect(id.startsWith("id-")).toBe(true);
  });

  it("maps gateway rate-limit stream failures to rateLimit copy", () => {
    expect(
      resolveChatErrorMessage(
        new Error("No output generated. Check the stream for errors."),
        ERROR_COPY,
      ),
    ).toBe("rateLimit");
    expect(
      resolveChatErrorMessage(
        new Error("Free tier requests on this model are rate-limited."),
        ERROR_COPY,
      ),
    ).toBe("rateLimit");
  });

  it("serializes and normalizes stored messages with a greeting", () => {
    const messages: UIMessage[] = [
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Hello" }] },
      {
        id: "assistant-1",
        role: "assistant",
        parts: [{ type: "text", text: "Hi" }],
      },
      {
        id: "tool-1",
        role: "assistant",
        parts: [
          {
            type: "tool-result",
            toolCallId: "t1",
            toolName: "search",
            result: {},
          } as any,
        ],
      },
    ];

    const stored = toStoredMessages(messages, "Howdy");

    expect(stored[0]).toMatchObject({
      id: "intro",
      role: "assistant",
      text: "Howdy",
    });
    expect(stored.some((m) => m.text.includes("search"))).toBe(false);
  });

  it("parses modern and legacy stored messages and injects greeting", () => {
    const rawModern = JSON.stringify([
      { id: "a", role: "assistant", text: "Hello" },
      { id: "u", role: "user", text: "Hi" },
    ]);
    const modern = parseStoredMessages(rawModern);
    expect(modern).toHaveLength(2);

    const rawLegacy = JSON.stringify([
      { id: "legacy1", role: "assistant", content: "Old hello" },
    ]);
    const legacy = parseLegacyMessages(rawLegacy);
    expect(legacy).toHaveLength(1);

    const hydrated = fromStoredMessages(
      [...(modern || []), ...(legacy || [])],
      "Greetings",
    );
    expect(hydrated[0]).toMatchObject({
      id: "intro",
      role: "assistant",
    });
    expect(
      hydrated.some((m) => {
        const textPart = m.parts?.[0];
        return textPart && "text" in textPart && textPart.text === "Old hello";
      }),
    ).toBe(true);
  });
});
