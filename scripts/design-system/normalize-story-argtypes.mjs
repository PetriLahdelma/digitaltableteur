#!/usr/bin/env node
/** Remove auto-generated duplicate argTypes/story noise: `description: 'foo control.'` and args `description: 'args control.'` */
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../nextjs-app/shared/components");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".stories.tsx")) out.push(p);
  }
  return out;
}

const noiseArg = /\n\s*description:\s*['"][^'"]+ control\.['"],?/g;
const noiseArgs = /\n\s*description:\s*['"]args control\.['"],?/g;

let files = 0;
for (const file of walk(ROOT)) {
  const before = readFileSync(file, "utf8");
  let after = before.replace(noiseArg, "");
  after = after.replace(noiseArgs, "");
  if (after !== before) {
    writeFileSync(file, after);
    files++;
    console.log("cleaned", file.replace(ROOT + "/", ""));
  }
}
console.log(`Done. ${files} files updated.`);
