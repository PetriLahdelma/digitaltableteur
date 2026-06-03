/**
 * Pattern-level composition retrieval — complements component intent ranking.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const RECIPES_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "pattern-composition.recipes.json",
);

/**
 * @returns {{ version: number, patterns: Array<Record<string, unknown>> }}
 */
export function loadPatternRecipes(root = ROOT) {
  const path = join(root, "scripts/design-system/pattern-composition.recipes.json");
  const recipesFile = existsSync(path) ? path : RECIPES_PATH;
  if (!existsSync(recipesFile)) {
    return { version: 0, patterns: [] };
  }
  return JSON.parse(readFileSync(recipesFile, "utf8"));
}

/**
 * @param {string} query
 * @param {Array<Record<string, unknown>>} patterns
 * @param {number} limit
 */
export function rankPatternsForIntent(query, patterns, limit = 5) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  return patterns
    .map((pattern) => {
      const name = String(pattern.name ?? "");
      const haystack = [
        name,
        pattern.publicImport ?? "",
        ...(pattern.useWhen ?? []),
        ...(pattern.avoidWhen ?? []),
        JSON.stringify(pattern.variantNotes ?? {}),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (name.toLowerCase().includes(term)) score += 10;
        if (haystack.includes(term)) score += 3;
      }

      if (pattern.status === "stable") score += 2;
      else if (pattern.status === "beta") score += 1;

      return { name, score, pattern };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
