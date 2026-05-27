#!/usr/bin/env node
/**
 * One-shot recovery: dedupe Storybook test helper imports across stories.
 *
 * Background: An earlier hygiene script inserted
 *   `import { expect, within, userEvent } from "storybook/test";`
 * at the top of stories that already imported the same identifiers from
 * `@storybook/testing-library`, producing
 *   "Identifier 'within' has already been declared"
 * parse errors that took the Storybook indexer down.
 *
 * Fix: for every *.stories.tsx, merge every `storybook/test` and
 * `@storybook/testing-library` named import into a single import from
 * `storybook/test` (the modern path), with no duplicate identifiers.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const root = new URL("../../", import.meta.url).pathname;
const files = execSync(
  `rg -l --type ts -e 'from "storybook/test"' -e 'from "@storybook/testing-library"' nextjs-app`,
  { cwd: root, encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean);

const IMPORT_LINE_RE =
  /^\s*import\s*\{([^}]+)\}\s*from\s*["'](?:storybook\/test|@storybook\/testing-library)["']\s*;?\s*$/gm;

let touched = 0;
for (const rel of files) {
  const path = `${root}${rel}`;
  const original = readFileSync(path, "utf8");

  const collected = new Set();
  let firstIndex = -1;
  let firstLineEnd = -1;

  IMPORT_LINE_RE.lastIndex = 0;
  let m;
  const ranges = [];
  while ((m = IMPORT_LINE_RE.exec(original)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    ranges.push([start, end]);
    if (firstIndex === -1) {
      firstIndex = start;
      firstLineEnd = end;
    }
    for (const raw of m[1].split(",")) {
      const id = raw.trim().replace(/\s+as\s+\w+$/, "").trim();
      if (id) collected.add(id);
    }
  }

  if (ranges.length === 0) continue;
  if (ranges.length === 1 && collected.size > 0) {
    // Single import already; just normalize source to storybook/test.
    const sorted = [...collected].sort();
    const replacement = `import { ${sorted.join(", ")} } from "storybook/test";`;
    if (original.slice(firstIndex, firstLineEnd) === replacement) continue;
    const next =
      original.slice(0, firstIndex) +
      replacement +
      original.slice(firstLineEnd);
    if (next !== original) {
      writeFileSync(path, next);
      touched++;
      console.log(`normalized: ${rel}`);
    }
    continue;
  }

  // Build a single merged import in the position of the FIRST occurrence,
  // strip all other occurrences.
  const sorted = [...collected].sort();
  const merged = `import { ${sorted.join(", ")} } from "storybook/test";`;

  // Walk ranges in reverse so indices stay valid.
  const sortedRanges = ranges.slice().sort((a, b) => b[0] - a[0]);
  let out = original;
  for (const [s, e] of sortedRanges) {
    if (s === firstIndex && e === firstLineEnd) {
      out = out.slice(0, s) + merged + out.slice(e);
    } else {
      // Strip trailing newline as well to avoid leaving a blank line.
      const dropEnd = out[e] === "\n" ? e + 1 : e;
      out = out.slice(0, s) + out.slice(dropEnd);
    }
  }

  if (out !== original) {
    writeFileSync(path, out);
    touched++;
    console.log(`merged: ${rel}`);
  }
}

console.log(`\nDone. Touched ${touched} file(s).`);
