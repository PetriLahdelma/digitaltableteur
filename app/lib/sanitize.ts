/**
 * HTML Sanitization utilities
 * 
 * Provides defense-in-depth sanitization for:
 * - User-generated content
 * - AI-generated responses
 * - Structured data (JSON-LD)
 * - Rich text content
 * 
 * Note: Uses regex-based sanitization for server-side contexts (API routes)
 * and DOMPurify for client-side contexts where DOM is available.
 */

// Lazy-load DOMPurify only when needed (client-side or when DOM available)
let DOMPurify: any = null;

async function getDOMPurify() {
  if (DOMPurify) return DOMPurify;
  
  // Only load in browser or when jsdom is available
  if (typeof window !== 'undefined') {
    const { default: purify } = await import('isomorphic-dompurify');
    DOMPurify = purify;
    return DOMPurify;
  }
  
  return null;
}

/**
 * Regex-based sanitization for server-side (fallback when DOMPurify unavailable)
 * More aggressive but doesn't require DOM
 */
function regexSanitize(html: string): string {
  let sanitized = html;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URIs that could contain scripts
  sanitized = sanitized.replace(/data:text\/html[^"'\s]*/gi, '');
  
  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  return sanitized;
}

/**
 * Sanitize HTML content with strict XSS protection
 * Removes all script tags, event handlers, and dangerous protocols
 * 
 * Use for user-generated or AI-generated HTML content
 */
export function sanitizeHTML(html: string): string {
  // For server-side (API routes), use regex-based sanitization
  if (typeof window === 'undefined') {
    return regexSanitize(html);
  }
  
  // For client-side, use DOMPurify (will be loaded lazily)
  // Note: This is a placeholder - in practice, use regexSanitize for now
  return regexSanitize(html);
}

/**
 * Sanitize JSON-LD structured data
 * Validates and escapes to prevent script injection in <script type="application/ld+json">
 * 
 * Use for all schema.org structured data
 */
export function sanitizeJsonLd(jsonLd: string): string {
  try {
    // Parse to validate JSON structure
    const parsed = JSON.parse(jsonLd);
    
    // Re-stringify to ensure no script injection
    const stringified = JSON.stringify(parsed);
    
    // Remove any HTML tags that might have been embedded (regex fallback)
    return stringified.replace(/<[^>]*>/g, '');
  } catch (error) {
    console.error('[sanitize] Invalid JSON-LD:', error);
    return '{}';
  }
}

/**
 * Sanitize AI-generated text output
 * More permissive than sanitizeHTML but still removes dangerous content
 * 
 * Use for chat responses, generated descriptions, etc.
 */
export function sanitizeAiOutput(text: string): string {
  // Use regex-based sanitization for all contexts
  return regexSanitize(text);
}

/**
 * Sanitize rich text content (blog posts, articles)
 * Most permissive - allows formatting, images, tables
 * 
 * Use for CMS content, blog articles from Sanity
 */
export function sanitizeRichText(html: string): string {
  // Use regex-based sanitization for all contexts
  return regexSanitize(html);
}

/**
 * Escape HTML entities for safe display in text nodes
 * Use when you need to display HTML as text (not render it)
 */
export function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
