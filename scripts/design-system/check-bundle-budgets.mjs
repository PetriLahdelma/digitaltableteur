#!/usr/bin/env node
/** Lightweight source-size budgets for stable public atoms (Phase 4). */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const STABLE_PUBLIC = [
  "Title",
  "Text",
  "Icon",
  "Badge",
  "Avatar",
  "Button",
  "Card",
  "Link",
  "Label",
  "Container",
  "SiteHeader",
  "SiteFooter",
];
const MAX_BYTES = 28_000;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

let failed = 0;
for (const name of STABLE_PUBLIC) {
  const roots = [
    join(ROOT, "nextjs-app/shared/components", name),
    join(ROOT, "nextjs-app/shared/patterns", name),
  ];
  const dir = roots.find((d) => existsSync(join(d, `${name}.tsx`)));
  if (!dir) continue;
  const tsx = join(dir, `${name}.tsx`);
  const css = join(dir, `${name}.module.css`);
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
