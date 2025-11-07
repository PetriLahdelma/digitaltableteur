#!/usr/bin/env node
/**
 * Sentry Automation Orchestrator
 *
 * Responsibilities:
 * 1. Ensure SENTRY_* env vars loaded (attempt .env.local via dotenv).
 * 2. List projects to discover correct slug if SENTRY_PROJECT missing.
 * 3. Generate summary JSON (unresolved + optional environment) if real data available.
 * 4. Fallback: create stub summary when auth missing or project not found.
 * 5. Exit 0 even on stub fallback (to avoid failing build pipelines).
 *
 * Flags:
 *   --environment=name   Filter by environment
 *   --unresolved         Only unresolved issues
 *   --force-stub         Always write stub (ignore real fetch)
 *   --debug              Emit diagnostic info
 */

import { config as loadEnv } from "dotenv";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: ".env.local" });

const args = process.argv.slice(2);
let environmentArg = null;
let unresolved = false;
let forceStub = false;
let debug = false;
for (const a of args) {
  if (a.startsWith("--environment=")) environmentArg = a.split("=")[1];
  else if (a === "--unresolved") unresolved = true;
  else if (a === "--force-stub") forceStub = true;
  else if (a === "--debug") debug = true;
}

const org = process.env.SENTRY_ORG;
let project = process.env.SENTRY_PROJECT;
const token = process.env.SENTRY_AUTH_TOKEN;

function log(...m) {
  // eslint-disable-next-line no-console
  console.log(...m);
}
function error(...m) {
  // eslint-disable-next-line no-console
  console.error(...m);
}

function runScript(args) {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn("node", args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`script failed (${code}) ${err}`));
      }
      resolvePromise(out);
    });
  });
}

async function discoverProjectSlug() {
  if (!token || !org) return null;
  try {
    const raw = await runScript([
      resolve("scripts/sentry-mcp.js"),
      "list-projects",
    ]);
    const parsed = JSON.parse(raw);
    if (parsed.projects?.length === 1) {
      return parsed.projects[0].slug;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function writeSummary(data) {
  const dir = resolve("public/observability");
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, "sentry-summary.json");
  writeFileSync(file, JSON.stringify(data, null, 2));
  log(`Wrote ${file} (count=${data.count})`);
}

async function generateRealSummary() {
  const cmd = [resolve("scripts/sentry-mcp.js"), "issues", project, "20"];
  if (unresolved) cmd.push("--unresolved");
  if (environmentArg) cmd.push(`--environment=${environmentArg}`);
  const raw = await runScript(cmd);
  const parsed = JSON.parse(raw);
  writeSummary({
    generatedAt: new Date().toISOString(),
    project: parsed.project,
    filters: parsed.filters,
    count: parsed.count,
    issues: parsed.issues.slice(0, 10),
  });
}

function writeStub(reason) {
  writeSummary({
    generatedAt: new Date().toISOString(),
    project: project || "unknown",
    filters: { unresolved, environment: environmentArg },
    count: 0,
    issues: [],
    stub: true,
    reason,
  });
}

async function main() {
  if (debug) {
    log(
      JSON.stringify(
        {
          envPresent: {
            org: !!org,
            project: !!project,
            token: !!token,
          },
          flags: { unresolved, environmentArg, forceStub },
        },
        null,
        2,
      ),
    );
  }

  if (forceStub) {
    writeStub("force-stub-flag");
    return;
  }

  if (!token || !org) {
    writeStub("missing-auth-or-org");
    return;
  }

  if (!project) {
    project = await discoverProjectSlug();
    if (!project) {
      writeStub("project-discovery-failed");
      return;
    }
  }

  try {
    await generateRealSummary();
  } catch (e) {
    error(`Failed real summary generation: ${e.message}`);
    writeStub("fetch-error");
  }
}

main().catch((e) => {
  error("Unexpected automation error", e);
  writeStub("unexpected-error");
});
