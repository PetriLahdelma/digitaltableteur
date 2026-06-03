/**
 * Scan codebase imports to build per-component usage evidence for agents.
 * Detects @dt/<Name> alias imports and relative imports into components/ or patterns/.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, basename, dirname } from "node:path";

const IMPORT_FROM_RE =
  /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,$]+)\s+from\s+["']([^"']+)["']/g;

/** @typedef {"production" | "pattern" | "component" | "story" | "test" | "other"} UsageContext */
/** @typedef {"alias" | "relative"} ImportKind */

/**
 * @param {string} root
 * @returns {Set<string>}
 */
export function loadCatalogNames(root) {
  const names = new Set();
  for (const sub of ["nextjs-app/shared/components", "nextjs-app/shared/patterns"]) {
    const base = join(root, sub);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const contract = join(base, entry.name, `${entry.name}.contract.json`);
      if (existsSync(contract)) names.add(entry.name);
    }
  }
  return names;
}

/**
 * @param {string} filePath
 * @returns {UsageContext}
 */
export function classifyContext(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (/\.stories\.(tsx|ts|jsx|js)$/.test(normalized)) return "story";
  if (/\.(test|a11y\.test)\.(tsx|ts|jsx|js)$/.test(normalized)) return "test";
  if (normalized.includes("/app/") || normalized.startsWith("app/")) {
    if (normalized.includes("/__tests__/")) return "test";
    return "production";
  }
  if (normalized.includes("nextjs-app/shared/components/pages/")) return "production";
  if (normalized.includes("nextjs-app/shared/patterns/")) return "pattern";
  if (normalized.includes("nextjs-app/shared/components/")) return "component";
  return "other";
}

const CONTEXT_RANK = {
  production: 0,
  pattern: 1,
  component: 2,
  story: 3,
  test: 4,
  other: 5,
};

/**
 * @param {string} importPath
 * @param {Set<string>} catalogNames
 * @returns {{ name: string, importKind: ImportKind } | null}
 */
export function resolveCatalogImport(importPath, catalogNames) {
  if (importPath.startsWith("@dt/")) {
    const name = importPath.slice(4).split("/")[0];
    return catalogNames.has(name) ? { name, importKind: "alias" } : null;
  }

  const marker = importPath.match(/(?:^|\/)(components|patterns)\/([A-Za-z][A-Za-z0-9]*)(?:\/|$)/);
  if (marker && catalogNames.has(marker[2])) {
    return { name: marker[2], importKind: "relative" };
  }

  const leaf = basename(importPath);
  if (catalogNames.has(leaf)) {
    return { name: leaf, importKind: "relative" };
  }

  return null;
}

/**
 * @param {string} dir
 * @param {string[]} out
 * @param {(path: string) => boolean} [filter]
 */
function walkSourceFiles(dir, out, filter = () => true) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") {
        continue;
      }
      walkSourceFiles(full, out, filter);
      continue;
    }
    if (!/\.(tsx|ts|jsx|js)$/.test(entry.name)) continue;
    if (!filter(full)) continue;
    out.push(full);
  }
}

/**
 * @param {object} opts
 * @param {string} opts.root
 * @param {Set<string>} [opts.catalogNames]
 * @param {number} [opts.maxEvidencePerComponent]
 * @returns {{
 *   byComponent: Map<string, {
 *     publicImport: string,
 *     importCount: number,
 *     productionImportCount: number,
 *     patternImportCount: number,
 *     componentImportCount: number,
 *     evidence: Array<{ path: string, importKind: ImportKind, importPath: string, context: UsageContext }>
 *   }>,
 *   summary: {
 *     catalogedComponents: number,
 *     withAnyUsage: number,
 *     withProductionUsage: number,
 *     uniqueImportedComponents: number,
 *     totalEvidenceRows: number,
 *     aliasImportFiles: number,
 *     relativeImportFiles: number
 *   }
 * }}
 */
export function scanComponentUsage({
  root,
  catalogNames = loadCatalogNames(root),
  maxEvidencePerComponent = 12,
}) {
  const scanRoots = [
    join(root, "app"),
    join(root, "nextjs-app"),
  ];

  const files = [];
  for (const scanRoot of scanRoots) {
    walkSourceFiles(scanRoot, files);
  }

  /** @type {Map<string, Map<string, { path: string, importKind: ImportKind, importPath: string, context: UsageContext }>>} */
  const hitsByComponent = new Map();
  let aliasImportFiles = 0;
  let relativeImportFiles = 0;

  for (const file of files) {
    const relPath = relative(root, file).replace(/\\/g, "/");
    const context = classifyContext(relPath);
    const source = readFileSync(file, "utf8");
    const seenInFile = new Set();

    for (const match of source.matchAll(IMPORT_FROM_RE)) {
      const importPath = match[1];
      const resolved = resolveCatalogImport(importPath, catalogNames);
      if (!resolved) continue;

      const selfPattern = new RegExp(`(?:components|patterns)/${resolved.name}/`);
      if (selfPattern.test(relPath)) continue;

      const key = `${relPath}::${importPath}`;
      if (seenInFile.has(key)) continue;
      seenInFile.add(key);

      if (resolved.importKind === "alias") aliasImportFiles += 1;
      else relativeImportFiles += 1;

      if (!hitsByComponent.has(resolved.name)) {
        hitsByComponent.set(resolved.name, new Map());
      }
      const componentHits = hitsByComponent.get(resolved.name);
      if (!componentHits.has(relPath)) {
        componentHits.set(relPath, {
          path: relPath,
          importKind: resolved.importKind,
          importPath,
          context,
        });
      }
    }
  }

  /** @type {Map<string, ReturnType<typeof scanComponentUsage>["byComponent"] extends Map<string, infer V> ? V : never>} */
  const byComponent = new Map();

  for (const name of catalogNames) {
    const rawHits = [...(hitsByComponent.get(name)?.values() ?? [])];
    rawHits.sort(
      (a, b) =>
        CONTEXT_RANK[a.context] - CONTEXT_RANK[b.context] ||
        a.path.localeCompare(b.path),
    );

    const evidence = rawHits.slice(0, maxEvidencePerComponent);
    const counts = rawHits.reduce(
      (acc, hit) => {
        acc.importCount += 1;
        if (hit.context === "production") acc.productionImportCount += 1;
        if (hit.context === "pattern") acc.patternImportCount += 1;
        if (hit.context === "component") acc.componentImportCount += 1;
        return acc;
      },
      {
        importCount: 0,
        productionImportCount: 0,
        patternImportCount: 0,
        componentImportCount: 0,
      },
    );

    byComponent.set(name, {
      publicImport: `@dt/${name}`,
      ...counts,
      evidence,
    });
  }

  let withAnyUsage = 0;
  let withProductionUsage = 0;
  let totalEvidenceRows = 0;
  let uniqueImportedComponents = 0;

  for (const usage of byComponent.values()) {
    if (usage.importCount > 0) {
      withAnyUsage += 1;
      uniqueImportedComponents += 1;
      totalEvidenceRows += usage.importCount;
      if (usage.productionImportCount > 0) withProductionUsage += 1;
    }
  }

  return {
    byComponent,
    summary: {
      catalogedComponents: catalogNames.size,
      withAnyUsage,
      withProductionUsage,
      uniqueImportedComponents,
      totalEvidenceRows,
      aliasImportFiles,
      relativeImportFiles,
    },
  };
}

/**
 * Rank cataloged components for a free-text intent query.
 * @param {string} query
 * @param {Array<{ name: string, contract: object, usage?: object }>} components
 * @param {number} [limit]
 */
export function rankComponentsForIntent(query, components, limit = 8) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  const scored = components
    .map((entry) => {
      const { name, contract, usage } = entry;
      const haystack = [
        name,
        contract.description ?? "",
        entry.agent?.intent ?? "",
        ...(entry.agent?.useWhen ?? []),
        contract.tier ?? "",
        contract.group ?? "",
        ...(contract.slots ?? []),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (name.toLowerCase().includes(term)) score += 8;
        if (haystack.includes(term)) score += 3;
      }

      if (usage?.productionImportCount > 0) score += 4;
      else if (usage?.importCount > 0) score += 2;

      if (contract.status === "stable") score += 2;
      else if (contract.status === "beta") score += 1;

      return { name, score, entry };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);

  return scored;
}
