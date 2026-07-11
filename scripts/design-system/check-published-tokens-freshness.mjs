#!/usr/bin/env node
/**
 * Published-tokens freshness tripwire.
 *
 * The published @digitaltableteur/tokens-css drifted silently behind
 * variables.css for two days (#1051/#1064 shipped stale until 0.1.1) because
 * nothing compared registry contents against a fresh build:tokens output.
 * This check npm-packs the published tokens packages and diffs their dist
 * contents against the locally assembled packages/<pkg>/dist, ignoring
 * generated timestamps.
 *
 * Wiring policy (deliberate): legitimate token changes ARE drift until the
 * next publish, so this can never be a hard always-on gate.
 *   - default: report-only — prints drift details, always exits 0
 *   - --max-age-days N: exits 1 only when drift exists AND the newest commit
 *     touching the token sources is older than N days (a forgotten republish,
 *     not an in-flight change). Pre-push runs this with N=7.
 *   - --strict: exits 1 on any drift (manual use right after a publish).
 * Registry unreachable / read token missing → warn and exit 0 (pre-push must
 * work offline).
 *
 * Assumes packages/<pkg>/dist is freshly assembled (run build:tokens first;
 * the pre-push chain already does).
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PACKAGES = ["tokens", "tokens-css"];
const TOKEN_SOURCES = [
  "nextjs-app/shared/styles/variables.css",
  "packages/tokens",
  "packages/tokens-css",
];

/** Strip volatile fields so only real content counts as drift. */
export function normalizeForCompare(fileName, content) {
  if (!fileName.endsWith(".json")) return content;
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") delete parsed.generatedAt;
    return JSON.stringify(parsed);
  } catch {
    return content;
  }
}

/** List files recursively, relative to dir. */
function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else out.push(relative(dir, p));
    }
  };
  walk(dir);
  return out.sort();
}

/** Diff two dist directories → array of human-readable drift lines. */
export function diffDistDirs(publishedDir, localDir) {
  const published = new Set(listFiles(publishedDir));
  const local = new Set(listFiles(localDir));
  const drift = [];
  for (const f of published) {
    if (!local.has(f)) drift.push(`only in published: ${f}`);
  }
  for (const f of local) {
    if (!published.has(f)) drift.push(`only in local build: ${f}`);
  }
  for (const f of published) {
    if (!local.has(f)) continue;
    const a = normalizeForCompare(f, readFileSync(join(publishedDir, f), "utf8"));
    const b = normalizeForCompare(f, readFileSync(join(localDir, f), "utf8"));
    if (a !== b) drift.push(`content differs: ${f}`);
  }
  return drift;
}

function npmEnv() {
  const userconfig = join(ROOT, ".npm-userconfig");
  return {
    ...process.env,
    ...(existsSync(userconfig) ? { NPM_CONFIG_USERCONFIG: userconfig } : {}),
  };
}

function newestTokenSourceCommitEpoch() {
  const out = execFileSync(
    "git",
    ["log", "-1", "--format=%ct", "--", ...TOKEN_SOURCES],
    { cwd: ROOT, encoding: "utf8" },
  ).trim();
  return out ? Number(out) : null;
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const maxAgeIdx = args.indexOf("--max-age-days");
  const maxAgeDays = maxAgeIdx >= 0 ? Number(args[maxAgeIdx + 1]) : null;

  const perPackage = [];
  const tmp = mkdtempSync(join(tmpdir(), "dt-tokens-freshness-"));
  try {
    for (const pkg of PACKAGES) {
      const localDist = join(ROOT, "packages", pkg, "dist");
      if (!existsSync(localDist)) {
        console.warn(
          `⚠ published-tokens freshness: packages/${pkg}/dist missing — run build:tokens first; skipping.`,
        );
        return 0;
      }
      const name = `@digitaltableteur/${pkg}`;
      let version;
      try {
        version = execFileSync("npm", ["view", name, "version"], {
          cwd: ROOT,
          encoding: "utf8",
          env: npmEnv(),
          stdio: ["ignore", "pipe", "pipe"],
        }).trim();
        execFileSync(
          "npm",
          ["pack", `${name}@${version}`, "--pack-destination", tmp, "--silent"],
          { cwd: tmp, encoding: "utf8", env: npmEnv(), stdio: ["ignore", "pipe", "pipe"] },
        );
      } catch {
        console.warn(
          `⚠ published-tokens freshness: registry unreachable or token missing for ${name} — skipping (offline-safe).`,
        );
        return 0;
      }
      const tarball = readdirSync(tmp).find(
        (f) => f.startsWith(`digitaltableteur-${pkg}-`) && f.endsWith(".tgz"),
      );
      const extractDir = join(tmp, pkg);
      execFileSync("mkdir", ["-p", extractDir]);
      execFileSync("tar", ["xzf", join(tmp, tarball), "-C", extractDir]);
      const publishedDist = join(extractDir, "package", "dist");
      if (!existsSync(publishedDist)) {
        console.warn(
          `⚠ published-tokens freshness: ${name}@${version} tarball has no dist/ — layout changed, update this check.`,
        );
        return 0;
      }
      const drift = diffDistDirs(publishedDist, localDist);
      perPackage.push({ name, version, drift });
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const drifted = perPackage.filter((p) => p.drift.length > 0);
  if (drifted.length === 0) {
    console.log(
      `✓ published tokens packages match the local build (${perPackage
        .map((p) => `${p.name}@${p.version}`)
        .join(", ")})`,
    );
    return 0;
  }

  const sourceEpoch = newestTokenSourceCommitEpoch();
  const ageDays = sourceEpoch
    ? (Date.now() / 1000 - sourceEpoch) / 86400
    : null;

  for (const p of drifted) {
    console.warn(
      `⚠ published ${p.name}@${p.version} differs from the local build:tokens output:`,
    );
    for (const line of p.drift.slice(0, 10)) console.warn(`    ${line}`);
  }
  console.warn(
    `  Newest token-source commit is ${ageDays === null ? "unknown" : ageDays.toFixed(1) + " days"} old.`,
  );
  console.warn(
    `  If the token change is final, republish via ds-publish.yml (package=${drifted
      .map((p) => p.name.split("/")[1])
      .join(",")}); see docs/design-system/npm-consumer-setup.md.`,
  );

  if (strict) {
    console.error("✖ published-tokens freshness (--strict): drift present.");
    return 1;
  }
  if (maxAgeDays !== null && ageDays !== null && ageDays > maxAgeDays) {
    console.error(
      `✖ published-tokens freshness: drift is older than ${maxAgeDays} days — the republish was forgotten.`,
    );
    return 1;
  }
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
