#!/usr/bin/env node
/**
 * Verify that npm can exchange the current CI OIDC identity for a publish token.
 *
 * npm treats OIDC as an optional auth path and otherwise falls through to the
 * normal "need auth" publish error. This workflow-only guard makes that failure
 * explicit before the real publish step.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_DIRS = new Map([
  ["@digitaltableteur/tokens", "packages/tokens"],
  ["@digitaltableteur/tokens-css", "packages/tokens-css"],
  ["@digitaltableteur/react", "packages/react"],
  ["@digitaltableteur/web-components", "packages/web-components"],
]);

const args = process.argv.slice(2);
const packageName =
  args.find((arg) => PACKAGE_DIRS.has(arg)) ?? "@digitaltableteur/react";
const packageDir = PACKAGE_DIRS.get(packageName);
const shouldPublish = args.includes("--publish");
const registry =
  process.env.npm_config_registry ??
  process.env.NPM_CONFIG_REGISTRY ??
  "https://registry.npmjs.org/";

function redact(line) {
  return line
    .replace(/Bearer\s+[-._~+/=A-Za-z0-9]+/g, "Bearer [redacted]")
    .replace(/npm_[A-Za-z0-9]{20,}/g, "npm_[redacted]")
    .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, "[jwt-redacted]");
}

function decodeJwtPayload(token) {
  const [, payloadB64] = token.split(".");
  if (!payloadB64) return {};
  const padded = payloadB64.padEnd(
    payloadB64.length + ((4 - (payloadB64.length % 4)) % 4),
    "=",
  );
  return JSON.parse(Buffer.from(padded, "base64url").toString("utf8"));
}

function formatClaimValue(value) {
  if (value === undefined || value === null || value === "") return "(missing)";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function uniqueRows(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    if (seen.has(row.path)) return false;
    seen.add(row.path);
    return true;
  });
}

function npmOidcExchangePaths(name) {
  return uniqueRows([
    {
      label: "fully-url-encoded",
      path: encodeURIComponent(name),
    },
    {
      label: "npm-cli-escaped",
      path: name.startsWith("@") ? name.replace("/", "%2f") : encodeURIComponent(name),
    },
  ]);
}

function registryAuthConfigLine(token) {
  const url = new URL(registry);
  const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  return `//${url.host}${path}:_authToken=${token}`;
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
  console.error("Official npm trust CLI repair path:");
  console.error(
    "  NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npx npm@11.18.0 trust list " +
      `${packageName} --json`,
  );
  console.error(
    "  NPM_CONFIG_USERCONFIG=/path/to/private-npmrc npx npm@11.18.0 trust github " +
      `${packageName} --repo PetriLahdelma/digitaltableteur --file ds-publish.yml --allow-publish --yes`,
  );
  console.error(
    "If npm trust returns 403 for /-/package/<package>/trust while normal package access is read-write, the npm token/session cannot manage Trusted Publisher records.",
  );
}

async function getGitHubIdToken() {
  const audience = `npm:${new URL(registry).hostname}`;
  const url = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
  url.searchParams.append("audience", audience);
  // The runner-local token endpoint intermittently answers through a proxy
  // with plain-text errors ("upstream connect error ... reset reason: overflow"),
  // so parse defensively and retry instead of crashing on non-JSON bodies.
  let lastFailure = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url.href, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`,
      },
    });
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    if (response.ok && json?.value) return json.value;
    lastFailure = `status ${response.status}: ${redact(text).slice(0, 200)}`;
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  throw new Error(
    `GitHub OIDC token request failed after 3 attempts (${lastFailure})`,
  );
}

async function verifyExchangeEndpoint(idToken, exchangePath) {
  const exchangeUrl = new URL(
    `/-/npm/v1/oidc/token/exchange/package/${exchangePath}`,
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

async function exchangeForPublishToken(idToken) {
  const attempts = [];
  for (const candidate of npmOidcExchangePaths(packageName)) {
    const exchange = await verifyExchangeEndpoint(idToken, candidate.path);
    attempts.push({ ...exchange, ...candidate });
    if (exchange.ok && exchange.body?.token) {
      return { token: exchange.body.token, attempts, selected: candidate };
    }
  }
  return { token: null, attempts, selected: null };
}

function runNpmPublishWithToken(token, dryRun) {
  const tempDir = mkdtempSync(join(tmpdir(), "dt-npm-oidc-"));
  const userconfig = join(tempDir, "npmrc");
  writeFileSync(
    userconfig,
    `registry=${registry}\n${registryAuthConfigLine(token)}\n`,
    "utf8",
  );

  const publishArgs = ["publish", "--access", "restricted", "--loglevel", "silly"];
  if (dryRun) publishArgs.splice(1, 0, "--dry-run");

  try {
    return spawnSync("npm", publishArgs, {
      cwd: join(ROOT, packageDir),
      encoding: "utf8",
      env: {
        ...process.env,
        NPM_CONFIG_USERCONFIG: userconfig,
      },
    });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
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

const exchangeResult = await exchangeForPublishToken(idToken);

if (!exchangeResult.token) {
  const lastAttempt = exchangeResult.attempts.at(-1);
  console.error(
    `npm OIDC token exchange endpoint rejected ${packageName} with HTTP ${lastAttempt?.status ?? "unknown"}.`,
  );
  console.error("Exchange attempts:");
  for (const attempt of exchangeResult.attempts) {
    console.error(
      `  ${attempt.label} (${attempt.path}): HTTP ${attempt.status} ${redact(
        attempt.body?.message ?? JSON.stringify(attempt.body),
      )}`,
    );
  }
  console.error("GitHub OIDC claim summary:");
  for (const line of claimSummary) console.error(`  ${line}`);
  printTrustedPublisherChecklist();
  process.exit(1);
}

const result = runNpmPublishWithToken(exchangeResult.token, !shouldPublish);

const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const diagnosticLines = combinedOutput
  .split(/\r?\n/)
  .filter((line) => /oidc|id_token|need auth|ENEEDAUTH|auth/i.test(line))
  .map(redact);

if (result.status !== 0) {
  console.error(
    `npm OIDC token exchange succeeded for ${packageName} via ${exchangeResult.selected.label}, but npm publish${shouldPublish ? "" : " dry-run"} exited ${result.status}.`,
  );
  for (const line of diagnosticLines) console.error(`  ${line}`);
  if (!diagnosticLines.length) {
    console.error(redact(combinedOutput.trim()));
  }
  process.exit(result.status ?? 1);
}

console.log(
  `✓ npm OIDC ${shouldPublish ? "publish completed" : "publish auth verified"} for ${packageName} via ${exchangeResult.selected.label} (${relative(ROOT, join(ROOT, packageDir))})`,
);
