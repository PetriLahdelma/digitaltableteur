#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TOKEN_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../nextjs-app/shared/foundations/tokens/production",
);
let missing = 0;

function walk(obj: Record<string, unknown>, path: string[] = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    const p = [...path, k].join(".");
    if (v && typeof v === "object") {
      if ("$value" in v && !(v as { $description?: string }).$description) {
        console.error(`Missing $description: ${p}`);
        missing++;
      } else {
        walk(v as Record<string, unknown>, [...path, k]);
      }
    }
  }
}

for (const f of readdirSync(TOKEN_DIR).filter((x) => x.endsWith(".json"))) {
  walk(JSON.parse(readFileSync(join(TOKEN_DIR, f), "utf8")) as Record<string, unknown>);
}

if (missing) process.exit(1);
console.log("✓ Token descriptions complete (production DTCG export)");
