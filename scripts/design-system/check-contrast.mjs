#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const catalog = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), "../../nextjs-app/shared/foundations/token-catalog.json"),
    "utf8",
  ),
);

let failed = 0;
const ENFORCED_THEMES = new Set(["light", "dark"]);
for (const [themeId, rows] of Object.entries(catalog.contrastByTheme ?? {})) {
  if (!ENFORCED_THEMES.has(themeId)) continue;
  for (const row of rows) {
    if (row.pass === false) {
      console.error(`FAIL [${themeId}] ${row.label}: ${row.ratio} (${row.level}) — ${row.fg} on ${row.bg}`);
      failed++;
    }
  }
}
if (failed) process.exit(1);
console.log("✓ All semantic contrast pairs pass WCAG AA");
