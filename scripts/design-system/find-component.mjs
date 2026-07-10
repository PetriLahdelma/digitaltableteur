#!/usr/bin/env node
/**
 * Rank cataloged @dt components for a free-text intent query.
 *
 *   npm run find-component -- "dismissible warning banner"
 *   npm run find-component -- --json "primary action button"
 *   npm run find-component -- --include-deprecated "legacy hero"
 *
 * Deprecated components are excluded by default so agents are never steered
 * toward them (docs/design-system/deprecation-policy.md R3).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadCatalogNames,
  rankComponentsForIntent,
  scanComponentUsage,
} from "./usage-scan-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MANIFEST = join(ROOT, "nextjs-app/shared/foundations/dist/agent-manifest.json");
const jsonMode = process.argv.includes("--json");
const includeDeprecated = process.argv.includes("--include-deprecated");
const query = process.argv
  .slice(2)
  .filter((arg) => arg !== "--json" && arg !== "--include-deprecated")
  .join(" ")
  .trim();

if (!query) {
  console.error("Usage: npm run find-component -- [--json] \"your intent\"");
  process.exit(1);
}

/** @type {Array<{ name: string, contract: object, usage?: object }>} */
let components;

if (existsSync(MANIFEST)) {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  components = manifest.components ?? [];
} else {
  const catalogNames = loadCatalogNames(ROOT);
  const { byComponent } = scanComponentUsage({ root: ROOT, catalogNames });
  components = [...catalogNames].map((name) => {
    const contractPath = [
      join(ROOT, "nextjs-app/shared/components", name, `${name}.contract.json`),
      join(ROOT, "nextjs-app/shared/patterns", name, `${name}.contract.json`),
    ].find((p) => existsSync(p));
    const contract = contractPath
      ? JSON.parse(readFileSync(contractPath, "utf8"))
      : { name, description: "", status: "alpha" };
    return { name, contract, usage: byComponent.get(name) };
  });
}

const deprecatedCount = components.filter(
  (component) => component.contract?.status === "deprecated",
).length;
if (!includeDeprecated) {
  components = components.filter(
    (component) => component.contract?.status !== "deprecated",
  );
}

const ranked = rankComponentsForIntent(query, components, 8);

if (jsonMode) {
  process.stdout.write(
    `${JSON.stringify(
      {
        query,
        matches: ranked.map(({ name, score, entry }) => ({
          name,
          score,
          publicImport: entry.usage?.publicImport ?? entry.agent?.preferredImport ?? `@dt/${name}`,
          status: entry.contract?.status,
          tier: entry.contract?.tier,
          description: entry.contract?.description,
          intent: entry.agent?.intent,
          variants: entry.agent?.variants ?? {},
          useWhen: entry.agent?.useWhen ?? [],
          avoidWhen: entry.agent?.avoidWhen ?? [],
          replacementFor: entry.agent?.replacementFor ?? [],
          composesWith: entry.agent?.composesWith ?? [],
          productionImportCount: entry.usage?.productionImportCount ?? 0,
          importCount: entry.usage?.importCount ?? 0,
          topEvidence: entry.usage?.evidence?.slice(0, 3) ?? [],
        })),
      },
      null,
      2,
    )}\n`,
  );
  process.exit(0);
}

console.log(`Intent: ${query}`);
console.log("Matches:");
if (!ranked.length) {
  console.log("  (no ranked matches — try broader terms or npm run audit:usage)");
  process.exit(0);
}

for (const { name, score, entry } of ranked) {
  const usage = entry.usage;
  console.log(
    `  ${name}  score=${score}  ${entry.contract?.status}/${entry.contract?.tier}  import=${usage?.publicImport ?? `@dt/${name}`}`,
  );
  if (entry.contract?.description) {
    console.log(`    ${entry.contract.description}`);
  }
  if (usage?.productionImportCount) {
    console.log(
      `    production usage: ${usage.productionImportCount} file(s); e.g. ${usage.evidence.find((e) => e.context === "production")?.path ?? usage.evidence[0]?.path}`,
    );
  }
}
if (!includeDeprecated && deprecatedCount > 0) {
  console.log(
    `  (${deprecatedCount} deprecated component(s) hidden — pass --include-deprecated to see them)`,
  );
}
