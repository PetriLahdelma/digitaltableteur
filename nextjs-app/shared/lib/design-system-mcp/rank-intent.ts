import type { ManifestComponentEntry } from "./types";

export interface RankedComponent {
  name: string;
  score: number;
  entry: ManifestComponentEntry;
}

/**
 * Rank cataloged components for a free-text intent (mirrors usage-scan-lib.mjs).
 */
export function rankComponentsForIntent(
  query: string,
  components: ManifestComponentEntry[],
  limit = 8,
): RankedComponent[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  return components
    .map((entry) => {
      const { name, contract, usage, agent } = entry;
      const haystack = [
        name,
        contract.description ?? "",
        agent?.intent ?? "",
        ...(agent?.useWhen ?? []),
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

      if ((usage?.productionImportCount ?? 0) > 0) score += 4;
      else if ((usage?.importCount ?? 0) > 0) score += 2;

      const composesWith = agent?.composesWith ?? [];
      for (const term of terms) {
        if (composesWith.some((child) => child.toLowerCase().includes(term))) {
          score += 5;
        }
      }

      if (contract.status === "stable") score += 2;
      else if (contract.status === "beta") score += 1;

      return { name, score, entry };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
