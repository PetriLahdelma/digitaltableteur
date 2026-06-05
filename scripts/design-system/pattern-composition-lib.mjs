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

const INVERSE_QUERY_RE =
  /\b(inverse|dark|tinted|on[\s-]?dark|high[\s-]?contrast|gradient|colored)\b/i;

const INVERSE_RECIPE_RE =
  /\b(inverse|dark|tinted|on[\s-]?dark|primary background|contrast)\b/i;

const INVERSE_CONSTRAINT_RE =
  /\b(dark|inverse|contrast|@dt\/button|shadcn|tertiary|primary on|outline)\b/i;

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

/** @param {string} query */
export function queryImpliesInverseSurface(query) {
  return INVERSE_QUERY_RE.test(query);
}

/** @param {Record<string, unknown>} pattern */
function inverseSurfaceBoost(pattern) {
  let boost = 0;
  const useWhen = (pattern.useWhen ?? []).join(" ").toLowerCase();
  if (INVERSE_RECIPE_RE.test(useWhen)) boost += 8;

  const notes = JSON.stringify(pattern.variantNotes ?? {}).toLowerCase();
  if (INVERSE_RECIPE_RE.test(notes)) boost += 5;

  return boost;
}

/** @param {Record<string, unknown>} pattern @param {boolean} inverseContext */
function surfaceConstraintsForPattern(pattern, inverseContext) {
  if (!inverseContext) return [];

  const constraints = [];
  for (const note of pattern.avoidWhen ?? []) {
    if (INVERSE_CONSTRAINT_RE.test(String(note))) constraints.push(String(note));
  }
  for (const [key, value] of Object.entries(pattern.variantNotes ?? {})) {
    if (INVERSE_CONSTRAINT_RE.test(`${key} ${value}`)) {
      constraints.push(`${key}: ${value}`);
    }
  }
  return constraints;
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

  const inverseContext = queryImpliesInverseSurface(query);

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

      if (inverseContext) score += inverseSurfaceBoost(pattern);

      return {
        name,
        score,
        pattern,
        surfaceConstraints: surfaceConstraintsForPattern(pattern, inverseContext),
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
