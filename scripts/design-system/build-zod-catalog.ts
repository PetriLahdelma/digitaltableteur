#!/usr/bin/env tsx
/**
 * Generate Zod schemas for component contracts (agent consumption).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, "nextjs-app/shared/foundations/dist");
const OUT_FILE = join(OUT_DIR, "component-catalog.zod.ts");

const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

const entries: string[] = [];

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const contractPath = join(base, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    entries.push(
      `  ${JSON.stringify(name)}: z.object({ status: z.enum(["alpha","beta","stable","deprecated"]), tier: z.string(), group: z.string(), description: z.string(), requiredStories: z.array(z.string()) }),`,
    );
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const content = `/** Auto-generated — npm run build:zod-catalog */
import { z } from "zod";

export const componentCatalogSchema = z.record(
  z.string(),
  z.object({
    status: z.enum(["alpha", "beta", "stable", "deprecated"]),
    tier: z.string(),
    group: z.string(),
    description: z.string(),
    requiredStories: z.array(z.string()),
  }),
);

export const componentCatalog = {
${entries.join("\n")}
} as const;

export type ComponentCatalog = typeof componentCatalog;
`;

writeFileSync(OUT_FILE, content);
console.log(`build-zod-catalog: wrote ${OUT_FILE} (${entries.length} components)`);
