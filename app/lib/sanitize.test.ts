/**
 * Test suite for HTML sanitization utilities
 * Verifies DOMPurify integration prevents XSS attacks
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeHTML,
  sanitizeJsonLd,
  sanitizeAiOutput,
  sanitizeRichText,
  escapeHTML,
} from './sanitize';

describe('sanitizeHTML', () => {
  it('removes script tags', () => {
    const dirty = '<p>Hello</p><script>alert("XSS")</script>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Hello</p>');
  });

  it('removes event handlers', () => {
    const dirty = '<button onclick="alert(\'XSS\')">Click</button>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('onclick');
  });

  it('removes javascript: protocol', () => {
    const dirty = '<a href="javascript:alert(\'XSS\')">Link</a>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('javascript:');
  });

  it('allows safe HTML tags', () => {
    const safe = '<p>Hello <strong>world</strong></p><a href="https://example.com">Link</a>';
    const clean = sanitizeHTML(safe);
    expect(clean).toContain('<p>');
    expect(clean).toContain('<strong>');
    expect(clean).toContain('<a href="https://example.com">');
  });

  it('sanitizes dangerous event handlers on img tags', () => {
    // Test the real XSS vector: onerror attribute, not data URIs
    const dirty = '<img src="x" onerror="alert(\'XSS\')">';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('alert');
  });
});

describe('sanitizeJsonLd', () => {
  it('validates and returns valid JSON', () => {
    const valid = '{"@context":"https://schema.org","@type":"Organization"}';
    const clean = sanitizeJsonLd(valid);
    expect(clean).toBe(valid);
  });

  it('returns empty object for invalid JSON', () => {
    const invalid = '{invalid json}';
    const clean = sanitizeJsonLd(invalid);
    expect(clean).toBe('{}');
  });

  it('removes embedded HTML tags', () => {
    const dirty = '{"name":"<script>alert(\\"XSS\\")</script>Test"}';
    const clean = sanitizeJsonLd(dirty);
    expect(clean).not.toContain('<script>');
  });
});

describe('sanitizeAiOutput', () => {
  it('removes script tags from AI responses', () => {
    const dirty = 'Here is your answer: <script>alert("XSS")</script>';
    const clean = sanitizeAiOutput(dirty);
    expect(clean).not.toContain('<script>');
  });

  it('removes event handlers', () => {
    const dirty = '<div onclick="alert(\'XSS\')">Click me</div>';
    const clean = sanitizeAiOutput(dirty);
    expect(clean).not.toContain('onclick');
  });

  it('allows basic formatting', () => {
    const safe = '<p>Hello <strong>world</strong></p>';
    const clean = sanitizeAiOutput(safe);
    expect(clean).toContain('<p>');
    expect(clean).toContain('<strong>');
  });

  it('removes javascript: protocol', () => {
    const dirty = '<a href="javascript:void(0)">Link</a>';
    const clean = sanitizeAiOutput(dirty);
    expect(clean).not.toContain('javascript:');
  });
});

describe('sanitizeRichText', () => {
  it('allows rich formatting and images', () => {
    const rich = `
      <h2>Title</h2>
      <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
      <img src="https://example.com/image.jpg" alt="Test">
      <table><tr><td>Cell</td></tr></table>
    `;
    const clean = sanitizeRichText(rich);
    expect(clean).toContain('<h2>');
    expect(clean).toContain('<strong>');
    expect(clean).toContain('<img');
    expect(clean).toContain('<table>');
  });

  it('removes dangerous content from rich text', () => {
    const dirty = '<p>Safe</p><script>alert("XSS")</script>';
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Safe</p>');
  });
});

describe('escapeHTML', () => {
  it('escapes HTML entities', () => {
    const text = '<script>alert("XSS")</script>';
    const escaped = escapeHTML(text);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('escapes ampersands', () => {
    const text = 'A & B';
    const escaped = escapeHTML(text);
    expect(escaped).toBe('A &amp; B');
  });

  it('escapes quotes', () => {
    const text = `He said "Hello" and 'Goodbye'`;
    const escaped = escapeHTML(text);
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&#039;');
  });
});
