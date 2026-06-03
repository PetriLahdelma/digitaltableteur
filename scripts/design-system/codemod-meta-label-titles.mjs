#!/usr/bin/env node
/**
 * Replace <h3 className={styles.metaLabel}> with @dt/Title on work portfolio pages.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const WORK = join(ROOT, "nextjs-app/shared/components/pages/Work");

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith("Page.tsx")) out.push(full);
  }
}

const files = [];
walk(WORK, files);

let changed = 0;
for (const file of files) {
  let src = readFileSync(file, "utf8");
  if (!src.includes("styles.metaLabel")) continue;

  const next = src.replace(
    /<h3 className=\{styles\.metaLabel\}>([^<]*)<\/h3>/g,
    '<Title as="h3" unstyled className={styles.metaLabel}>$1</Title>',
  );
  if (next === src) continue;

  src = next;
  if (!src.includes('@dt/Title')) {
    const anchor = src.match(/^import .+;\n/m);
    if (anchor) {
      const insertAt = src.indexOf(anchor[0]) + anchor[0].length;
      src = `${src.slice(0, insertAt)}import Title from "@dt/Title";\n${src.slice(insertAt)}`;
    } else {
      src = `import Title from "@dt/Title";\n${src}`;
    }
  }
  writeFileSync(file, src);
  changed += 1;
  console.log("✓", file.replace(`${ROOT}/`, ""));
}

console.log(`Updated ${changed} work page(s).`);
