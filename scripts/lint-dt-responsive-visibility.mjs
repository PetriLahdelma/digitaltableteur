#!/usr/bin/env node
/**
 * Guard: responsive Tailwind display utilities on @dt/Button fight CSS module display.
 * Pattern: pass className to IconButton (wrapper span) or an outer element — not Button.
 *
 *   npm run lint:dt-responsive-visibility
 *   npm run lint:dt-responsive-visibility -- --strict
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

const SCAN_ROOTS = [
  join(ROOT, "app"),
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

const SKIP = [".test.", ".stories.", "/node_modules/", "/IconButton/"];

/** lg:hidden, sm:flex, etc. on the same opening tag as Button */
const RESPONSIVE_DISPLAY =
  /\b(?:sm|md|lg|xl|2xl):(hidden|block|flex|inline-flex|inline|grid)\b/;

const DT_BUTTON_TAG = /<Button\b/;

function walk(dir, out) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, out);
      continue;
    }
    if (!/\.(tsx|jsx)$/.test(entry.name)) continue;
    const rel = relative(ROOT, full).replace(/\\/g, "/");
    if (SKIP.some((s) => rel.includes(s))) continue;
    out.push(full);
  }
}

function scanFile(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  const text = readFileSync(filePath, "utf8");
  if (!/from\s+["']@dt\/Button["']/.test(text) && !/import\s+Button\s+from\s+["']@dt\/Button["']/.test(text)) {
    return [];
  }

  const findings = [];
  const tagRe = /<Button\b[^>]*>/gs;
  let match;
  while ((match = tagRe.exec(text)) !== null) {
    const tag = match[0];
    if (!RESPONSIVE_DISPLAY.test(tag)) continue;
    const line = text.slice(0, match.index).split("\n").length;
    findings.push({
      file: rel,
      line,
      snippet: tag.replace(/\s+/g, " ").slice(0, 100),
    });
  }
  return findings;
}

const files = [];
for (const root of SCAN_ROOTS) walk(root, files);

const all = files.flatMap(scanFile);

if (!all.length) {
  console.log("✓ lint:dt-responsive-visibility — no responsive display classes on <Button>");
  process.exit(0);
}

console.error(
  `lint:dt-responsive-visibility — ${all.length} issue(s): use a wrapper (see IconButton) instead of lg:hidden on @dt/Button\n`,
);
for (const f of all) {
  console.error(`  ${f.file}:${f.line}  ${f.snippet}`);
}
console.error(
  "\nSee docs/DS_AUTOMATION_STRATEGY.md and nextjs-app/shared/components/IconButton/IconButton.tsx",
);

process.exit(strict ? 1 : 0);
