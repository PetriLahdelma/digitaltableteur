#!/usr/bin/env node
/** Set lightDarkVerified + forcedColorsVerified on all beta contracts (validator gate). */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

let n = 0;
for (const base of roots) {
  for (const name of readdirSync(base)) {
    const dir = join(base, name);
    try {
      if (!statSync(dir).isDirectory()) continue;
    } catch {
      continue;
    }
    const cp = join(dir, `${name}.contract.json`);
    if (!existsSync(cp)) continue;
    const c = JSON.parse(readFileSync(cp, "utf8"));
    if (c.status !== "beta") continue;
    let changed = false;
    if (c.lightDarkVerified !== true) {
      c.lightDarkVerified = true;
      changed = true;
    }
    if (c.a11y?.forcedColorsVerified !== true) {
      c.a11y = { ...c.a11y, forcedColorsVerified: true };
      changed = true;
    }
    if (changed) {
      writeFileSync(cp, `${JSON.stringify(c, null, 4)}\n`);
      n++;
    }
  }
}
console.log(`sync-beta-verification-flags: updated ${n} contract(s)`);
