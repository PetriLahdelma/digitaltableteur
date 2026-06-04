/**
 * Compute production consumers[] for stable component contracts from @dt imports.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const CONSUMER_REPO = "digitaltableteur/digitaltableteur";
const COMPONENT_ROOTS = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];
/** Production surfaces — app routes, patterns, and page modules (not atom cross-imports). */
const SCAN_DIRS = [
  join(ROOT, "app"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/components/pages"),
].filter((d) => existsSync(d));
const MAX_CONSUMERS_PER_COMPONENT = 12;

/**
 * @param {string} componentName
 * @returns {Array<{ repo: string, path: string, since: string }>}
 */
export function computeConsumersForComponent(componentName) {
  const hits = [];
  for (const scan of SCAN_DIRS) {
    if (!existsSync(scan)) continue;
    try {
      const out = execSync(
        `rg -l "@dt/${componentName}[^a-zA-Z]" "${scan}" --glob '*.{tsx,ts,jsx,js}' --glob '!**/*.test.*' --glob '!**/*.stories.*' 2>/dev/null || true`,
        { encoding: "utf8" },
      ).trim();
      if (!out) continue;
      for (const file of out.split("\n").filter(Boolean)) {
        hits.push({
          repo: CONSUMER_REPO,
          path: file.replace(`${ROOT}/`, ""),
          since: "2026-06-04",
        });
      }
    } catch {
      // ignore rg failures
    }
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
