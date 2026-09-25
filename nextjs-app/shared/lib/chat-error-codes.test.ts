import { describe, expect, it } from "vitest";

import { createChatErrorRef, formatStreamErrorText, parseChatError } from "./chat-error-codes";

describe("chat error protocol", () => {
  it("round-trips stream error text", () => {
    const ref = createChatErrorRef();
    expect(ref).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(parseChatError(formatStreamErrorText("ai_busy", ref))).toEqual({
      code: "ai_busy",
      ref,
      detail: null,
    });
  });

  it("reads JSON error bodies and ignores unknown codes", () => {
    expect(parseChatError('{"error":"x","code":"message_blocked","ref":"AB12CD"}')).toEqual({
      code: "message_blocked",
      ref: "AB12CD",
      detail: "x",
    });
    expect(parseChatError('{"error":"x","code":"credit_balance_exhausted"}')).toBeNull();
    expect(parseChatError("An error occurred.")).toBeNull();
  });
});
