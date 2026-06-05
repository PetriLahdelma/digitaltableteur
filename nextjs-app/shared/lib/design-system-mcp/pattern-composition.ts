import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { designSystemMcpRoot } from "./paths";

export interface PatternRecipe {
  name: string;
  publicImport: string;
  tier?: string;
  status?: string;
  useWhen?: string[];
  avoidWhen?: string[];
  composesWith?: string[];
  variantNotes?: Record<string, string>;
  storybookId?: string;
}

export interface PatternRecipesFile {
  version: number;
  patterns: PatternRecipe[];
}

export function patternRecipesPath(root = designSystemMcpRoot()): string {
  return join(root, "scripts/design-system/pattern-composition.recipes.json");
}

export function loadPatternRecipes(root = designSystemMcpRoot()): PatternRecipesFile {
  const path = patternRecipesPath(root);
  if (!existsSync(path)) {
    return { version: 0, patterns: [] };
  }
  return JSON.parse(readFileSync(path, "utf8")) as PatternRecipesFile;
}

const INVERSE_QUERY_RE =
  /\b(inverse|dark|tinted|on[\s-]?dark|high[\s-]?contrast|gradient|colored)\b/i;

const INVERSE_RECIPE_RE =
  /\b(inverse|dark|tinted|on[\s-]?dark|primary background|contrast)\b/i;

const INVERSE_CONSTRAINT_RE =
  /\b(dark|inverse|contrast|@dt\/button|shadcn|tertiary|primary on|outline)\b/i;

/** True when the layout query implies dark, inverse, or tinted surfaces. */
export function queryImpliesInverseSurface(query: string): boolean {
  return INVERSE_QUERY_RE.test(query);
}

function inverseSurfaceBoost(pattern: PatternRecipe): number {
  let boost = 0;
  const useWhen = (pattern.useWhen ?? []).join(" ").toLowerCase();
  if (INVERSE_RECIPE_RE.test(useWhen)) boost += 8;

  const notes = JSON.stringify(pattern.variantNotes ?? {}).toLowerCase();
  if (INVERSE_RECIPE_RE.test(notes)) boost += 5;

  return boost;
}

function surfaceConstraintsForPattern(
  pattern: PatternRecipe,
  inverseContext: boolean,
): string[] {
  if (!inverseContext) return [];

  const constraints: string[] = [];
  for (const note of pattern.avoidWhen ?? []) {
    if (INVERSE_CONSTRAINT_RE.test(note)) constraints.push(note);
  }
  for (const [key, value] of Object.entries(pattern.variantNotes ?? {})) {
    if (INVERSE_CONSTRAINT_RE.test(`${key} ${value}`)) {
      constraints.push(`${key}: ${value}`);
    }
  }
  return constraints;
}

export interface RankedPattern {
  name: string;
  score: number;
  pattern: PatternRecipe;
  surfaceConstraints?: string[];
}

/** Rank pattern recipes for a layout-level intent query. */
export function rankPatternsForIntent(
  query: string,
  patterns: PatternRecipe[],
  limit = 5,
): RankedPattern[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  const inverseContext = queryImpliesInverseSurface(query);

  return patterns
    .map((pattern) => {
      const name = pattern.name ?? "";
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
