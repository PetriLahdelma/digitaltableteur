#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_ROOT = join(ROOT, "packages/web-components");

function run(command, args, cwd = ROOT) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

run("npm", ["run", "build"], PACKAGE_ROOT);
run("npx", ["vitest", "run", "tests/web-components/web-components.test.ts"]);

await import(pathToFileURL(join(PACKAGE_ROOT, "dist/index.js")));
await import(pathToFileURL(join(PACKAGE_ROOT, "dist/native.js")));

const manifest = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, "custom-elements.json"), "utf8"),
);
const declarations = manifest.modules?.flatMap((module) => module.declarations ?? []) ?? [];
const tags = declarations.map((declaration) => declaration.tagName).sort();
const expectedTags = ["dt-badge", "dt-button", "dt-progress", "dt-spinner"];
if (JSON.stringify(tags) !== JSON.stringify(expectedTags)) {
  throw new Error(`Custom Elements Manifest tags differ: ${tags.join(", ")}`);
}

const packOutput = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: PACKAGE_ROOT,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});
const [pack] = JSON.parse(packOutput);
const files = new Set(pack.files.map((file) => file.path));
for (const required of [
  "README.md",
  "custom-elements.json",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/native.js",
  "dist/react.js",
  "dist/register.js",
  "package.json",
]) {
  if (!files.has(required)) throw new Error(`Web-components tarball misses ${required}`);
}
if (pack.entryCount > 40 || pack.unpackedSize > 120_000) {
  throw new Error(
    `Web-components tarball exceeds its ceiling (${pack.entryCount} files, ${pack.unpackedSize} bytes)`,
  );
}

console.log(
  `✓ web-components package verified (${tags.length} tags, ${pack.entryCount} packed files)`,
);
