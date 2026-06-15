import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { SecurityLogger } from "./security-logger";
import type { AccessLogEntry } from "./security-logger";

vi.mock("@sentry/nextjs", () => ({
  captureEvent: vi.fn(),
}));

describe("SecurityLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockEntry: AccessLogEntry = {
    timestamp: new Date().toISOString(),
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    endpoint: "/api/test",
    method: "POST",
    success: true,
  };

  describe("logAuthAttempt", () => {
    it("logs successful auth attempts", () => {
      const consoleSpy = vi.spyOn(console, "info");
      SecurityLogger.logAuthAttempt(
        mockEntry.ip,
        mockEntry.userAgent,
        mockEntry.endpoint,
        true,
      );
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("logs failed auth attempts", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      SecurityLogger.logAuthAttempt(
        mockEntry.ip,
        mockEntry.userAgent,
        mockEntry.endpoint,
        false,
        "Invalid credentials",
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("logDataAccess", () => {
    it("logs data access events", () => {
      const consoleSpy = vi.spyOn(console, "info");
      SecurityLogger.logDataAccess(
        mockEntry.ip,
        mockEntry.userAgent,
        mockEntry.endpoint,
        "GET",
        true,
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("logSuspiciousActivity", () => {
    it("logs suspicious activity", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      SecurityLogger.logSuspiciousActivity(
        mockEntry.ip,
        mockEntry.userAgent,
        mockEntry.endpoint,
        "Prompt injection attempt",
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("logRateLimitExceeded", () => {
    it("logs rate limit violations", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      SecurityLogger.logRateLimitExceeded(
        mockEntry.ip,
        mockEntry.userAgent,
        mockEntry.endpoint,
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("PII redaction", () => {
    it("hashes identifiers before sending failure events to Sentry", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});

      SecurityLogger.logDataDeletion(
        "203.0.113.10",
        "Mozilla/5.0 Raw Agent",
        "person@example.com",
        false,
        "Invalid request",
      );

      const event = vi.mocked(Sentry.captureEvent).mock.calls[0]?.[0] as any;
      const serialized = JSON.stringify(event);

      expect(serialized).not.toContain("person@example.com");
      expect(serialized).not.toContain("203.0.113.10");
      expect(serialized).not.toContain("Mozilla/5.0 Raw Agent");
      expect(event.tags.ip).toBeUndefined();
      expect(event.tags.ip_hash).toMatch(/^sha256:[a-f0-9]{16}$/);
      expect(event.extra.access_log.ip).toMatch(/^sha256:[a-f0-9]{16}$/);
      expect(event.extra.access_log.userAgent).toMatch(
        /^sha256:[a-f0-9]{16}$/,
      );
      expect(event.extra.access_log.metadata.emailHash).toMatch(
        /^sha256:[a-f0-9]{16}$/,
      );
    });

    it("sanitizes sensitive metadata before sending failure events to Sentry", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});

      SecurityLogger.logDataAccess(
        "203.0.113.11",
        "Mozilla/5.0",
        "/api/save-contact",
        "POST",
        false,
        {
          email: "lead@example.com",
          message: "Raw inquiry text",
          reason: "Invalid form data",
        },
      );

      const event = vi.mocked(Sentry.captureEvent).mock.calls[0]?.[0] as any;
      const metadata = event.extra.access_log.metadata;
      const serialized = JSON.stringify(event);

      expect(serialized).not.toContain("lead@example.com");
      expect(serialized).not.toContain("Raw inquiry text");
      expect(metadata.email).toMatch(/^sha256:[a-f0-9]{16}$/);
      expect(metadata.message).toBe("[redacted]");
      expect(metadata.reason).toBe("Invalid form data");
    });
  });
});
