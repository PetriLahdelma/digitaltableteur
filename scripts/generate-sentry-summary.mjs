#!/usr/bin/env node
/**
 * Generate a lightweight Sentry issues summary JSON for Storybook / dashboard consumption.
 * Invokes the sentry-mcp command-based server script with filtering flags and writes output.
 *
 * Output path: public/observability/sentry-summary.json
 *
 * Environment variables (same as sentry-mcp script):
 *   SENTRY_AUTH_TOKEN, SENTRY_ORG, (optional) SENTRY_PROJECT
 *
 * Flags (pass-through): --unresolved, --environment=name
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

// Load local env file for developer convenience (Vercel will inject env separately)
loadEnv({ path: ".env.local" });

const args = process.argv.slice(2); // allow forwarding unresolved/environment flags
const script = resolve("scripts/sentry-mcp.js");

function runIssues() {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn(
      "node",
      [
        script,
        "issues",
        process.env.SENTRY_PROJECT || "frontend",
        "20",
        ...args,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => {
      out += d.toString();
    });
    proc.stderr.on("data", (d) => {
      err += d.toString();
    });
    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`sentry-mcp issues exited with code ${code}: ${err}`),
        );
      }
      resolvePromise(out);
    });
  });
}

async function main() {
  try {
    const raw = await runIssues();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error("Failed to parse JSON from sentry-mcp output");
    }
    const dir = resolve("public/observability");
    mkdirSync(dir, { recursive: true });
    const file = resolve(dir, "sentry-summary.json");
    const summary = {
      generatedAt: new Date().toISOString(),
      project: parsed.project,
      filters: parsed.filters,
      count: parsed.count,
      issues: parsed.issues.slice(0, 10), // limit for dashboard
    };
    writeFileSync(file, JSON.stringify(summary, null, 2));
    // eslint-disable-next-line no-console
    console.log(
      `Wrote ${file} (${summary.count} issues, showing ${summary.issues.length})`,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to generate Sentry summary:", e.message);
    process.exit(1);
  }
}

main();
