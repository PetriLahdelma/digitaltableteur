#!/usr/bin/env node
/** Remove erroneous `description: "Arg Types"` and fix broken argType formatting from fill-argtypes-descriptions. */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".stories.tsx")) out.push(p);
  }
  return out;
}

let n = 0;
for (const base of roots) {
  for (const file of walk(base)) {
    let text = readFileSync(file, "utf8");
    const before = text;
    text = text.replace(/\n\s*description: "Arg Types",\n/g, "\n");
    text = text.replace(
      /description: "([^"]+)",\n\s*action:/g,
      'description: "$1",\n      action:',
    );
    text = text.replace(
      /description: "([^"]+)",\n\s*control:/g,
      'description: "$1",\n      control:',
    );
    if (text !== before) {
      writeFileSync(file, text);
      n++;
      console.log(`✓ ${file.replace(ROOT + "/", "")}`);
    }
  }
}
console.log(`fix-argtypes-noise: ${n} file(s)`);
