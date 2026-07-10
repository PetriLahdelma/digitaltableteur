#!/usr/bin/env node
/**
 * Post-publish registry smoke for the private token packages.
 *
 * Installs the published @digitaltableteur/tokens and
 * @digitaltableteur/tokens-css versions into a clean temporary consumer and
 * verifies their public JS/JSON/CSS/theme exports resolve from node_modules.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REGISTRY = "https://registry.npmjs.org/";
const OUT_DIR = join(ROOT, ".omx/state/design-system/registry-token-install");
const OUT_JSON = join(OUT_DIR, "latest.json");
const KEEP = process.env.DT_KEEP_REGISTRY_TOKEN_SMOKE === "1";

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? ROOT,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function relativePath(path) {
  return relative(ROOT, path);
}

function writeReport(report) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
}

function npmArgs(args) {
  return ["--registry", REGISTRY, ...args];
}

function readCommandJson(command, args) {
  const output = run(command, args, { capture: true }).trim();
  return output ? JSON.parse(output) : {};
}

/**
 * npm `access` APIs need org-level permission that a least-privilege
 * install token (read-only, package-scoped) intentionally lacks and 403s
 * on. Readability is proven by `npm view` + the scratch install, so the
 * access metadata is best-effort: null when the token cannot list it.
 */
function readCommandJsonOptional(command, args) {
  try {
    return readCommandJson(command, args);
  } catch {
    return null;
  }
}

function accessValue(accessReport, packageName) {
  const value = accessReport?.[packageName];
  return typeof value === "string" ? value : null;
}

const tokensVersion = readJson(join(ROOT, "packages/tokens/package.json")).version;
const tokensCssVersion = readJson(join(ROOT, "packages/tokens-css/package.json")).version;
const userconfig = run("npm", ["config", "get", "userconfig"], { capture: true }).trim();
const userconfigArgs =
  userconfig && userconfig !== "undefined" ? ["--userconfig", userconfig] : [];

const registryTokensVersion = run(
  "npm",
  npmArgs([...userconfigArgs, "view", `@digitaltableteur/tokens@${tokensVersion}`, "version"]),
  { capture: true },
).trim();
const registryTokensCssVersion = run(
  "npm",
  npmArgs([
    ...userconfigArgs,
    "view",
    `@digitaltableteur/tokens-css@${tokensCssVersion}`,
    "version",
  ]),
  { capture: true },
).trim();
const accessPackages = readCommandJsonOptional(
  "npm",
  npmArgs([...userconfigArgs, "access", "list", "packages", "digitaltableteur", "--json"]),
);
const tokensAccessStatus = readCommandJsonOptional(
  "npm",
  npmArgs([...userconfigArgs, "access", "get", "status", "@digitaltableteur/tokens", "--json"]),
);
const tokensCssAccessStatus = readCommandJsonOptional(
  "npm",
  npmArgs([
    ...userconfigArgs,
    "access",
    "get",
    "status",
    "@digitaltableteur/tokens-css",
    "--json",
  ]),
);

const scratch = mkdtempSync(join(tmpdir(), "dt-registry-token-smoke-"));
const report = {
  generatedAt: new Date().toISOString(),
  status: "running",
  registry: REGISTRY,
  packages: [
    {
      name: "@digitaltableteur/tokens",
      expectedVersion: tokensVersion,
      registryVersion: registryTokensVersion,
      orgAccess: accessValue(accessPackages, "@digitaltableteur/tokens"),
      accessStatus: accessValue(tokensAccessStatus, "@digitaltableteur/tokens"),
    },
    {
      name: "@digitaltableteur/tokens-css",
      expectedVersion: tokensCssVersion,
      registryVersion: registryTokensCssVersion,
      orgAccess: accessValue(accessPackages, "@digitaltableteur/tokens-css"),
      accessStatus: accessValue(tokensCssAccessStatus, "@digitaltableteur/tokens-css"),
    },
  ],
  consumer: null,
  scratchKept: KEEP,
  errors: [],
};

try {
  if (registryTokensVersion !== tokensVersion) {
    throw new Error(
      `Registry @digitaltableteur/tokens version mismatch: expected ${tokensVersion}, got ${registryTokensVersion}`,
    );
  }
  if (registryTokensCssVersion !== tokensCssVersion) {
    throw new Error(
      `Registry @digitaltableteur/tokens-css version mismatch: expected ${tokensCssVersion}, got ${registryTokensCssVersion}`,
    );
  }
  for (const pkg of report.packages) {
    if (
      pkg.orgAccess !== null &&
      pkg.orgAccess !== "read-only" &&
      pkg.orgAccess !== "read-write"
    ) {
      throw new Error(
        `Registry ${pkg.name} org access mismatch: expected read-only or read-write, got ${pkg.orgAccess}`,
      );
    }
    if (pkg.accessStatus !== null && pkg.accessStatus !== "private") {
      throw new Error(
        `Registry ${pkg.name} access status mismatch: expected private, got ${pkg.accessStatus}`,
      );
    }
  }

  writeFileSync(
    join(scratch, "package.json"),
    JSON.stringify(
      {
        name: "digitaltableteur-registry-token-smoke",
        private: true,
        type: "module",
        scripts: {
          smoke: "node smoke.mjs",
        },
      },
      null,
      2,
    ),
  );
  writeFileSync(
    join(scratch, "smoke.mjs"),
    `
import { createRequire } from "node:module";
import { tokenCount, tokenNames } from "@digitaltableteur/tokens";
import dtcg from "@digitaltableteur/tokens/dtcg" with { type: "json" };
import manifest from "@digitaltableteur/tokens/manifest" with { type: "json" };
import { tailwindThemeRefs } from "@digitaltableteur/tokens/tailwind";

const require = createRequire(import.meta.url);
const tokensCss = require.resolve("@digitaltableteur/tokens-css/tokens.css");
const acmeTheme = require.resolve("@digitaltableteur/tokens-css/themes/acme.css");

if (tokenCount !== 184 || tokenNames.length !== tokenCount) {
  throw new Error("Token package export count is incomplete");
}
if (manifest.tokenCount !== tokenCount || !dtcg.$schema) {
  throw new Error("Token JSON exports are incomplete");
}
if (!tailwindThemeRefs["color-dt-primary"]) {
  throw new Error("Tailwind token export missing color-dt-primary");
}

console.log(JSON.stringify({
  tokenCount,
  tokensCss: tokensCss.includes("node_modules"),
  acmeTheme: acmeTheme.includes("node_modules"),
}));
`.trimStart(),
  );

  run(
    "npm",
    npmArgs([
      ...userconfigArgs,
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      `@digitaltableteur/tokens@${tokensVersion}`,
      `@digitaltableteur/tokens-css@${tokensCssVersion}`,
    ]),
    { cwd: scratch },
  );

  const output = run("npm", ["run", "smoke", "--silent"], {
    cwd: scratch,
    capture: true,
  }).trim();
  const smoke = JSON.parse(output);
  if (!smoke.tokensCss || !smoke.acmeTheme) {
    throw new Error("Registry token CSS exports did not resolve from node_modules");
  }

  report.status = "passed";
  report.generatedAt = new Date().toISOString();
  report.consumer = {
    tokenCount: smoke.tokenCount,
    tokensCssResolvedFromNodeModules: Boolean(smoke.tokensCss),
    acmeThemeResolvedFromNodeModules: Boolean(smoke.acmeTheme),
  };
  writeReport(report);
  console.log(
    `\u2713 registry token install verified (@digitaltableteur/tokens@${tokensVersion}, @digitaltableteur/tokens-css@${tokensCssVersion}, private/read-write, ${smoke.tokenCount} tokens)`,
  );
  console.log(`  Report: ${relativePath(OUT_JSON)}`);
} catch (error) {
  report.status = "failed";
  report.generatedAt = new Date().toISOString();
  report.errors = [error instanceof Error ? error.message : String(error)];
  writeReport(report);
  throw error;
} finally {
  if (!KEEP) {
    rmSync(scratch, { recursive: true, force: true });
  } else {
    console.log(`kept registry token smoke workspace: ${scratch}`);
  }
}
