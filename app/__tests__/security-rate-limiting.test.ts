/**
 * Security Tests: Rate Limiting
 *
 * Tests the rate limiting pattern used in save-contact and download-cv routes.
 * Uses a Map-based bucket system with configurable window and max requests.
 *
 * Key patterns tested:
 * - First request is not rate limited
 * - Requests within limit are allowed
 * - Requests exceeding limit are blocked (returns true)
 * - Window expiry resets the bucket
 * - Different keys (IPs) have independent buckets
 *
 * @see app/api/save-contact/route.ts (3 req / 15 min)
 * @see app/api/download-cv/route.ts (5 req / 15 min)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Configuration matching save-contact route
const RATE_LIMIT_WINDOW_MS = 900_000; // 15 minutes
const RATE_LIMIT_MAX = 3; // requests per window per IP

// Test implementation - mirrors the exact logic from save-contact/route.ts
const buckets = new Map<string, { count: number; windowStart: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return true;
  bucket.count += 1;
  return false;
}

function resetBuckets(): void {
  buckets.clear();
}

describe("Security: Rate Limiting", () => {
  beforeEach(() => {
    resetBuckets();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rateLimit()", () => {
    it("first request is not rate limited", () => {
      const result = rateLimit("192.168.1.1");
      expect(result).toBe(false);
    });

    it("requests within limit are allowed", () => {
      const ip = "192.168.1.2";

      // First 3 requests should be allowed (RATE_LIMIT_MAX = 3)
      expect(rateLimit(ip)).toBe(false); // 1st
      expect(rateLimit(ip)).toBe(false); // 2nd
      expect(rateLimit(ip)).toBe(false); // 3rd
    });

    it("request at limit (4th) is rate limited", () => {
      const ip = "192.168.1.3";

      // First 3 requests allowed
      rateLimit(ip); // 1st
      rateLimit(ip); // 2nd
      rateLimit(ip); // 3rd

      // 4th request should be blocked
      expect(rateLimit(ip)).toBe(true);
    });

    it("subsequent requests after limit are also blocked", () => {
      const ip = "192.168.1.4";

      // Exhaust limit
      rateLimit(ip); // 1st
      rateLimit(ip); // 2nd
      rateLimit(ip); // 3rd

      // All subsequent should be blocked
      expect(rateLimit(ip)).toBe(true); // 4th
      expect(rateLimit(ip)).toBe(true); // 5th
      expect(rateLimit(ip)).toBe(true); // 6th
    });

    it("window reset after expiry allows new requests", () => {
      const ip = "192.168.1.5";

      // Exhaust limit
      rateLimit(ip); // 1st
      rateLimit(ip); // 2nd
      rateLimit(ip); // 3rd
      expect(rateLimit(ip)).toBe(true); // 4th - blocked

      // Advance time past window (15 minutes + 1ms)
      vi.advanceTimersByTime(RATE_LIMIT_WINDOW_MS + 1);

      // Should be allowed again
      expect(rateLimit(ip)).toBe(false);
    });

    it("partial window advance does not reset limit", () => {
      const ip = "192.168.1.6";

      // Exhaust limit
      rateLimit(ip);
      rateLimit(ip);
      rateLimit(ip);
      expect(rateLimit(ip)).toBe(true);

      // Advance time but not past window (10 minutes)
      vi.advanceTimersByTime(600_000);

      // Still blocked
      expect(rateLimit(ip)).toBe(true);
    });

    it("different IPs have independent buckets", () => {
      const ip1 = "192.168.1.10";
      const ip2 = "192.168.1.11";
      const ip3 = "10.0.0.1";

      // Exhaust IP1's limit
      rateLimit(ip1);
      rateLimit(ip1);
      rateLimit(ip1);
      expect(rateLimit(ip1)).toBe(true); // IP1 blocked

      // IP2 should still have full quota
      expect(rateLimit(ip2)).toBe(false); // 1st
      expect(rateLimit(ip2)).toBe(false); // 2nd
      expect(rateLimit(ip2)).toBe(false); // 3rd
      expect(rateLimit(ip2)).toBe(true); // 4th - blocked

      // IP3 should also have full quota
      expect(rateLimit(ip3)).toBe(false);
    });

    it("bucket is created on first request", () => {
      const ip = "192.168.1.20";
      expect(buckets.has(ip)).toBe(false);

      rateLimit(ip);

      expect(buckets.has(ip)).toBe(true);
      expect(buckets.get(ip)?.count).toBe(1);
    });

    it("bucket count increments correctly", () => {
      const ip = "192.168.1.21";

      rateLimit(ip);
      expect(buckets.get(ip)?.count).toBe(1);

      rateLimit(ip);
      expect(buckets.get(ip)?.count).toBe(2);

      rateLimit(ip);
      expect(buckets.get(ip)?.count).toBe(3);

      // After hitting limit, count should stay at 3 (not increment further)
      rateLimit(ip);
      expect(buckets.get(ip)?.count).toBe(3);
    });

    it("window resets with new timestamp after expiry", () => {
      const ip = "192.168.1.22";
      const initialTime = Date.now();

      rateLimit(ip);
      const firstWindowStart = buckets.get(ip)?.windowStart;
      expect(firstWindowStart).toBe(initialTime);

      // Advance past window
      vi.advanceTimersByTime(RATE_LIMIT_WINDOW_MS + 1);
      const newTime = Date.now();

      rateLimit(ip);
      const secondWindowStart = buckets.get(ip)?.windowStart;

      expect(secondWindowStart).toBe(newTime);
      expect(secondWindowStart).not.toBe(firstWindowStart);
    });
  });

  describe("Edge cases", () => {
    it("handles empty string key", () => {
      // Edge case: empty IP (shouldn't happen but test robustness)
      expect(rateLimit("")).toBe(false);
      expect(rateLimit("")).toBe(false);
      expect(rateLimit("")).toBe(false);
      expect(rateLimit("")).toBe(true);
    });

    it("handles IPv6 addresses", () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";

      expect(rateLimit(ipv6)).toBe(false);
      expect(rateLimit(ipv6)).toBe(false);
      expect(rateLimit(ipv6)).toBe(false);
      expect(rateLimit(ipv6)).toBe(true);
    });

    it("handles very rapid requests", () => {
      const ip = "192.168.1.30";

      // Simulate rapid-fire requests (no time advance between them)
      expect(rateLimit(ip)).toBe(false);
      expect(rateLimit(ip)).toBe(false);
      expect(rateLimit(ip)).toBe(false);
      expect(rateLimit(ip)).toBe(true);
    });
  });
});
