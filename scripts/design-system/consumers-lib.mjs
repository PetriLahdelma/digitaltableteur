/**
 * Compute production consumers[] for stable component contracts.
 * Follows @dt/, @digitaltableteur/react, @/, and relative imports from app /
 * patterns / pages (transitive).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const CONSUMER_REPO = "digitaltableteur/digitaltableteur";

const COMPONENT_ROOTS = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

/** Production entry surfaces — paths recorded in consumers[]. */
const ENTRY_ROOTS = [
  join(ROOT, "app"),
  join(ROOT, "providers"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/components/pages"),
].filter((d) => existsSync(d));

/** Modules we follow when resolving local import graph. */
const MODULE_ROOTS = [
  join(ROOT, "app"),
  join(ROOT, "providers"),
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
].filter((d) => existsSync(d));

const MODULE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];
const MAX_CONSUMERS_PER_COMPONENT = 12;
const SKIP_SEGMENTS = ["/__tests__/", ".test.", ".stories.", ".a11y.test."];

/** @type {Map<string, { dt: Set<string>, deps: Set<string> }> | null} */
let moduleGraph = null;

function relPath(abs) {
  return relative(ROOT, abs).replace(/\\/g, "/");
}

function shouldSkipRel(rel) {
  return SKIP_SEGMENTS.some((seg) => rel.includes(seg));
}

function isProductionModule(abs) {
  const rel = relPath(abs);
  if (shouldSkipRel(rel)) return false;
  return (
    rel.startsWith("app/") ||
    rel.startsWith("providers/") ||
    rel.startsWith("nextjs-app/shared/components/") ||
    rel.startsWith("nextjs-app/shared/patterns/")
  );
}

function resolveToFile(basePath) {
  if (existsSync(basePath) && statSync(basePath).isFile()) {
    if (MODULE_EXTENSIONS.includes(extname(basePath))) return basePath;
  }
  for (const ext of MODULE_EXTENSIONS) {
    const withExt = `${basePath}${ext}`;
    if (existsSync(withExt)) return withExt;
  }
  if (existsSync(basePath) && statSync(basePath).isDirectory()) {
    for (const ext of MODULE_EXTENSIONS) {
      const indexFile = join(basePath, `index${ext}`);
      if (existsSync(indexFile)) return indexFile;
    }
  }
  return null;
}

function resolveDtImport(spec) {
  if (!spec.startsWith("@dt/")) return null;
  const name = spec.slice(4).split("/")[0];
  return resolveComponentByName(name);
}

function resolveComponentByName(name) {
  for (const base of COMPONENT_ROOTS) {
    const dir = join(base, name);
    const contract = join(dir, `${name}.contract.json`);
    if (!existsSync(contract)) continue;
    return resolveToFile(join(dir, name)) ?? resolveToFile(dir);
  }
  return null;
}

/** Catalog component name when a module path resolves inside a contract folder. */
function componentNameFromResolvedPath(resolved) {
  const rel = relPath(resolved);
  for (const base of COMPONENT_ROOTS) {
    const prefix = `${relPath(base)}/`;
    if (!rel.startsWith(prefix)) continue;
    const name = rel.slice(prefix.length).split("/")[0];
    if (existsSync(join(base, name, `${name}.contract.json`))) return name;
  }
  return null;
}

/**
 * @param {string} fromFile
 * @param {string} spec
 */
function resolveLocalImport(fromFile, spec) {
  if (spec.startsWith("@dt/")) return null;
  if (!spec.startsWith(".") && !spec.startsWith("@/")) return null;

  let target;
  if (spec.startsWith("@/")) {
    target = join(ROOT, spec.slice(2));
  } else {
    target = resolve(dirname(fromFile), spec);
  }
  const resolved = resolveToFile(target);
  if (!resolved || !isProductionModule(resolved)) return null;
  return resolved;
}

/**
 * Resolve any import spec to a production module (local, @/, or @dt/).
 * @param {string} fromFile
 * @param {string} spec
 */
function resolveImport(fromFile, spec) {
  return resolveLocalImport(fromFile, spec) ?? resolveDtImport(spec);
}

/**
 * @param {string} content
 */
function parseDtComponents(content) {
  const names = new Set();
  const re = /@dt\/([A-Z][A-Za-z0-9]*)/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    names.add(match[1]);
  }
  return names;
}

function parsePackageComponents(content) {
  const names = new Set();
  // Anchor the brace group directly to the barrel `from` clause. `[^{}]*`
  // cannot cross another import's braces, so a preceding `import { … } from
  // "react"` no longer bleeds into this match (the old `[\s\S]*?` did, which
  // silently dropped every barrel-consumed component to zero). An optional
  // default binding and a whole-import `type ` prefix are tolerated.
  const re =
    /\bimport\s+(?:[A-Za-z0-9_$]+\s*,\s*)?(type\s+)?\{([^{}]*)\}\s+from\s+["']@digitaltableteur\/react["']/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const isTypeOnly = Boolean(match[1]);
    if (isTypeOnly) continue;
    for (const raw of match[2].split(",")) {
      const local = raw
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim();
      if (!/^[A-Z][A-Za-z0-9]*$/.test(local)) continue;
      if (!resolveComponentByName(local)) continue;
      names.add(local);
    }
  }
  return names;
}

/**
 * @param {string} content
 */
function parseImportSpecs(content) {
  const specs = new Set();
  const re =
    /\b(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,$]+?\sfrom\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    specs.add(match[1]);
  }
  // Dynamic imports (next/dynamic, React.lazy, bare `import("…")`) are real
  // production dependencies — they ship to the client, just code-split/lazy.
  // Follow them so components reached only through a dynamic boundary (e.g.
  // ChatWidget/CookieConsent mounted via next/dynamic in NextLayout) are not
  // undercounted to zero consumers.
  const dyn = /\bimport\s*\(\s*["']([^"']+)["']/g;
  let dm;
  while ((dm = dyn.exec(content)) !== null) {
    specs.add(dm[1]);
  }
  return specs;
}

function walkTsx(dir, out) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walkTsx(full, out);
      continue;
    }
    if (!/\.(tsx|ts|jsx|js)$/.test(entry.name)) continue;
    const rel = relPath(full);
    if (shouldSkipRel(rel)) continue;
    out.push(full);
  }
}

function buildModuleGraph() {
  if (moduleGraph) return moduleGraph;
  const files = [];
  for (const root of MODULE_ROOTS) walkTsx(root, files);

  /** @type {Map<string, { dt: Set<string>, deps: Set<string> }>} */
  const graph = new Map();
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const dt = parseDtComponents(content);
    const deps = new Set();
    for (const name of parsePackageComponents(content)) {
      dt.add(name);
      const resolved = resolveComponentByName(name);
      if (resolved) deps.add(resolved);
    }
    for (const spec of parseImportSpecs(content)) {
      const resolved = resolveImport(file, spec);
      if (!resolved) continue;
      deps.add(resolved);
      const localComponent = componentNameFromResolvedPath(resolved);
      if (localComponent) dt.add(localComponent);
    }
    graph.set(file, { dt, deps });
  }
  moduleGraph = graph;
  return graph;
}

function collectEntryFiles() {
  const entries = [];
  for (const root of ENTRY_ROOTS) walkTsx(root, entries);
  return entries;
}

/**
 * @param {string} entryFile
 * @param {string} componentName
 * @param {Map<string, { dt: Set<string>, deps: Set<string> }>} graph
 */
function entryUsesComponent(entryFile, componentName, graph) {
  const visited = new Set();
  const stack = [entryFile];
  while (stack.length) {
    const file = stack.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    const node = graph.get(file);
    if (!node) continue;
    if (node.dt.has(componentName)) return true;
    for (const dep of node.deps) stack.push(dep);
  }
  return false;
}

/**
 * @param {string} componentName
 * @returns {Array<{ repo: string, path: string, since: string }>}
 */
export function computeConsumersForComponent(componentName) {
  const graph = buildModuleGraph();
  const hits = [];
  for (const entry of collectEntryFiles()) {
    if (!entryUsesComponent(entry, componentName, graph)) continue;
    hits.push({
      repo: CONSUMER_REPO,
      path: relPath(entry),
      since: "2026-06-04",
    });
  }
  const unique = [...new Map(hits.map((h) => [h.path, h])).values()];
  unique.sort((a, b) => a.path.localeCompare(b.path));
  return unique.slice(0, MAX_CONSUMERS_PER_COMPONENT);
}

/**
 * @returns {Generator<{ name: string, contractPath: string, expected: object[], status: string }>}
 */
export function* iterStableContracts() {
  for (const base of COMPONENT_ROOTS) {
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)) {
      const contractPath = join(base, name, `${name}.contract.json`);
      if (!existsSync(contractPath)) continue;
      yield {
        name,
        contractPath,
        status: "pending",
        expected: [],
      };
    }
  }
}

/**
 * @param {object} contract
 * @param {string} componentName
 */
export function expectedConsumers(contract, componentName) {
  if (contract.status !== "stable") return [];
  return computeConsumersForComponent(componentName);
}

/**
 * @param {unknown} a
 * @param {unknown} b
 */
export function consumersEqual(a, b) {
  const paths = (arr) =>
    [...new Set((arr ?? []).map((entry) => entry.path))].sort();
  const left = paths(a);
  const right = paths(b);
  return (
    left.length === right.length && left.every((path, i) => path === right[i])
  );
}

/** @internal test hook */
export function resetConsumerGraphCache() {
  moduleGraph = null;
}
