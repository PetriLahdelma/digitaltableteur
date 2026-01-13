/**
 * Security Tests: Timing-Safe Password Comparison
 *
 * Tests the constantTimeCompare function pattern used in download-cv and
 * test-health routes. This function uses Node.js crypto.timingSafeEqual to
 * prevent timing attacks on password verification.
 *
 * Note: We cannot unit test timing characteristics (requires statistical analysis).
 * We test correctness only - that the function produces the same boolean results
 * as direct equality but uses the timing-safe implementation.
 *
 * @see app/api/download-cv/route.ts
 * @see app/api/test-health/runs/route.ts
 */

import { describe, it, expect } from "vitest";
import { timingSafeEqual } from "crypto";

/**
 * Constant-time password comparison to prevent timing attacks.
 * Mirrors the exact implementation from download-cv/route.ts
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  return timingSafeEqual(bufA, bufB);
}

describe("Security: Timing-Safe Password Comparison", () => {
  describe("constantTimeCompare()", () => {
    it("returns true for identical strings", () => {
      expect(constantTimeCompare("password123", "password123")).toBe(true);
      expect(constantTimeCompare("secret", "secret")).toBe(true);
      expect(constantTimeCompare("a", "a")).toBe(true);
    });

    it("returns false for different strings of same length", () => {
      expect(constantTimeCompare("password123", "password456")).toBe(false);
      expect(constantTimeCompare("secret", "secrat")).toBe(false);
      expect(constantTimeCompare("abc", "xyz")).toBe(false);
    });

    it("returns false for strings of different lengths", () => {
      expect(constantTimeCompare("short", "longerstring")).toBe(false);
      expect(constantTimeCompare("longerstring", "short")).toBe(false);
      expect(constantTimeCompare("abc", "abcd")).toBe(false);
    });

    it("returns false for empty vs non-empty strings", () => {
      expect(constantTimeCompare("", "nonempty")).toBe(false);
      expect(constantTimeCompare("nonempty", "")).toBe(false);
    });

    it("returns true for two empty strings", () => {
      expect(constantTimeCompare("", "")).toBe(true);
    });

    it("handles special characters correctly", () => {
      // Unicode characters
      expect(constantTimeCompare("пароль", "пароль")).toBe(true);
      expect(constantTimeCompare("пароль", "парольx")).toBe(false);

      // Emojis
      expect(constantTimeCompare("pass🔐word", "pass🔐word")).toBe(true);
      expect(constantTimeCompare("pass🔐word", "pass🔑word")).toBe(false);

      // Mixed special characters
      expect(constantTimeCompare("P@$$w0rd!", "P@$$w0rd!")).toBe(true);
      expect(constantTimeCompare("P@$$w0rd!", "P@$$w0rd?")).toBe(false);
    });

    it("handles whitespace correctly", () => {
      expect(constantTimeCompare(" password ", " password ")).toBe(true);
      expect(constantTimeCompare(" password", "password ")).toBe(false);
      expect(constantTimeCompare("pass word", "password")).toBe(false);
    });

    it("is case-sensitive", () => {
      expect(constantTimeCompare("Password", "password")).toBe(false);
      expect(constantTimeCompare("SECRET", "secret")).toBe(false);
    });

    it("produces same results as direct equality for correctness", () => {
      const testCases = [
        ["same", "same"],
        ["different", "differing"],
        ["", ""],
        ["a", "b"],
        ["longer", "short"],
        ["🔐", "🔐"],
        ["пароль", "пароль"],
      ] as const;

      for (const [a, b] of testCases) {
        const expected = a === b;
        expect(constantTimeCompare(a, b)).toBe(expected);
      }
    });
  });
});
