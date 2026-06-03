/**
 * Prompt Injection Guardrails
 *
 * Protects AI chat endpoints from prompt extraction attacks and malicious queries.
 * Implements multi-layered defense:
 * - Keyword filtering for sensitive terms
 * - Pattern detection for extraction attempts
 * - Rate limiting for suspicious behavior
 * - Sentry logging for security monitoring
 */

import * as Sentry from "@sentry/nextjs";
import { sanitizeAiOutput as sanitizeHTML } from "./sanitize";

// ===== TYPES =====

// Suspicious keywords that indicate prompt extraction attempts
const SENSITIVE_KEYWORDS = [
  // Environment & secrets
  "env",
  "environment",
  "variable",
  "key",
  "token",
  "secret",
  "password",
  "api_key",
  "apikey",
  "api-key",
  "credential",
  "auth",

  // System instructions
  "system",
  "instruction",
  "prompt",
  "directive",
  "rule",
  "guidelines",
  "previous",
  "ignore",
  "disregard",
  "forget",
  "override",

  // Data exfiltration
  "log",
  "logs",
  "debug",
  "console",
  "output",
  "dump",
  "export",
  "database",
  "db",
  "mongo",
  "sql",
  "query",

  // Process/server probing
  "process",
  "runtime",
  "server",
  "config",
  "configuration",
  "settings",
  "admin",
  "root",
  "sudo",
];

const EXTRACTION_PHRASE_GROUPS = [
  ["ignore", "instruction"],
  ["ignore", "prompt"],
  ["show me", "prompt"],
  ["show me", "instruction"],
  ["show me", "system"],
  ["tell me", "configuration"],
  ["output", "environment"],
  ["output", "secret"],
  ["repeat", "prompt"],
  ["repeat", "system"],
  ["summarize", "instruction"],
  ["list", "environment"],
  ["display", "secret"],
  ["what are your", "system"],
  ["what are your", "rules"],
  // Persona hijacking / jailbreak patterns (all require 2+ matching terms)
  ["pretend", "you are"],
  ["act as", "different"],
  ["you are now", "my new"],
  ["roleplay", "as"],
  ["ignore", "previous"],
  ["ignore", "above"],
  ["disregard", "instruction"],
  ["disregard", "rules"],
  ["forget", "rules"],
  ["forget", "instruction"],
  ["new persona", "adopt"],
  ["jailbreak", "mode"],
  ["developer mode", "enabled"],
  ["override", "safety"],
  ["bypass", "filter"],
];

const EXTRACTION_LITERALS = [
  "process.env",
  "console.log",
  "console.debug",
  "console.error",
  "console.warn",
  "ignore all previous instructions",
  "ignore your instructions",
  "disregard all prior",
];

function hasExtractionPattern(lowerPrompt: string): boolean {
  if (EXTRACTION_LITERALS.some((literal) => lowerPrompt.includes(literal))) {
    return true;
  }

  if (
    (lowerPrompt.includes("env variable") ||
      lowerPrompt.includes("environment variable") ||
      lowerPrompt.includes("env var")) &&
    lowerPrompt.includes("=")
  ) {
    return true;
  }

  return EXTRACTION_PHRASE_GROUPS.some((requiredTerms) => {
    const terms = requiredTerms.filter((term) => term.length > 0);
    return terms.length >= 2 && terms.every((term) => lowerPrompt.includes(term));
  });
}

// Rate limiting for suspicious prompts
const suspiciousPromptBuckets = new Map<
  string,
  { count: number; windowStart: number }
>();
const SUSPICIOUS_WINDOW_MS = 300_000; // 5 minutes
const SUSPICIOUS_MAX_ATTEMPTS = 3; // attempts per window per IP

export interface GuardrailCheckResult {
  isBlocked: boolean;
  reason?: string;
  suspicionLevel: "none" | "low" | "medium" | "high";
}

/**
 * Checks if a user prompt contains potential prompt injection attempts
 */
export function checkPromptInjection(
  prompt: string,
  ipAddress?: string,
): GuardrailCheckResult {
  const lowerPrompt = prompt.toLowerCase();
  const trimmedPrompt = prompt.trim();

  // Empty or very short prompts are safe
  if (trimmedPrompt.length < 3) {
    return { isBlocked: false, suspicionLevel: "none" };
  }

  // Check for extraction patterns (high severity)
  if (hasExtractionPattern(lowerPrompt)) {
    logSecurityEvent({
      type: "prompt_injection_blocked",
      severity: "high",
      reason: "Extraction pattern detected",
      promptLength: prompt.length,
      ipAddress,
    });

    return {
      isBlocked: true,
      reason:
        "Your message contains language that looks like a system command. Please rephrase your question.",
      suspicionLevel: "high",
    };
  }

  // Check for multiple sensitive keywords (medium severity)
  const foundKeywords = SENSITIVE_KEYWORDS.filter((keyword) =>
    lowerPrompt.includes(keyword),
  );

  if (foundKeywords.length >= 3) {
    logSecurityEvent({
      type: "prompt_injection_suspicious",
      severity: "medium",
      reason: "Multiple sensitive keywords",
      keywords: foundKeywords,
      promptLength: prompt.length,
      ipAddress,
    });

    // Rate limit based on IP
    if (ipAddress && isSuspiciousRateLimited(ipAddress)) {
      return {
        isBlocked: true,
        reason: "Too many unusual requests. Please try again in a few minutes.",
        suspicionLevel: "high",
      };
    }

    // Don't block immediately, but track
    if (ipAddress) {
      trackSuspiciousPrompt(ipAddress);
    }

    return {
      isBlocked: false,
      suspicionLevel: "medium",
    };
  }

  // Check for single high-risk keyword combinations
  const hasEnvKeyword =
    lowerPrompt.includes("env") || lowerPrompt.includes("environment");
  const hasSecretKeyword =
    lowerPrompt.includes("key") ||
    lowerPrompt.includes("token") ||
    lowerPrompt.includes("secret");

  if (hasEnvKeyword && hasSecretKeyword) {
    logSecurityEvent({
      type: "prompt_injection_suspicious",
      severity: "low",
      reason: "Environment + secret keyword combination",
      promptLength: prompt.length,
      ipAddress,
    });

    return {
      isBlocked: false,
      suspicionLevel: "low",
    };
  }

  return { isBlocked: false, suspicionLevel: "none" };
}

/**
 * Sanitizes AI output before storing in database
 * Delegates to DOMPurify-based sanitization for defense-in-depth
 */
export function sanitizeAiOutput(output: string): string {
  return sanitizeHTML(output);
}

/**
 * Strips potential secret leakage from AI responses
 * Applied as additional safety layer before sending to client
 */
export function stripSecretsFromResponse(response: string): string {
  // Remove anything that looks like environment variables
  let cleaned = response.replace(/[A-Z_]{3,}=[^\s\n]*/g, "[REDACTED]");

  // Remove anything that looks like API keys (32+ chars)
  cleaned = cleaned.replace(/\b[a-zA-Z0-9_-]{32,}\b/g, "[REDACTED]");

  // Remove shorter secret-like strings (15+ chars with underscores/hyphens)
  cleaned = cleaned.replace(/\b[a-zA-Z0-9_-]{15,}\b/g, (match) => {
    // Only redact if it contains both letters, numbers, and special chars
    if (/[a-zA-Z]/.test(match) && /[0-9]/.test(match) && /[_-]/.test(match)) {
      return "[REDACTED]";
    }
    return match;
  });

  // Remove potential tokens
  cleaned = cleaned.replace(
    /\b(sk|pk|tok|api|key)[-_][a-zA-Z0-9_-]{20,}\b/gi,
    "[REDACTED]",
  );

  return cleaned;
}

// Rate limiting helpers
function trackSuspiciousPrompt(ipAddress: string) {
  const now = Date.now();
  const bucket = suspiciousPromptBuckets.get(ipAddress);

  if (!bucket || now - bucket.windowStart > SUSPICIOUS_WINDOW_MS) {
    suspiciousPromptBuckets.set(ipAddress, { count: 1, windowStart: now });
  } else {
    bucket.count += 1;
  }
}

function isSuspiciousRateLimited(ipAddress: string): boolean {
  const now = Date.now();
  const bucket = suspiciousPromptBuckets.get(ipAddress);

  if (!bucket || now - bucket.windowStart > SUSPICIOUS_WINDOW_MS) {
    return false;
  }

  return bucket.count >= SUSPICIOUS_MAX_ATTEMPTS;
}

// Security event logging
function logSecurityEvent(event: {
  type: string;
  severity: string;
  reason: string;
  promptLength: number;
  ipAddress?: string;
  pattern?: string;
  keywords?: string[];
}) {
  console.warn("[SECURITY]", event);

  Sentry.captureMessage(`Prompt injection attempt: ${event.reason}`, {
    level: event.severity === "high" ? "warning" : "info",
    tags: {
      security_event: event.type,
      severity: event.severity,
    },
    extra: {
      ...event,
      timestamp: new Date().toISOString(),
    },
  });
}
