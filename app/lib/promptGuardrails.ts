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

/**
 * Domain vocabulary on a design-systems site. "system" and "token" are
 * extraction words on their own, but "design system(s)" and "design token(s)"
 * are the site's subject: "Show me your design system projects" was blocked
 * in production (2026-10-14). These phrases are removed before matching,
 * except when followed by an extraction noun, so "repeat the design system
 * message" cannot be used to smuggle "system" past the check.
 */
const DOMAIN_PHRASE_PATTERN =
  /\bdesign[\s_-]*(?:systems?|tokens?)\b(?![\s_-]*(?:prompts?|instructions?|messages?|directives?|guidelines?|config))|\bsystems?[\s_-]+design\b/g;

/** Invisible format characters (zero-width space/joiner, soft hyphen, BOM...). */
const FORMAT_CHARS = /\p{Cf}/gu;

/**
 * Text as the model effectively reads it: NFKC folds fullwidth and other
 * compatibility forms ("ｐｒｏｍｐｔ" -> "prompt"), and invisible characters
 * are removed ("pro\u200Bmpt" -> "prompt"), so the check and the model do not
 * see different words.
 */
export function normalizeForGuardrails(prompt: string): string {
  return prompt
    .normalize("NFKC")
    .replace(FORMAT_CHARS, "")
    .toLowerCase()
    .replace(DOMAIN_PHRASE_PATTERN, " ");
}

/** Letters and digits only, for glued text ("showmeyoursystemprompt"). */
function squash(text: string): string {
  return text.replace(/[^\p{L}\p{N}]+/gu, "");
}

/**
 * Extraction phrases use substring matching on purpose, so glued and
 * camelCase forms ("IgnorePreviousInstructions", "systemprompt") still match.
 * Multi-word terms ("show me") also match with the spaces squashed out.
 */
function containsExtractionTerm(text: string, squashed: string, term: string): boolean {
  if (text.includes(term)) return true;
  return term.includes(" ") && squashed.includes(squash(term));
}

/**
 * Whole-word match, plural allowed, for the sensitive-keyword count only.
 * Substring counting read "blog" and "catalog" as "log" and "author" as
 * "auth"; three hits are "suspicious" and three suspicious messages in five
 * minutes lock the visitor out. "_" is a separator, so "SYSTEM_OVERRIDE"
 * still counts "system" and "override".
 */
const termPatternCache = new Map<string, RegExp>();
function termPattern(term: string): RegExp {
  let pattern = termPatternCache.get(term);
  if (!pattern) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}s?(?![\\p{L}\\p{N}])`, "u");
    termPatternCache.set(term, pattern);
  }
  return pattern;
}

function hasTerm(text: string, term: string): boolean {
  return termPattern(term).test(text);
}

function hasExtractionPattern(lowerPrompt: string): boolean {
  const squashed = squash(lowerPrompt);
  if (
    EXTRACTION_LITERALS.some(
      (literal) => lowerPrompt.includes(literal) || squashed.includes(squash(literal)),
    )
  ) {
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
    return (
      terms.length >= 2 &&
      terms.every((term) => containsExtractionTerm(lowerPrompt, squashed, term))
    );
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
  const lowerPrompt = normalizeForGuardrails(prompt);
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
    hasTerm(lowerPrompt, keyword),
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
    hasTerm(lowerPrompt, "env") || hasTerm(lowerPrompt, "environment");
  const hasSecretKeyword =
    hasTerm(lowerPrompt, "key") ||
    hasTerm(lowerPrompt, "token") ||
    hasTerm(lowerPrompt, "secret");

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
 * Delegates to the sanitize-html helpers for defense-in-depth
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
    // No client IP in Sentry: it is personal data, and the per-IP rate limit
    // already acts on it in memory. The console line keeps it in Vercel logs.
    extra: {
      type: event.type,
      severity: event.severity,
      reason: event.reason,
      promptLength: event.promptLength,
      pattern: event.pattern,
      keywords: event.keywords,
      timestamp: new Date().toISOString(),
    },
  });
}
