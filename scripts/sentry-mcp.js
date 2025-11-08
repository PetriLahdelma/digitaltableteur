#!/usr/bin/env node
/**
 * Sentry MCP Server (command-based)
 * Provides simple issue and release query tools for Digitaltableteur.
 *
 * Usage:
 *   node scripts/sentry-mcp.js issues [project] [limit]
 *   node scripts/sentry-mcp.js releases [project] [limit]
 *   node scripts/sentry-mcp.js list-projects [limit]
 *
 * Environment Variables (required):
 *   SENTRY_AUTH_TOKEN - Sentry API token (org-level, read permission)
 *   SENTRY_ORG        - Sentry organization slug
 *
 * Optional:
 *   SENTRY_PROJECT    - Default project slug
 */

import fetch from "node-fetch";
import { config as loadEnv } from "dotenv";

// Attempt to load local env file so running the script locally picks up SENTRY_* variables
// (Vercel provides these in its build environment; this is strictly a developer convenience.)
loadEnv({ path: ".env.local" });

// Arguments parsing (simple) allows optional flags after positional args.
// Usage examples:
//   node scripts/sentry-mcp.js issues frontend 15 --unresolved --environment=production
//   node scripts/sentry-mcp.js releases frontend 5
const [, , command, projectArg, limitArg, ...restArgs] = process.argv;
const org = process.env.SENTRY_ORG || "digitaltableteur";
const project = projectArg || process.env.SENTRY_PROJECT || "frontend";
const limit = parseInt(limitArg || "10", 10);
const token = process.env.SENTRY_AUTH_TOKEN;

if (!token) {
  console.error("Missing SENTRY_AUTH_TOKEN env variable");
  process.exit(1);
}

const base = `https://sentry.io/api/0/projects/${org}/${project}`;

// Parse flag style args: --unresolved, --environment=value
let filterUnresolved = false;
let environmentFilter = undefined;
let debug = false;
for (const arg of restArgs) {
  if (arg === "--unresolved") {
    filterUnresolved = true;
  } else if (arg.startsWith("--environment=")) {
    environmentFilter = arg.split("=")[1];
  } else if (arg === "--debug") {
    debug = true;
  }
}

if (debug) {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        debug: true,
        env: {
          SENTRY_ORG: org,
          SENTRY_PROJECT: project,
          hasToken: !!token,
        },
        flags: { filterUnresolved, environmentFilter },
      },
      null,
      2,
    ),
  );
}

async function getIssues() {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (filterUnresolved) {
    // Sentry API uses 'is:unresolved' in query parameter 'query'
    params.set("query", "is:unresolved");
  }
  if (environmentFilter) {
    // environment filter
    params.set("environment", environmentFilter);
  }
  const url = `${base}/issues/?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 404) {
      console.error(
        `Failed to fetch issues (404). Verify organization ('${org}') and project slug ('${project}') exist and that the token has project access. Response: ${body}`,
      );
    } else if (res.status === 401 || res.status === 403) {
      console.error(
        `Failed to fetch issues (${res.status}). Token may lack required scopes (need org:read project:read) or be invalid. Response: ${body}`,
      );
    } else {
      console.error(`Failed to fetch issues ${res.status} ${body}`);
    }
    process.exit(1);
  }
  const data = await res.json();
  // Map to simplified structure
  const simplified = data.map((i) => ({
    id: i.id,
    title: i.title,
    culprit: i.culprit,
    level: i.level,
    userCount: i.userCount,
    status: i.status, // e.g., unresolved, resolved
    isUnhandled: i.isUnhandled,
    firstSeen: i.firstSeen,
    lastSeen: i.lastSeen,
    permalink: i.permalink,
    environment: i.environment || null,
  }));
  console.log(
    JSON.stringify(
      {
        project,
        count: simplified.length,
        filters: {
          unresolved: filterUnresolved,
          environment: environmentFilter || null,
        },
        issues: simplified,
      },
      null,
      2,
    ),
  );
}

async function getReleases() {
  const url = `${base}/releases/?per_page=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Failed to fetch releases", res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const simplified = data.map((r) => ({
    version: r.version,
    dateCreated: r.dateCreated,
    lastDeploy: r.lastDeploy?.dateFinished || null,
    url: r.url,
    projects: r.projects?.map((p) => p.slug) || [],
  }));
  console.log(
    JSON.stringify(
      { project, count: simplified.length, releases: simplified },
      null,
      2,
    ),
  );
}

async function listProjects() {
  const url = `https://sentry.io/api/0/organizations/${org}/projects/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Failed to list projects ${res.status} ${body}`);
    process.exit(1);
  }
  const data = await res.json();
  const simplified = data.map((p) => ({
    slug: p.slug,
    name: p.name,
    id: p.id,
  }));
  console.log(
    JSON.stringify(
      { org, count: simplified.length, projects: simplified },
      null,
      2,
    ),
  );
}

async function main() {
  if (!command || !["issues", "releases", "list-projects"].includes(command)) {
    console.error(
      "Usage: node scripts/sentry-mcp.js <issues|releases|list-projects> [project] [limit] [--unresolved] [--environment=name] [--debug]",
    );
    process.exit(1);
  }
  if (command === "issues") {
    await getIssues();
  } else if (command === "releases") {
    await getReleases();
  } else if (command === "list-projects") {
    await listProjects();
  }
}

main().catch((e) => {
  console.error("Unexpected error", e);
  process.exit(1);
});
