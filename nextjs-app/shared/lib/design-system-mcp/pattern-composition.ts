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

export interface RankedPattern {
  name: string;
  score: number;
  pattern: PatternRecipe;
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

      return { name, score, pattern };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
