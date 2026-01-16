#!/usr/bin/env node

/**
 * Page Rendering Verification Script
 *
 * Verifies that all static pages render correctly by:
 * 1. Starting a dev/production server
 * 2. Fetching each route and checking for 200 OK status
 * 3. Checking for common error patterns in HTML
 *
 * Usage:
 * - Start the server first: npm run dev (or npm run start for production)
 * - Run: node scripts/verify-pages-render.mjs [--port=3000]
 *
 * Created: Phase 12-2 Launch Preparation
 */

const DEFAULT_PORT = 3000;
const BASE_URL = `http://localhost:${process.env.PORT || DEFAULT_PORT}`;

// Static routes to verify (excludes dynamic [slug] routes)
const ROUTES = [
  "/",
  "/about",
  "/accessibility",
  "/ai-use",
  "/blog",
  "/contact",
  "/privacy-policy",
  "/work",
  "/work/garage-junction",
  "/work/helsinki-design-system",
  "/work/illustrations",
  "/work/new-things-co",
  // PSEO landing page
  "/pseo",
];

// Patterns that indicate rendering errors
const ERROR_PATTERNS = [
  "Application error",
  "Internal Server Error",
  "Error: ",
  "Unhandled Runtime Error",
  "Cannot read property",
  "TypeError:",
  "ReferenceError:",
  "SyntaxError:",
  "hydration",
  "NEXT_REDIRECT", // Should not appear in final HTML
];

/**
 * Fetches a page and checks for errors
 * @param {string} route - The route to check
 * @returns {Promise<{route: string, status: string, error?: string}>}
 */
async function checkRoute(route) {
  const url = `${BASE_URL}${route}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000), // 30s timeout
      headers: {
        Accept: "text/html",
        "User-Agent": "PageVerifier/1.0",
      },
    });

    if (!response.ok) {
      return {
        route,
        status: "FAIL",
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    const html = await response.text();

    // Check for error patterns
    for (const pattern of ERROR_PATTERNS) {
      if (html.toLowerCase().includes(pattern.toLowerCase())) {
        return {
          route,
          status: "WARN",
          error: `Contains error pattern: "${pattern}"`,
        };
      }
    }

    // Check for minimum content length (page should have real content)
    if (html.length < 1000) {
      return {
        route,
        status: "WARN",
        error: `Page content suspiciously short (${html.length} chars)`,
      };
    }

    return { route, status: "PASS" };
  } catch (error) {
    return {
      route,
      status: "FAIL",
      error: error.message,
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log("=== Page Rendering Verification ===\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Routes to check: ${ROUTES.length}\n`);

  // Check if server is running
  try {
    await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error(
      "ERROR: Cannot connect to server. Make sure the dev server is running:"
    );
    console.error("  npm run dev");
    console.error("  npm run start");
    process.exit(1);
  }

  const results = {
    pass: [],
    warn: [],
    fail: [],
  };

  // Check all routes
  for (const route of ROUTES) {
    const result = await checkRoute(route);

    if (result.status === "PASS") {
      results.pass.push(result);
      console.log(`  PASS  ${route}`);
    } else if (result.status === "WARN") {
      results.warn.push(result);
      console.log(`  WARN  ${route} - ${result.error}`);
    } else {
      results.fail.push(result);
      console.log(`  FAIL  ${route} - ${result.error}`);
    }
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Passed: ${results.pass.length}/${ROUTES.length}`);
  console.log(`Warnings: ${results.warn.length}/${ROUTES.length}`);
  console.log(`Failed: ${results.fail.length}/${ROUTES.length}`);

  if (results.fail.length > 0) {
    console.log("\nFailed routes:");
    results.fail.forEach((r) => console.log(`  - ${r.route}: ${r.error}`));
    process.exit(1);
  }

  if (results.warn.length > 0) {
    console.log("\nWarnings:");
    results.warn.forEach((r) => console.log(`  - ${r.route}: ${r.error}`));
  }

  console.log("\nAll pages render successfully!");
  process.exit(0);
}

main();
