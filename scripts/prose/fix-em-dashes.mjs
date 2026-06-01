#!/usr/bin/env node
/**
 * Replace em/en dashes in MDX body with commas, periods, or colons (headings).
 *
 * Usage:
 *   node scripts/prose/fix-em-dashes.mjs              # dry-run
 *   node scripts/prose/fix-em-dashes.mjs --write
 *   node scripts/prose/fix-em-dashes.mjs --write content/posts/foo.mdx
 *   node scripts/prose/fix-em-dashes.mjs --write --include-drafts
 */

import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  countEmDashes,
  fixEmDashesInBody,
  normalizePunctuationSpacing,
} from "./lib/em-dash.mjs";
import {
  joinMdx,
  readMdxFile,
  splitMdx,
  writeMdxFile,
} from "./lib/mdx-body.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const write = args.includes("--write");
const includeDrafts = args.includes("--include-drafts");
const pathsFromArgs = args.filter((a) => !a.startsWith("--"));

function collectMdxFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...collectMdxFiles(full));
    else if (ent.name.endsWith(".mdx")) files.push(full);
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
    /* ignore */
  }
  return posts;
}

const files = pathsFromArgs.length
  ? pathsFromArgs.map((p) => path.resolve(repoRoot, p))
  : defaultFiles();

let changed = 0;

for (const filePath of files) {
  const rel = path.relative(repoRoot, filePath);
  const source = readMdxFile(filePath);
  const { frontmatter, body } = splitMdx(source);
  const before = countEmDashes(body);
  if (before === 0) continue;

  const newBody = normalizePunctuationSpacing(fixEmDashesInBody(body));
  const after = countEmDashes(newBody);

  if (newBody === body) {
    console.warn(`⚠ ${rel}: ${before} dash(es) but no automatic fix applied`);
    continue;
  }

  console.log(`${write ? "✓" : "→"} ${rel}: ${before} → ${after} em/en dash(es)`);
  if (write) {
    writeMdxFile(filePath, joinMdx(frontmatter, newBody));
    changed += 1;
  }
}

if (!write) {
  console.log("\nDry run. Re-run with --write to apply.");
} else {
  console.log(`\nUpdated ${changed} file(s). Run: npm run prose:check`);
}
