import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** @param {string} name PascalCase component name */
export function componentNameToSlug(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

export function normalizeLookupKey(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/componentset$/, "");
}

/** @param {string} dir */
export function* walkContractPaths(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkContractPaths(full);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".contract.json")) {
      yield full;
    }
  }
}

/** @param {string[]} roots */
export function* iterBetaStableContracts(roots) {
  for (const base of roots) {
    if (!existsSync(base)) continue;
    for (const contractPath of walkContractPaths(base)) {
      const contract = JSON.parse(readFileSync(contractPath, "utf8"));
      if (contract.status !== "beta" && contract.status !== "stable") continue;
      const name = contract.name;
      yield { name, contract, contractPath };
    }
  }
}
