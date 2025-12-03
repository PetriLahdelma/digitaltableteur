/**
 * Security Access Logger
 * Logs all authentication attempts and security-sensitive API access
 * Integrates with Sentry for alerting
 */

import * as Sentry from "@sentry/nextjs";

export interface AccessLogEntry {
  timestamp: string;
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
  success: boolean;
  userId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export enum SecurityEventType {
  AUTH_SUCCESS = "auth_success",
  AUTH_FAILED = "auth_failed",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  DATA_ACCESS = "data_access",
  DATA_MODIFICATION = "data_modification",
  DATA_DELETION = "data_deletion",
}

export class SecurityLogger {
  private static logToConsole(entry: AccessLogEntry) {
    const logLevel = entry.success ? "info" : "warn";
    console[logLevel](
      `[SECURITY] ${entry.timestamp} | ${entry.method} ${entry.endpoint} | IP: ${entry.ip} | Success: ${entry.success}${entry.reason ? ` | Reason: ${entry.reason}` : ""}`,
    );
  }

  private static logToSentry(
    eventType: SecurityEventType,
    entry: AccessLogEntry,
  ) {
    if (!entry.success) {
      // Log failures as Sentry events for alerting
      Sentry.captureEvent({
        message: `Security Event: ${eventType}`,
        level: this.getSentryLevel(eventType),
        tags: {
          security_event: eventType,
          endpoint: entry.endpoint,
          ip: entry.ip,
        },
        extra: {
          access_log: entry,
        },
      });
    }
  }

  private static getSentryLevel(
    eventType: SecurityEventType,
  ): Sentry.SeverityLevel {
    switch (eventType) {
      case SecurityEventType.AUTH_FAILED:
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return "warning";
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        return "error";
      default:
        return "info";
    }
  }

  /**
   * Log authentication attempt
   */
  static logAuthAttempt(
    ip: string,
    userAgent: string,
    endpoint: string,
    success: boolean,
    reason?: string,
    userId?: string,
  ) {
    const entry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      endpoint,
      method: "POST",
      success,
      reason,
      userId,
    };

    this.logToConsole(entry);
    this.logToSentry(
      success ? SecurityEventType.AUTH_SUCCESS : SecurityEventType.AUTH_FAILED,
      entry,
    );
  }

  /**
   * Log rate limit exceeded
   */
  static logRateLimitExceeded(
    ip: string,
    userAgent: string,
    endpoint: string,
    metadata?: Record<string, unknown>,
  ) {
    const entry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      endpoint,
      method: "POST",
      success: false,
      reason: "Rate limit exceeded",
      metadata,
    };

    this.logToConsole(entry);
    this.logToSentry(SecurityEventType.RATE_LIMIT_EXCEEDED, entry);
  }

  /**
   * Log data access
   */
  static logDataAccess(
    ip: string,
    userAgent: string,
    endpoint: string,
    method: string,
    success: boolean,
    metadata?: Record<string, unknown>,
  ) {
    const entry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      endpoint,
      method,
      success,
      metadata,
    };

    this.logToConsole(entry);
    if (!success) {
      this.logToSentry(SecurityEventType.DATA_ACCESS, entry);
    }
  }

  /**
   * Log suspicious activity
   */
  static logSuspiciousActivity(
    ip: string,
    userAgent: string,
    endpoint: string,
    reason: string,
    metadata?: Record<string, unknown>,
  ) {
    const entry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      endpoint,
      method: "UNKNOWN",
      success: false,
      reason,
      metadata,
    };

    this.logToConsole(entry);
    this.logToSentry(SecurityEventType.SUSPICIOUS_ACTIVITY, entry);
  }

  /**
   * Log GDPR data deletion request
   */
  static logDataDeletion(
    ip: string,
    userAgent: string,
    email: string,
    success: boolean,
    reason?: string,
  ) {
    const entry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      endpoint: "/api/gdpr/delete-data",
      method: "POST",
      success,
      reason,
      metadata: { email },
    };

    this.logToConsole(entry);
    this.logToSentry(SecurityEventType.DATA_DELETION, entry);
  }
}

/**
 * Helper to extract client IP from request
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP (in order of trust)
  const headers = request.headers;

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take first IP in the chain
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return "unknown";
}

/**
 * Helper to extract user agent
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}
