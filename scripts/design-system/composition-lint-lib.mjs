/**
 * Product-surface composition lint — incompatible @dt import pairs.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INCOMPATIBLE_DT_IMPORT_PAIRS } from "./component-replacement-policy.mjs";
import {
  DT_USAGE_EXEMPT_REL,
  DT_USAGE_SKIP_SEGMENTS,
} from "./dt-usage-rules.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Product UI only — not internal component implementations. */
export const COMPOSITION_SCAN_ROOTS = [
  "app",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/components/pages",
];

const SKIP_SEGMENTS = DT_USAGE_SKIP_SEGMENTS;

/**
 * @param {string} source
 * @returns {Set<string>}
 */
export function extractDtImports(source) {
  const names = new Set();
  for (const match of source.matchAll(
    /from\s+["']@dt\/([A-Za-z][A-Za-z0-9]*)/g,
  )) {
    names.add(match[1]);
  }
  return names;
}

/**
 * @param {Set<string>} imports
 * @returns {Array<{ id: string, message: string, components: string[] }>}
 */
export function findIncompatibleImportPairs(imports) {
  const findings = [];
  for (const rule of INCOMPATIBLE_DT_IMPORT_PAIRS) {
    if (imports.has(rule.a) && imports.has(rule.b)) {
      findings.push({
        id: rule.id,
        message: rule.message,
        components: [rule.a, rule.b],
      });
    }
  }
  return findings;
}

function shouldScan(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  if (DT_USAGE_EXEMPT_REL.has(rel)) return false;
  if (SKIP_SEGMENTS.some((seg) => rel.includes(seg))) return false;
  return /\.(tsx|jsx)$/.test(rel);
}

function walk(dir, out) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, out);
      continue;
    }
    if (shouldScan(full)) out.push(full);
  }
}

/**
 * @returns {Array<{ file: string, id: string, message: string, components: string[] }>}
 */
export function scanCompositionViolations() {
  const files = [];
  for (const segment of COMPOSITION_SCAN_ROOTS) {
    walk(join(ROOT, segment), files);
  }

  const violations = [];
  for (const file of files) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const source = readFileSync(file, "utf8");
    const imports = extractDtImports(source);
    for (const finding of findIncompatibleImportPairs(imports)) {
      violations.push({ file: rel, ...finding });
    }
  }
  return violations;
}
