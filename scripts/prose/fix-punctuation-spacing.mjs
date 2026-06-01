#!/usr/bin/env node
/**
 * Clean " , " and heading " : " spacing left after em-dash fixes.
 *
 *   node scripts/prose/fix-punctuation-spacing.mjs --write
 */

import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizePunctuationSpacing } from "./lib/em-dash.mjs";
import {
  joinMdx,
  readMdxFile,
  splitMdx,
  writeMdxFile,
} from "./lib/mdx-body.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const write = process.argv.includes("--write");

function collectMdxFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) return collectMdxFiles(full);
    if (ent.name.endsWith(".mdx")) return [full];
    return [];
  });
}

const files = collectMdxFiles(path.join(repoRoot, "content/posts"));

for (const filePath of files) {
  const rel = path.relative(repoRoot, filePath);
  const source = readMdxFile(filePath);
  const { frontmatter, body } = splitMdx(source);
  const next = normalizePunctuationSpacing(body);
  if (next === body) continue;
  console.log(`${write ? "✓" : "→"} ${rel}`);
  if (write) writeMdxFile(filePath, joinMdx(frontmatter, next));
}

if (!write) console.log("\nDry run. Use --write to apply.");
