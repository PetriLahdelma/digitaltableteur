#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import stylelint from "stylelint";
import {
  lintLogicalCss,
  logicalCssRules,
} from "./logical-css-native-styles.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const projectConfig = JSON.parse(
  readFileSync(resolve(ROOT, ".stylelintrc.json"), "utf8"),
);
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "--", "*.css"],
  { cwd: ROOT, encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

if (files.length === 0) {
  console.log("✓ No authored CSS files to migrate");
  process.exit(0);
}

const config = {
  ignoreFiles: projectConfig.ignoreFiles,
  plugins: ["stylelint-plugin-logical-css"],
  rules: logicalCssRules,
};
const audit = await stylelint.lint({
  cwd: ROOT,
  files,
  config,
  fix: false,
});
const driftFiles = audit.results
  .filter((entry) => entry.warnings.length > 0)
  .map((entry) => entry.source);

if (driftFiles.length === 0) {
  console.log(`✓ Logical CSS verified (${files.length} authored CSS files)`);
  process.exit(0);
}

const remaining = [];
for (const file of driftFiles) {
  const source = readFileSync(file, "utf8");
  const result = await lintLogicalCss({ css: source, file }, { fix: true });
  remaining.push(...result.warnings);
  if (result.css !== source) writeFileSync(file, result.css);
}
if (remaining.length > 0) {
  console.error(JSON.stringify(remaining, null, 2));
  process.exit(1);
}

console.log(`✓ Logical CSS autofixed (${driftFiles.length} files changed)`);
