#!/usr/bin/env node
/**
 * One-shot recovery: drop the legacy
 *   declare const expect: (typeof import("vitest"))["expect"];
 * ambient declaration in stories that now import `expect` from
 * `storybook/test`. The ambient declare was meant for an older Storybook
 * setup where `expect` was a global injected by the runtime; in modern
 * Storybook the runtime expose is via the `storybook/test` module, so the
 * import + declare combination produces a "Duplicate declaration 'expect'"
 * parse error and takes the indexer down.
 *
 * Also handles the case where the import and declare ended up on the same
 * line (a previous batch script joined them when stripping newlines).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const root = new URL("../../", import.meta.url).pathname;
const files = execSync(
  `rg -l "declare const expect" nextjs-app`,
  { cwd: root, encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean);

let touched = 0;
for (const rel of files) {
  const path = `${root}${rel}`;
  const original = readFileSync(path, "utf8");
  if (!/from\s+["']storybook\/test["']/.test(original)) continue;
  let next = original;

  // 1) Strip the declare-on-its-own-line, including any preceding
  // single-line comment that explained why it existed.
  next = next.replace(
    /^[ \t]*\/\/[^\n]*expect[^\n]*\n[ \t]*declare\s+const\s+expect\s*:\s*\(typeof\s+import\(["']vitest["']\)\)\[["']expect["']\]\s*;?[ \t]*\n/gm,
    "",
  );
  // 2) Strip the declare-on-its-own-line without preceding comment.
  next = next.replace(
    /^[ \t]*declare\s+const\s+expect\s*:\s*\(typeof\s+import\(["']vitest["']\)\)\[["']expect["']\]\s*;?[ \t]*\n/gm,
    "",
  );
  // 3) Strip the declare when it was concatenated onto the import line.
  next = next.replace(
    /;\s*declare\s+const\s+expect\s*:\s*\(typeof\s+import\(["']vitest["']\)\)\[["']expect["']\]\s*;?/g,
    ";",
  );
  // 4) Also strip a trailing "// expect is available globally..." comment
  // that no longer applies.
  next = next.replace(
    /^[ \t]*\/\/\s*expect is available globally in Storybook browser tests[ \t]*\n/gm,
    "",
  );

  if (next !== original) {
    writeFileSync(path, next);
    touched++;
    console.log(`cleaned: ${rel}`);
  }
}

console.log(`\nDone. Touched ${touched} file(s).`);
