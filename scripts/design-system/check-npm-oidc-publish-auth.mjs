#!/usr/bin/env node
/**
 * Verify that npm can exchange the current CI OIDC identity for a publish token.
 *
 * npm treats OIDC as an optional auth path and otherwise falls through to the
 * normal "need auth" publish error. This workflow-only guard makes that failure
 * explicit before the real publish step.
 */
import { spawnSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_DIRS = new Map([
  ["@digitaltableteur/tokens", "packages/tokens"],
  ["@digitaltableteur/tokens-css", "packages/tokens-css"],
  ["@digitaltableteur/react", "packages/react"],
]);

const packageName = process.argv[2] ?? "@digitaltableteur/react";
const packageDir = PACKAGE_DIRS.get(packageName);
const registry = process.env.npm_config_registry ?? process.env.NPM_CONFIG_REGISTRY ?? "https://registry.npmjs.org/";

function redact(line) {
  return line
    .replace(/Bearer\s+[-._~+/=A-Za-z0-9]+/g, "Bearer [redacted]")
    .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, "[jwt-redacted]");
}

function decodeJwtPayload(token) {
  const [, payloadB64] = token.split(".");
  if (!payloadB64) return {};
  const padded = payloadB64.padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64url").toString("utf8"));
}

function formatClaimValue(value) {
  if (value === undefined || value === null || value === "") return "(missing)";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function npmOidcEscapedPackageName(name) {
  // Match npm-package-arg's escapedName shape used by npm CLI OIDC publish.
  return name.startsWith("@") ? name.replace("/", "%2f") : encodeURIComponent(name);
}

function printTrustedPublisherChecklist() {
  console.error("Expected npm Trusted Publisher fields for this workflow:");
  console.error(`  Package access page: https://www.npmjs.com/package/${packageName}/access`);
  console.error("  Publisher: GitHub Actions");
  console.error("  Organization or user: PetriLahdelma");
  console.error("  Repository: digitaltableteur");
  console.error("  Workflow filename: ds-publish.yml");
  console.error("  Environment name: leave blank");
  console.error("  Allowed action: Allow npm publish");
  console.error(
    "These values are case-sensitive and must match the GitHub OIDC claims exactly; do not use the npm org name as the GitHub owner.",
  );
}

async function getGitHubIdToken() {
  const audience = `npm:${new URL(registry).hostname}`;
  const url = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
  url.searchParams.append("audience", audience);
  const response = await fetch(url.href, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`,
    },
  });
  const json = await response.json();
  if (!response.ok || !json.value) {
    throw new Error(`GitHub OIDC token request failed with status ${response.status}`);
  }
  return json.value;
}

async function verifyExchangeEndpoint(idToken) {
  const exchangeUrl = new URL(
    `/-/npm/v1/oidc/token/exchange/package/${npmOidcEscapedPackageName(packageName)}`,
    registry,
  );
  const response = await fetch(exchangeUrl.href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: text };
  }
  return { ok: response.ok, status: response.status, body };
}

if (!packageDir) {
  console.error(
    `Unknown package ${packageName}. Expected one of: ${[...PACKAGE_DIRS.keys()].join(", ")}`,
  );
  process.exit(1);
}

if (process.env.GITHUB_ACTIONS !== "true") {
  console.error("npm OIDC publish auth guard must run inside GitHub Actions.");
  process.exit(1);
}

const missingGitHubOidcEnv = [
  "ACTIONS_ID_TOKEN_REQUEST_URL",
  "ACTIONS_ID_TOKEN_REQUEST_TOKEN",
].filter((key) => !process.env[key]);

if (missingGitHubOidcEnv.length) {
  console.error(
    `GitHub OIDC environment is unavailable; missing ${missingGitHubOidcEnv.join(", ")}.`,
  );
  console.error("Ensure the workflow has permissions: id-token: write.");
  process.exit(1);
}

const idToken = await getGitHubIdToken();
const claims = decodeJwtPayload(idToken);
const claimKeys = [
  "iss",
  "aud",
  "sub",
  "repository",
  "repository_owner",
  "repository_visibility",
  "workflow",
  "workflow_ref",
  "job_workflow_ref",
  "ref",
  "event_name",
  "environment",
];
const claimSummary = claimKeys.map((key) => `${key}: ${formatClaimValue(claims[key])}`);

const exchange = await verifyExchangeEndpoint(idToken);

if (!exchange.ok || !exchange.body?.token) {
  console.error(
    `npm OIDC token exchange endpoint rejected ${packageName} with HTTP ${exchange.status}.`,
  );
  console.error(`Registry response: ${redact(exchange.body?.message ?? JSON.stringify(exchange.body))}`);
  console.error("GitHub OIDC claim summary:");
  for (const line of claimSummary) console.error(`  ${line}`);
  printTrustedPublisherChecklist();
  process.exit(1);
}

const result = spawnSync(
  "npm",
  ["publish", "--dry-run", "--access", "restricted", "--loglevel", "silly"],
  {
    cwd: join(ROOT, packageDir),
    encoding: "utf8",
    env: { ...process.env, NPM_ID_TOKEN: idToken },
  },
);

const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const diagnosticLines = combinedOutput
  .split(/\r?\n/)
  .filter((line) => /oidc|id_token|need auth|ENEEDAUTH|auth/i.test(line))
  .map(redact);

const hasOidcSuccess = diagnosticLines.some((line) =>
  /oidc.*Successfully retrieved and set token/i.test(line),
);

if (!hasOidcSuccess) {
  console.error(`npm did not exchange GitHub OIDC for a publish token for ${packageName}.`);
  if (diagnosticLines.length) {
    console.error("Relevant npm diagnostics:");
    for (const line of diagnosticLines) console.error(`  ${line}`);
  } else {
    console.error("No npm OIDC diagnostics were emitted.");
  }
  printTrustedPublisherChecklist();
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `npm OIDC token exchange succeeded for ${packageName}, but publish dry-run exited ${result.status}.`,
  );
  for (const line of diagnosticLines) console.error(`  ${line}`);
  process.exit(result.status ?? 1);
}

console.log(
  `✓ npm OIDC publish auth verified for ${packageName} (${relative(ROOT, join(ROOT, packageDir))})`,
);
