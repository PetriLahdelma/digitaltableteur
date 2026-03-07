/**
 * HTML sanitization utilities backed by sanitize-html.
 *
 * These helpers are shared across API routes, structured data generation,
 * chat output filtering, and CMS content rendering.
 */

import sanitizeHtml from "sanitize-html";

type SanitizeConfig = Parameters<typeof sanitizeHtml>[1];

const SHARED_ALLOWED_SCHEMES = ["http", "https", "mailto", "tel"];

const STRICT_HTML_CONFIG: SanitizeConfig = {
  allowedTags: sanitizeHtml.defaults.allowedTags.filter(
    (tag: string) => !["style"].includes(tag),
  ),
  disallowedTagsMode: "discard",
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
  },
  allowedSchemes: SHARED_ALLOWED_SCHEMES,
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  parser: {
    lowerCaseAttributeNames: false,
  },
};

const AI_OUTPUT_CONFIG: SanitizeConfig = {
  allowedTags: ["a", "b", "blockquote", "br", "code", "em", "i", "li", "ol", "p", "pre", "strong", "ul"],
  allowedAttributes: {
    a: ["href", "rel", "target", "title"],
  },
  allowedSchemes: SHARED_ALLOWED_SCHEMES,
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
};

const RICH_TEXT_CONFIG: SanitizeConfig = {
  allowedTags: [
    "a",
    "blockquote",
    "br",
    "caption",
    "code",
    "em",
    "figcaption",
    "figure",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target", "title"],
    img: ["alt", "height", "loading", "src", "title", "width"],
  },
  allowedSchemes: SHARED_ALLOWED_SCHEMES,
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
};

function sanitizeMarkup(input: string, config: SanitizeConfig): string {
  return sanitizeHtml(input, config);
}

function sanitizeJsonLdValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replaceAll("&", "\\u0026")
      .replaceAll("<", "\\u003c")
      .replaceAll(">", "\\u003e")
      .replaceAll("\u2028", "\\u2028")
      .replaceAll("\u2029", "\\u2029");
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonLdValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sanitizeJsonLdValue(nestedValue),
      ]),
    );
  }

  return value;
}

/**
 * Sanitize strict HTML content for user-provided or AI-provided markup.
 */
export function sanitizeHTML(html: string): string {
  return sanitizeMarkup(html, STRICT_HTML_CONFIG);
}

/**
 * Sanitize JSON-LD so it remains valid JSON while neutralizing script-breaking characters.
 */
export function sanitizeJsonLd(jsonLd: string): string {
  try {
    const parsed = JSON.parse(jsonLd);
    return JSON.stringify(sanitizeJsonLdValue(parsed));
  } catch (error) {
    console.error("[sanitize] Invalid JSON-LD:", error);
    return "{}";
  }
}

/**
 * Sanitize AI-generated text output while preserving a small, safe HTML subset.
 */
export function sanitizeAiOutput(text: string): string {
  return sanitizeMarkup(text, AI_OUTPUT_CONFIG);
}

/**
 * Sanitize CMS / article rich text while preserving safe formatting primitives.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeMarkup(html, RICH_TEXT_CONFIG);
}

/**
 * Escape HTML entities for safe display in text nodes.
 */
export function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
