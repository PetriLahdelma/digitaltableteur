#!/usr/bin/env node
/**
 * Verify external npm registry state for the design-system packages.
 *
 * The token packages are published and consumed from the private registry. The
 * React package can be checked in either post-publish mode (current version
 * must exist) or next-publish mode (prepared next version must be unpublished).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REGISTRY = "https://registry.npmjs.org/";
const OUT_DIR = join(ROOT, ".omx/state/design-system/package-registry-status");
const OUT_JSON = join(OUT_DIR, "latest.json");
const EXPECT_REACT = readExpectedReactState();

const PACKAGE_DEFS = [
  {
    dir: "packages/tokens",
    name: "@digitaltableteur/tokens",
    expectedState: "published",
  },
  {
    dir: "packages/tokens-css",
    name: "@digitaltableteur/tokens-css",
    expectedState: "published",
  },
  {
    dir: "packages/react",
    name: "@digitaltableteur/react",
    expectedState: EXPECT_REACT,
  },
];

function readExpectedReactState() {
  const arg = process.argv.find((item) => item.startsWith("--expect-react="));
  const value = arg?.split("=")[1] ?? process.env.DT_EXPECT_REACT_REGISTRY_STATE ?? "published";
  if (!["published", "unpublished"].includes(value)) {
    console.error(`Invalid --expect-react value: ${value}. Use published or unpublished.`);
    process.exit(2);
  }
  return value;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function relativePath(path) {
  return relative(ROOT, path);
}

function runNpm(args) {
  try {
    const stdout = execFileSync("npm", ["--registry", REGISTRY, ...userconfigArgs, ...args], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return {
      ok: true,
      json: stdout ? JSON.parse(stdout) : null,
      stdout,
      stderr: "",
      status: 0,
      notFound: false,
    };
  } catch (error) {
    const stdout = typeof error.stdout === "string" ? error.stdout : String(error.stdout ?? "");
    const stderr = typeof error.stderr === "string" ? error.stderr : String(error.stderr ?? "");
    const text = `${stdout}\n${stderr}`;
    return {
      ok: false,
      json: parseMaybeJson(stdout),
      stdout,
      stderr,
      status: typeof error.status === "number" ? error.status : null,
      notFound: /\bE404\b|Not Found|not in this registry/i.test(text),
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseMaybeJson(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function npmAccessValue(report, packageName) {
  const value = report?.[packageName];
  return typeof value === "string" ? value : null;
}

const userconfig = execFileSync("npm", ["config", "get", "userconfig"], {
  cwd: ROOT,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
}).trim();
const userconfigArgs =
  userconfig && userconfig !== "undefined" ? ["--userconfig", userconfig] : [];

function checkPublishedPackage(row, exactView, orgAccess, errors) {
  if (!exactView.ok) {
    errors.push(
      `${row.name}@${row.expectedVersion} must be published, but npm view failed${exactView.notFound ? " with E404" : ""}.`,
    );
    return;
  }
  if (exactView.json !== row.expectedVersion) {
    errors.push(`${row.name} registry version ${exactView.json} does not match expected ${row.expectedVersion}.`);
  }
  if (row.accessStatus !== null && row.accessStatus !== "private") {
    errors.push(`${row.name} access status ${row.accessStatus} does not match expected private.`);
  }
  if (row.orgAccess !== null && row.orgAccess !== "read-only" && row.orgAccess !== "read-write") {
    errors.push(`${row.name} org access ${row.orgAccess} does not match expected read-only or read-write.`);
  }
}

function checkUnpublishedPackage(row, exactView, errors) {
  if (exactView.ok) {
    errors.push(
      `${row.name}@${row.expectedVersion} is already published; bump the package version before the next OIDC publish.`,
    );
  } else if (!exactView.notFound) {
    errors.push(`${row.name}@${row.expectedVersion} registry status is unknown; npm view did not return E404.`);
  }
}

const errors = [];
// npm `access list` needs org-level permission that a least-privilege install
// token (read-only, package-scoped) intentionally lacks and 403s on. Org
// access metadata is best-effort; version/readability checks below still run.
const accessPackagesResult = runNpm(["access", "list", "packages", "digitaltableteur", "--json"]);
const accessPackages = accessPackagesResult.ok ? accessPackagesResult.json : null;

const rows = PACKAGE_DEFS.map((definition) => {
  const pkg = readJson(join(ROOT, definition.dir, "package.json"));
  const exactView = runNpm(["view", `${definition.name}@${pkg.version}`, "version", "--json"]);
  const latestView = runNpm(["view", definition.name, "version", "--json"]);
  const published = exactView.ok;
  const accessStatusResult = published
    ? runNpm(["access", "get", "status", definition.name, "--json"])
    : null;

  const row = {
    name: definition.name,
    dir: definition.dir,
    expectedState: definition.expectedState,
    expectedVersion: pkg.version,
    actualState: published ? "published" : exactView.notFound ? "unpublished" : "unknown",
    exactVersionPublished: published,
    registryVersion: published ? exactView.json : null,
    latestVersion: latestView.ok ? latestView.json : null,
    orgAccess: npmAccessValue(accessPackages, definition.name),
    accessStatus: accessStatusResult?.ok ? npmAccessValue(accessStatusResult.json, definition.name) : null,
    npmViewStatus: exactView.status,
  };

  if (definition.expectedState === "published") {
    checkPublishedPackage(row, exactView, accessPackages, errors);
  } else {
    checkUnpublishedPackage(row, exactView, errors);
  }

  return row;
});

const report = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "passed",
  registry: REGISTRY,
  expectedReactState: EXPECT_REACT,
  packages: rows,
  errors,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error("Package registry status guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  process.exit(1);
}

const tokenSummary = rows
  .filter((row) => row.name !== "@digitaltableteur/react")
  .map((row) => `${row.name}@${row.registryVersion} ${row.accessStatus}/${row.orgAccess}`)
  .join(", ");
const reactRow = rows.find((row) => row.name === "@digitaltableteur/react");
console.log(
  `✓ package registry status verified (${tokenSummary}; @digitaltableteur/react@${reactRow.expectedVersion} ${reactRow.actualState})`,
);
console.log(`  Report: ${relativePath(OUT_JSON)}`);
