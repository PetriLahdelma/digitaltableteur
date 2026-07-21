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
 * Every real component directory, whether or not it has a contract.
 *
 * A directory counts as a component when it contains `<Name>.tsx`. That test is what
 * separates a component from a grouping directory: `components/animations/` holds
 * FadeIn and KineticTitle but has no `animations.tsx`, and `components/ui/` holds only
 * an index barrel.
 *
 * @param {string} root
 * @returns {Set<string>}
 */
function loadComponentDirNames(root) {
  const names = new Set();
  for (const sub of [
    "nextjs-app/shared/components",
    "nextjs-app/shared/patterns",
    "nextjs-app/shared/templates",
  ]) {
    const base = join(root, sub);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (existsSync(join(base, entry.name, `${entry.name}.tsx`))) names.add(entry.name);
    }
  }
  return names;
}

/**
 * @param {Map<string, { evidence: Array<{ path: string }> }>} byComponent
 * @param {Set<string>} knownComponents Names that are real components. The path regex
 *   below cannot tell a component directory from a grouping directory, so every captured
 *   name is checked against this set before it becomes a graph node.
 */
function inferCoImports(byComponent, knownComponents) {
  /** @type {Map<string, Map<string, number>>} */
  const pairCounts = new Map();

  for (const [name, usage] of byComponent) {
    for (const hit of usage.evidence ?? []) {
      const filePath = hit.path;
      if (!existsSync(join(ROOT, filePath))) continue;
      const source = readFileSync(join(ROOT, filePath), "utf8");
      const imported = new Set();
      for (const match of source.matchAll(/@dt\/([A-Za-z][A-Za-z0-9]*)/g)) {
        if (knownComponents.has(match[1])) imported.add(match[1]);
      }
      const relatives = source.match(
        /(?:components|patterns)\/([A-Za-z][A-Za-z0-9]*)/g,
      );
      if (relatives) {
        for (const seg of relatives) {
          const leaf = seg.split("/").pop();
          // `components/animations/FadeIn` captures "animations", a grouping directory
          // rather than a component. Without this guard those became graph nodes that
          // resolve to nothing.
          if (leaf && knownComponents.has(leaf)) imported.add(leaf);
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

function withoutGeneratedAt(payload) {
  const { generatedAt: _generatedAt, ...rest } = payload;
  return rest;
}

function resolveGeneratedAt(nextPayload) {
  if (!existsSync(OUT)) return new Date().toISOString();

  try {
    const previous = JSON.parse(readFileSync(OUT, "utf8"));
    if (
      previous.generatedAt &&
      JSON.stringify(withoutGeneratedAt(previous)) ===
        JSON.stringify(withoutGeneratedAt(nextPayload))
    ) {
      return previous.generatedAt;
    }
  } catch {
    // Fall through to a fresh timestamp if the existing graph is unreadable.
  }

  return new Date().toISOString();
}

function main() {
  const catalogNames = loadCatalogNames(ROOT);
  const { byComponent } = scanComponentUsage({ root: ROOT, catalogNames });
  // Deliberately NOT catalogNames: that set means "has a contract", so filtering by it
  // would silently delete real edges to the components that are missing one. The graph
  // should still record that Container composes with ScrollIndicator; that ScrollIndicator
  // is undocumented is a separate defect, reported by check:relationship-graph.
  const componentDirs = loadComponentDirNames(ROOT);
  const coImport = inferCoImports(byComponent, componentDirs);

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
    generatedAt: null,
    description:
      "Agent relationship graph: static policy merged with co-import evidence (min 3 shared files).",
    coImportMinFiles: CO_IMPORT_MIN,
    components,
  };
  payload.generatedAt = resolveGeneratedAt(payload);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  const edgeCount = Object.values(components).reduce(
    (n, c) => n + c.composesWith.length,
    0,
  );
  console.log(`✓ relationship-graph.json (${catalogNames.size} nodes, ${edgeCount} composesWith edges)`);
}

main();
