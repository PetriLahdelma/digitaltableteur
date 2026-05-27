#!/usr/bin/env node
/**
 * Populate contract.consumers[] from @dt/<Component> imports in app/ and nextjs-app/.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPO = "digitaltableteur/digitaltableteur";
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];
const scanDirs = ["app", "nextjs-app"].map((d) => join(ROOT, d));

let updated = 0;
for (const base of roots) {
  for (const name of readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));

    if (contract.status !== "stable") {
      if (Array.isArray(contract.consumers) && contract.consumers.length > 0) {
        contract.consumers = [];
        writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
        updated += 1;
      }
      continue;
    }

    const hits = [];
    for (const scan of scanDirs) {
      if (!existsSync(scan)) continue;
      try {
        const out = execSync(
          `rg -l "@dt/${name}[^a-zA-Z]" "${scan}" --glob '*.{tsx,ts,jsx,js}' 2>/dev/null || true`,
          { encoding: "utf8" },
        ).trim();
        if (out) {
          for (const file of out.split("\n").filter(Boolean).slice(0, 8)) {
            hits.push({
              repo: REPO,
              path: file.replace(`${ROOT}/`, ""),
              since: "2026-05-27",
            });
          }
        }
      } catch {
        // ignore
      }
    }
    const unique = [...new Map(hits.map((h) => [h.path, h])).values()];
    if (!unique.length) continue;
    if (JSON.stringify(contract.consumers) === JSON.stringify(unique)) continue;
    contract.consumers = unique;
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
    updated += 1;
  }
}
console.log(`audit-consumers: updated ${updated} contracts`);
