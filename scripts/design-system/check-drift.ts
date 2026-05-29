#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { IN_SCOPE_COMPONENTS } from "./in-scope-components.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const errors = [];

function walk(dir, files = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) files.push(p);
  }
  return files;
}

const appFiles = walk(join(ROOT, "app"));
for (const f of appFiles) {
  const src = readFileSync(f, "utf8");
  if (src.includes("@/components/ui/")) {
    errors.push(`${f}: shadcn import @/components/ui/* — migrate to @dt/*`);
  }
}

const inScope = new Set(IN_SCOPE_COMPONENTS.map((c) => c.name));
for (const f of appFiles) {
  const src = readFileSync(f, "utf8");
  for (const name of inScope) {
    if (src.includes(`@dt/${name}`) || src.includes(`from "@dt/${name}"`)) {
      // ok
    }
  }
}

if (errors.length) {
  console.error("Production drift detected:\n" + errors.map((e) => "  ✗ " + e).join("\n"));
  process.exit(1);
}
console.log("✓ No shadcn drift in app/");
