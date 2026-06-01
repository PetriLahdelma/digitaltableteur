#!/usr/bin/env node
/**
 * Prose quality gate — AI-slop tells, em dashes, banned vocabulary.
 *
 * Usage:
 *   node scripts/prose/check-prose-slop.mjs
 *   node scripts/prose/check-prose-slop.mjs content/posts/foo.mdx
 *   node scripts/prose/check-prose-slop.mjs --strict
 *   node scripts/prose/check-prose-slop.mjs --include-drafts
 *
 * @see docs/WRITING_STYLE.md
 */

import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  countWords,
  DEFAULT_MAX_EM_DASHES,
  EM_DASH_DENSITY_WARN_PER_500,
  SLOP_RULES,
  DASH_CHARS,
} from "./lib/slop-rules.mjs";
import { proseOnlyForCheck, readMdxFile, splitMdx } from "./lib/mdx-body.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);

const hasFlag = (f) => args.includes(f);
const strict = hasFlag("--strict");
const includeDrafts = hasFlag("--include-drafts");

const pathsFromArgs = args.filter((a) => !a.startsWith("--"));

function collectMdxFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...collectMdxFiles(full));
    } else if (ent.name.endsWith(".mdx")) {
      files.push(full);
    }
  }
  return files;
}

function defaultFiles() {
  const posts = collectMdxFiles(path.join(repoRoot, "content/posts"));
  if (!includeDrafts) return posts;
  const drafts = path.join(repoRoot, "content/drafts");
  try {
    if (statSync(drafts).isDirectory()) {
      return [...posts, ...collectMdxFiles(drafts)];
    }
  } catch {
    /* no drafts dir */
  }
  return posts;
}

const files = pathsFromArgs.length
  ? pathsFromArgs.map((p) => path.resolve(repoRoot, p))
  : defaultFiles();

let errorCount = 0;
let warnCount = 0;

for (const filePath of files) {
  const rel = path.relative(repoRoot, filePath);
  const source = readMdxFile(filePath);
  const { body } = splitMdx(source);
  const prose = proseOnlyForCheck(body);
  const words = countWords(prose);
  const dashCount = (prose.match(new RegExp(DASH_CHARS.source, "g")) ?? []).length;

  if (dashCount > DEFAULT_MAX_EM_DASHES) {
    console.error(
      `✗ ${rel}: ${dashCount} em/en dash(es) (max ${DEFAULT_MAX_EM_DASHES}). Run: npm run prose:fix-em-dashes -- ${rel}`,
    );
    errorCount += 1;
  }

  const densityPer500 = words > 0 ? (dashCount / words) * 500 : 0;
  if (
    dashCount > 0 &&
    densityPer500 > EM_DASH_DENSITY_WARN_PER_500 &&
    dashCount <= DEFAULT_MAX_EM_DASHES
  ) {
    console.warn(
      `⚠ ${rel}: high em-dash density (${densityPer500.toFixed(1)} per 500 words)`,
    );
    warnCount += 1;
  }

  for (const rule of SLOP_RULES) {
    if (rule.id === "em-dash") continue;
    const hit = rule.test(prose);
    if (!hit) continue;

    const isError = rule.severity === "error" || strict;
    const prefix = isError ? "✗" : "⚠";
    const detail =
      hit.sample ?? hit.word ?? (hit.count ? `×${hit.count}` : JSON.stringify(hit));
    console[isError ? "error" : "warn"](`${prefix} ${rel}: [${rule.id}] ${rule.label} — ${detail}`);
    if (isError) errorCount += 1;
    else warnCount += 1;
  }
}

if (errorCount === 0 && warnCount === 0) {
  console.log(`✓ Prose check passed (${files.length} file(s)).`);
  process.exit(0);
}

console.log(
  `\nProse check: ${errorCount} error(s), ${warnCount} warning(s) in ${files.length} file(s).`,
);
console.log("Voice guide: docs/WRITING_STYLE.md");
process.exit(errorCount > 0 ? 1 : 0);
