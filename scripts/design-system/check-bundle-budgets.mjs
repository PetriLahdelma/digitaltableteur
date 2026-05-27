#!/usr/bin/env node
/** Lightweight source-size budgets for stable public atoms (Phase 4). */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const STABLE_ATOMS = ["Title", "Text", "Icon", "Badge", "Avatar"];
const MAX_BYTES = 28_000;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

let failed = 0;
for (const name of STABLE_ATOMS) {
  const tsx = join(ROOT, "nextjs-app/shared/components", name, `${name}.tsx`);
  const css = join(ROOT, "nextjs-app/shared/components", name, `${name}.module.css`);
  if (!existsSync(tsx)) continue;
  const total =
    statSync(tsx).size + (existsSync(css) ? statSync(css).size : 0);
  if (total > MAX_BYTES) {
    console.error(`FAIL ${name}: ${total} bytes > ${MAX_BYTES}`);
    failed += 1;
  } else {
    console.log(`✓ ${name}: ${total} bytes`);
  }
}
process.exit(failed ? 1 : 0);
