/**
 * Security Tests: CORS Origin Validation
 *
 * Tests the CORS validation functions from chat-shared.ts:
 * - resolveAllowedOrigin(origin) - Validates and returns appropriate origin
 * - createCorsHeaders(origin) - Generates complete CORS headers
 *
 * Key security patterns tested:
 * - Known origins are echoed back (allowedOrigins list)
 * - Dev origins (localhost, private IPs) are allowed
 * - Unknown/malicious origins get fallback (first allowed origin)
 * - Vary: Origin header prevents CDN caching issues
 *
 * @see app/api/chat-shared.ts
 */

import { describe, it, expect } from "vitest";
import {
  resolveAllowedOrigin,
  createCorsHeaders,
  allowedOrigins,
} from "../api/chat-shared";

describe("Security: CORS Origin Validation", () => {
  describe("resolveAllowedOrigin()", () => {
    const fallback = allowedOrigins[0]; // "https://digitaltableteur.com"

    describe("allowed origins", () => {
      it("returns origin when in allowedOrigins list", () => {
        // Test all allowed origins
        for (const origin of allowedOrigins) {
          expect(resolveAllowedOrigin(origin)).toBe(origin);
        }
      });

      it("returns production origin correctly", () => {
        expect(resolveAllowedOrigin("https://digitaltableteur.com")).toBe(
          "https://digitaltableteur.com",
        );
        expect(resolveAllowedOrigin("https://www.digitaltableteur.com")).toBe(
          "https://www.digitaltableteur.com",
        );
      });
    });

    describe("localhost variants", () => {
      it("returns origin for localhost", () => {
        expect(resolveAllowedOrigin("http://localhost:3000")).toBe(
          "http://localhost:3000",
        );
        expect(resolveAllowedOrigin("http://localhost:5173")).toBe(
          "http://localhost:5173",
        );
        expect(resolveAllowedOrigin("http://localhost:6006")).toBe(
          "http://localhost:6006",
        );
      });

      it("returns origin for 127.0.0.1", () => {
        expect(resolveAllowedOrigin("http://127.0.0.1:3000")).toBe(
          "http://127.0.0.1:3000",
        );
        expect(resolveAllowedOrigin("http://127.0.0.1:8080")).toBe(
          "http://127.0.0.1:8080",
        );
      });

      it("returns origin for IPv6 localhost (::1)", () => {
        expect(resolveAllowedOrigin("http://[::1]:3000")).toBe(
          "http://[::1]:3000",
        );
      });

      it("returns origin for .local domains", () => {
        expect(resolveAllowedOrigin("http://mycomputer.local:3000")).toBe(
          "http://mycomputer.local:3000",
        );
      });
    });

    describe("private network IPs", () => {
      it("returns origin for 192.168.x.x addresses", () => {
        expect(resolveAllowedOrigin("http://192.168.1.1:3000")).toBe(
          "http://192.168.1.1:3000",
        );
        expect(resolveAllowedOrigin("http://192.168.0.100:5173")).toBe(
          "http://192.168.0.100:5173",
        );
        expect(resolveAllowedOrigin("http://192.168.255.255:8080")).toBe(
          "http://192.168.255.255:8080",
        );
      });

      it("returns origin for 10.x.x.x addresses", () => {
        expect(resolveAllowedOrigin("http://10.0.0.1:3000")).toBe(
          "http://10.0.0.1:3000",
        );
        expect(resolveAllowedOrigin("http://10.255.255.255:5173")).toBe(
          "http://10.255.255.255:5173",
        );
      });

      it("returns origin for 172.16-31.x.x addresses", () => {
        expect(resolveAllowedOrigin("http://172.16.0.1:3000")).toBe(
          "http://172.16.0.1:3000",
        );
        expect(resolveAllowedOrigin("http://172.31.255.255:5173")).toBe(
          "http://172.31.255.255:5173",
        );
      });
    });

    describe("invalid/unknown origins", () => {
      it("returns fallback for unknown origins", () => {
        expect(resolveAllowedOrigin("https://unknown.com")).toBe(fallback);
        expect(resolveAllowedOrigin("http://example.org")).toBe(fallback);
      });

      it("returns fallback for malicious origins", () => {
        expect(resolveAllowedOrigin("https://attacker.com")).toBe(fallback);
        expect(resolveAllowedOrigin("https://evil-site.io")).toBe(fallback);
        expect(
          resolveAllowedOrigin("https://digitaltableteur.com.attacker.com"),
        ).toBe(fallback);
      });

      it("returns fallback for null origin", () => {
        expect(resolveAllowedOrigin(null)).toBe(fallback);
      });

      it("returns fallback for undefined origin", () => {
        expect(resolveAllowedOrigin(undefined)).toBe(fallback);
      });

      it("returns fallback for empty string origin", () => {
        // Empty string is falsy, should return fallback
        expect(resolveAllowedOrigin("")).toBe(fallback);
      });

      it("returns fallback for invalid URL format", () => {
        expect(resolveAllowedOrigin("not-a-valid-url")).toBe(fallback);
        expect(resolveAllowedOrigin("javascript:alert(1)")).toBe(fallback);
      });
    });

    describe("edge cases", () => {
      it("handles origins with paths (should only match host)", () => {
        // Origins shouldn't have paths, but if they do, it's treated as full origin match
        expect(resolveAllowedOrigin("https://digitaltableteur.com/api")).toBe(
          fallback,
        );
      });

      it("handles non-standard ports", () => {
        // Non-standard ports on localhost should work
        expect(resolveAllowedOrigin("http://localhost:9999")).toBe(
          "http://localhost:9999",
        );
        expect(resolveAllowedOrigin("http://127.0.0.1:1234")).toBe(
          "http://127.0.0.1:1234",
        );
      });
    });
  });

  describe("createCorsHeaders()", () => {
    const fallback = allowedOrigins[0];

    it("returns correct headers with valid origin", () => {
      const headers = createCorsHeaders("https://digitaltableteur.com");

      expect(headers["Access-Control-Allow-Origin"]).toBe(
        "https://digitaltableteur.com",
      );
      expect(headers["Access-Control-Allow-Methods"]).toBe("GET, POST, OPTIONS");
      expect(headers["Access-Control-Allow-Headers"]).toContain("Content-Type");
      expect(headers["Access-Control-Max-Age"]).toBe("86400");
      expect(headers["Vary"]).toBe("Origin");
    });

    it("returns headers with fallback origin for invalid origin", () => {
      const headers = createCorsHeaders("https://attacker.com");

      expect(headers["Access-Control-Allow-Origin"]).toBe(fallback);
    });

    it("returns headers with fallback origin for null", () => {
      const headers = createCorsHeaders(null);

      expect(headers["Access-Control-Allow-Origin"]).toBe(fallback);
    });

    it("returns headers with fallback origin for undefined", () => {
      const headers = createCorsHeaders(undefined);

      expect(headers["Access-Control-Allow-Origin"]).toBe(fallback);
    });

    it("includes Vary: Origin header", () => {
      const headers = createCorsHeaders("https://digitaltableteur.com");

      expect(headers["Vary"]).toBe("Origin");
    });

    it("includes correct methods", () => {
      const headers = createCorsHeaders("https://digitaltableteur.com");

      expect(headers["Access-Control-Allow-Methods"]).toBe("GET, POST, OPTIONS");
    });

    it("includes correct max-age (24 hours)", () => {
      const headers = createCorsHeaders("https://digitaltableteur.com");

      expect(headers["Access-Control-Max-Age"]).toBe("86400"); // 24 * 60 * 60
    });

    it("includes necessary headers for API requests", () => {
      const headers = createCorsHeaders("https://digitaltableteur.com");

      // Check all expected headers are present
      const allowHeaders = headers["Access-Control-Allow-Headers"];
      expect(allowHeaders).toContain("Content-Type");
      expect(allowHeaders).toContain("Authorization");
      expect(allowHeaders).toContain("Accept");
      expect(allowHeaders).toContain("Origin");
    });

    it("echoes back localhost origins correctly", () => {
      const headers = createCorsHeaders("http://localhost:3000");

      expect(headers["Access-Control-Allow-Origin"]).toBe(
        "http://localhost:3000",
      );
    });

    it("echoes back private network origins correctly", () => {
      const headers = createCorsHeaders("http://192.168.1.100:3000");

      expect(headers["Access-Control-Allow-Origin"]).toBe(
        "http://192.168.1.100:3000",
      );
    });
  });

  describe("allowedOrigins constant", () => {
    it("includes production domains", () => {
      expect(allowedOrigins).toContain("https://digitaltableteur.com");
      expect(allowedOrigins).toContain("https://www.digitaltableteur.com");
    });

    it("includes common development ports", () => {
      expect(allowedOrigins).toContain("http://localhost:5173"); // Vite
      expect(allowedOrigins).toContain("http://localhost:3000"); // Next.js
      expect(allowedOrigins).toContain("http://localhost:6006"); // Storybook
    });

    it("first origin is the production domain", () => {
      // Important: first origin is used as fallback
      expect(allowedOrigins[0]).toBe("https://digitaltableteur.com");
    });
  });
});
