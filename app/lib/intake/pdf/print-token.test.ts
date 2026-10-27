import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { PRINT_TOKEN_TTL_MS, signPrintToken, verifyPrintToken } from "./print-token";

const key = randomBytes(32);
const now = new Date("2026-11-02T09:00:00Z");
const id = "8da675ec-551a-470e-8a1c-d89cc4de427f";

describe("print token", () => {
  it("opens the print page of its own submission within a minute", () => {
    const token = signPrintToken(id, key, now);
    expect(verifyPrintToken(token, id, key, now)).toBe(true);
    expect(verifyPrintToken(token, id, key, new Date(now.getTime() + PRINT_TOKEN_TTL_MS - 1))).toBe(true);
  });

  it("refuses an expired token, another submission, another key or a forged one", () => {
    const token = signPrintToken(id, key, now);
    expect(verifyPrintToken(token, id, key, new Date(now.getTime() + PRINT_TOKEN_TTL_MS + 1))).toBe(false);
    expect(verifyPrintToken(token, "00000000-0000-4000-8000-000000000000", key, now)).toBe(false);
    expect(verifyPrintToken(token, id, randomBytes(32), now)).toBe(false);
    const [, mac] = token.split(".");
    const later = now.getTime() + 10 * PRINT_TOKEN_TTL_MS;
    expect(verifyPrintToken(`${later}.${mac}`, id, key, now)).toBe(false);
    expect(verifyPrintToken(null, id, key, now)).toBe(false);
    expect(verifyPrintToken("garbage", id, key, now)).toBe(false);
  });
});
