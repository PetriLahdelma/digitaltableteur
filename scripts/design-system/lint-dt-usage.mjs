#!/usr/bin/env node
/**
 * Warn when product UI uses raw HTML primitives where @dt/* components exist.
 *
 *   npm run lint:dt-usage
 *   npm run lint:dt-usage -- --strict
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DT_USAGE_EXEMPT_REL,
  DT_USAGE_RULES,
  DT_USAGE_SCAN_ROOTS,
  DT_USAGE_SKIP_SEGMENTS,
} from "./dt-usage-rules.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const strict = process.argv.includes("--strict");

const SCAN_ROOTS = DT_USAGE_SCAN_ROOTS.map((segment) => join(ROOT, segment));
const SKIP_SEGMENTS = DT_USAGE_SKIP_SEGMENTS;
const RULES = DT_USAGE_RULES;

function shouldScan(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  if (DT_USAGE_EXEMPT_REL.has(rel)) return false;
  if (SKIP_SEGMENTS.some((seg) => rel.includes(seg))) return false;
  return /\.(tsx|jsx)$/.test(rel);
}

function walk(dir, out) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, out);
      continue;
    }
    if (shouldScan(full)) out.push(full);
  }
}

const files = [];
for (const root of SCAN_ROOTS) walk(root, files);

const findings = [];

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*")
    ) {
      continue;
    }
    for (const rule of RULES) {
      if (!rule.pattern.test(line)) continue;
      findings.push({
        file: rel,
        line: i + 1,
        rule: rule.id,
        message: rule.message,
        suggest: rule.suggest,
        snippet: line.trim().slice(0, 120),
      });
    }
  }
}

if (!findings.length) {
  console.log(
    `✓ lint:dt-usage — no violations in ${DT_USAGE_SCAN_ROOTS.join(", ")}`,
  );
  process.exit(0);
}

console.log(`lint:dt-usage — ${findings.length} finding(s):`);
for (const f of findings.slice(0, 40)) {
  console.log(`  ${f.file}:${f.line} [${f.rule}] ${f.message}`);
}
if (findings.length > 40) {
  console.log(`  … and ${findings.length - 40} more`);
}

if (strict) {
  console.error("\nStrict mode: fix violations or add an explicit exemption.");
  process.exit(1);
}

console.log("\n(warn-only — pass --strict to fail CI)");
process.exit(0);
