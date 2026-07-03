#!/usr/bin/env node
/**
 * Astryx Phase 2 sidebar regroup (one-shot codemod, kept for the record).
 *
 * Retitles component stories from the legacy Atoms/Molecules/Organisms
 * taxonomy to the DOC_TIER_1 category taxonomy (Actions, Content, Forms,
 * Feedback, Navigation, Layout) with Tier 2 under Site/, and renames the
 * colocated story-id-keyed __a11y-snapshots__ YAMLs to the new id prefixes.
 *
 * Dry-run by default; pass --write to apply.
 */
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DOC_TIER_1, DOC_TIER_1_CATEGORIES } from "./doc-tiers.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const COMPONENTS = join(ROOT, "nextjs-app/shared/components");
const WRITE = process.argv.includes("--write");

/** Sidebar category per DOC_TIER_1 name (single source: doc-tiers.mjs). */
const CATEGORY = new Map();
for (const [category, names] of Object.entries(DOC_TIER_1_CATEGORIES)) {
  for (const name of names) CATEGORY.set(name, category);
}
const missing = DOC_TIER_1.filter((name) => !CATEGORY.has(name));
if (missing.length) {
  console.error(`CATEGORIES out of sync with DOC_TIER_1: ${missing.join(", ")}`);
  process.exit(1);
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const rows = [];
for (const dirent of readdirSync(COMPONENTS, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const name = dirent.name;
  const dir = join(COMPONENTS, name);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".stories.tsx"))) {
    const path = join(dir, file);
    const src = readFileSync(path, "utf8");
    const match = src.match(/title:\s*["'](Atoms|Molecules|Organisms)\/([^"']+)["']/);
    if (!match) continue;
    const remainder = match[2];
    const group = CATEGORY.get(name) ?? "Site";
    const oldTitle = `${match[1]}/${remainder}`;
    const newTitle = `${group}/${remainder}`;
    rows.push({ name, dir, path, src, oldTitle, newTitle });
  }
}

console.log(`${rows.length} story files to retitle:`);
for (const row of rows) {
  console.log(`  ${row.oldTitle}  ->  ${row.newTitle}`);
}

if (!WRITE) {
  console.log("\nDry run. Pass --write to apply (titles + a11y snapshot renames).");
  process.exit(0);
}

let renamed = 0;
for (const row of rows) {
  const updated = row.src.replace(
    /title:\s*["'](?:Atoms|Molecules|Organisms)\/([^"']+)["']/,
    `title: "${row.newTitle}"`,
  );
  writeFileSync(row.path, updated);

  const snapDir = join(row.dir, "__a11y-snapshots__");
  if (!existsSync(snapDir)) continue;
  const oldPrefix = slugify(row.oldTitle);
  const newPrefix = slugify(row.newTitle);
  for (const file of readdirSync(snapDir)) {
    if (!file.startsWith(`${oldPrefix}--`)) continue;
    renameSync(
      join(snapDir, file),
      join(snapDir, `${newPrefix}--${file.slice(oldPrefix.length + 2)}`),
    );
    renamed += 1;
  }
}
console.log(`\nApplied ${rows.length} retitles, renamed ${renamed} a11y snapshots.`);
