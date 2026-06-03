#!/usr/bin/env node
/**
 * Build composesWith / prefersOver graph from static policy + co-import scan.
 * Writes nextjs-app/shared/foundations/dist/relationship-graph.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMPOSES_WITH,
  PREFERS_OVER,
  REPLACEMENT_FOR,
} from "./component-replacement-policy.mjs";
import { loadCatalogNames, scanComponentUsage } from "./usage-scan-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "nextjs-app/shared/foundations/dist/relationship-graph.json");

const CO_IMPORT_MIN = 3;

/**
 * @param {Map<string, { evidence: Array<{ path: string }> }>} byComponent
 */
function inferCoImports(byComponent) {
  /** @type {Map<string, Map<string, number>>} */
  const pairCounts = new Map();

  for (const [name, usage] of byComponent) {
    for (const hit of usage.evidence ?? []) {
      const filePath = hit.path;
      if (!existsSync(join(ROOT, filePath))) continue;
      const source = readFileSync(join(ROOT, filePath), "utf8");
      const imported = new Set();
      for (const match of source.matchAll(/@dt\/([A-Za-z][A-Za-z0-9]*)/g)) {
        imported.add(match[1]);
      }
      const relatives = source.match(
        /(?:components|patterns)\/([A-Za-z][A-Za-z0-9]*)/g,
      );
      if (relatives) {
        for (const seg of relatives) {
          const leaf = seg.split("/").pop();
          if (leaf) imported.add(leaf);
        }
      }
      const list = [...imported];
      for (let i = 0; i < list.length; i += 1) {
        for (let j = 0; j < list.length; j += 1) {
          if (i === j) continue;
          const from = list[i];
          const to = list[j];
          if (!pairCounts.has(from)) pairCounts.set(from, new Map());
          const inner = pairCounts.get(from);
          inner.set(to, (inner.get(to) ?? 0) + 1);
        }
      }
    }
  }

  /** @type {Record<string, string[]>} */
  const coImport = {};
  for (const [from, targets] of pairCounts) {
    const ranked = [...targets.entries()]
      .filter(([, count]) => count >= CO_IMPORT_MIN)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([target]) => target);
    if (ranked.length) coImport[from] = ranked;
  }
  return coImport;
}

function mergeUnique(...lists) {
  return [...new Set(lists.flat().filter(Boolean))];
}

function main() {
  const catalogNames = loadCatalogNames(ROOT);
  const { byComponent } = scanComponentUsage({ root: ROOT, catalogNames });
  const coImport = inferCoImports(byComponent);

  /** @type {Record<string, { composesWith: string[], prefersOver: string[], replacementFor: string[] }>} */
  const components = {};

  for (const name of catalogNames) {
    components[name] = {
      composesWith: mergeUnique(COMPOSES_WITH[name] ?? [], coImport[name] ?? []),
      prefersOver: PREFERS_OVER[name] ?? [],
      replacementFor: REPLACEMENT_FOR[name] ?? [],
    };
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    description:
      "Agent relationship graph: static policy merged with co-import evidence (min 3 shared files).",
    coImportMinFiles: CO_IMPORT_MIN,
    components,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  const edgeCount = Object.values(components).reduce(
    (n, c) => n + c.composesWith.length,
    0,
  );
  console.log(`✓ relationship-graph.json (${catalogNames.size} nodes, ${edgeCount} composesWith edges)`);
}

main();
