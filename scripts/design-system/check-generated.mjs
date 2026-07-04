#!/usr/bin/env node
/** Fail if generated dist artifacts are stale vs sources. */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const required = [
  "nextjs-app/shared/foundations/dist/agent-manifest.json",
  "nextjs-app/shared/foundations/dist/component-agent-blocks.json",
  "nextjs-app/shared/foundations/dist/tokens-manifest.json",
  "nextjs-app/shared/foundations/dist/component-catalog.zod.ts",
  "nextjs-app/shared/foundations/dist/docs-registry.json",
];

for (const rel of required) {
  if (!existsSync(join(ROOT, rel))) {
    console.error(`FAIL: missing generated file ${rel}`);
    process.exit(1);
  }
}

execSync("npm run build:tokens", { cwd: ROOT, stdio: "pipe" });
execSync("npm run build:zod-catalog", { cwd: ROOT, stdio: "pipe" });

const trackedDistFiles = execSync(
  "git ls-files nextjs-app/shared/foundations/dist",
  { cwd: ROOT, encoding: "utf8" },
).trim();

const pathsToCheck = [
  "app/tailwind.css",
  "nextjs-app/shared/foundations/token-catalog.json",
];
if (trackedDistFiles) {
  pathsToCheck.push("nextjs-app/shared/foundations/dist");
}

const dirty = execSync(`git diff HEAD --name-only ${pathsToCheck.join(" ")}`, {
  cwd: ROOT,
  encoding: "utf8",
}).trim();

if (dirty) {
  console.error(
    "FAIL: generated artifacts are stale. Run npm run build:tokens && npm run build:zod-catalog and commit the outputs.",
  );
  console.error(dirty);
  if (!trackedDistFiles) {
    console.error(
      "Note: foundations/dist is not tracked in git; app/tailwind.css and token-catalog.json are checked for drift.",
    );
  }
  process.exit(1);
}

console.log("✓ generated artifacts are up to date");
