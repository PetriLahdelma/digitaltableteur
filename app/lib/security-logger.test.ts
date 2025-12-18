import { describe, it, expect, vi, beforeEach } from "vitest";
import { SecurityLogger, SecurityEventType } from "./security-logger";
import type { AccessLogEntry } from "./security-logger";

vi.mock("@sentry/nextjs", () => ({
  captureEvent: vi.fn(),
}));

describe("SecurityLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
