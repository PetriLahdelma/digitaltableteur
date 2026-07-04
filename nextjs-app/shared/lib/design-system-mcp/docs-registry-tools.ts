/**
 * Astryx-shaped docs surface for the public MCP route (roadmap 3.3): exactly
 * two tools, `search` (budgeted briefs over the docs registry) and `get`
 * (full contract usage + example story source). Fed from the git-tracked
 * build artifact docs-registry.json via static import so the serverless
 * bundle needs no filesystem tracing — the same registries feed the human
 * Storybook docs, so this surface cannot drift from the pages.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Relative (not @/-aliased) so the tsx-run stdio server resolves it too.
import registryJson from "../../foundations/dist/docs-registry.json";

export type RegistryExample = {
  story: string;
  description: string | null;
  source: string;
};

export type RegistryEntry = {
  name: string;
  group: string | null;
  tier: 1 | 2;
  status: string;
  description: string;
  dense: string;
  keywords: string[];
  importLine: string;
  keyProps: { name: string; type: string; required: boolean }[];
  props: Record<string, unknown>;
  composesWith: string[];
  prefersOver: string[];
  forbiddenUse: string[];
  usage: Record<string, unknown> | null;
  /** Categorized token map from the contract ({colors, spacing, ...}). */
  tokens: Record<string, unknown> | string[];
  examples: RegistryExample[];
  subComponentOf?: string;
};

const registry = (registryJson as { components: Record<string, RegistryEntry> })
  .components;

/** Public docs-surface tool names (server card + llms.txt advertise these). */
export const DOCS_REGISTRY_TOOL_NAMES = ["search", "get"] as const;

export const GET_SECTIONS = ["all", "usage", "props", "examples", "theming"] as const;
export type GetSection = (typeof GET_SECTIONS)[number];

/** Roadmap 3.3 scoring: exact=100, prefix=90, keyword=90, substring=85, all-words=75. */
export function scoreEntry(entry: RegistryEntry, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const name = entry.name.toLowerCase();
  const keywords = entry.keywords.map((k) => k.toLowerCase());
  let score = 0;
  if (name === q) score = 100;
  else if (name.startsWith(q)) score = 90;
  else if (keywords.includes(q)) score = 90;
  else if (name.includes(q)) score = 85;
  else {
    const words = q.split(/\s+/).filter(Boolean);
    const haystack = [
      name,
      entry.dense.toLowerCase(),
      entry.description.toLowerCase(),
      keywords.join(" "),
    ].join(" ");
    if (words.length > 0 && words.every((w) => haystack.includes(w))) score = 75;
  }
  if (score === 0) return 0;
  // Demote sub-components below their parents; nudge Tier 1 above Tier 2 peers.
  if (entry.subComponentOf) score -= 30;
  if (entry.tier === 2) score -= 5;
  return score;
}

function brief(entry: RegistryEntry) {
  return {
    name: entry.name,
    group: entry.group,
    status: entry.status,
    description: entry.dense || entry.description,
    import: entry.importLine,
    keyProps: entry.keyProps,
    related: entry.composesWith.slice(0, 6),
    hint: `Call get("${entry.name}") for full usage, props, and example story source — or get("${entry.name}", "examples") for examples only.`,
  };
}

export function executeSearch(args: { query: string; limit?: number }) {
  const query = args.query?.trim() ?? "";
  if (!query) {
    return errorResult('search requires a query, e.g. search("button").');
  }
  const limit = Math.min(Math.max(args.limit ?? 8, 1), 20);
  const scored = Object.values(registry)
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit);

  if (scored.length === 0) {
    return textResult(
      JSON.stringify(
        {
          query,
          results: [],
          hint: "No match. Try a UI-intent keyword (e.g. \"toggle\", \"banner\", \"pagination\") or list broad terms one at a time.",
        },
        null,
        2,
      ),
    );
  }
  return textResult(
    JSON.stringify(
      { query, results: scored.map(({ entry, score }) => ({ score, ...brief(entry) })) },
      null,
      2,
    ),
  );
}

export function executeGet(args: { name: string; section?: string }) {
  const name = args.name?.trim() ?? "";
  const entry =
    registry[name] ??
    Object.values(registry).find((e) => e.name.toLowerCase() === name.toLowerCase());
  if (!entry) {
    const near = Object.keys(registry)
      .filter((n) => n.toLowerCase().includes(name.toLowerCase()))
      .slice(0, 8);
    return errorResult(
      `Unknown component "${name}".${near.length ? ` Did you mean: ${near.join(", ")}?` : ""} Use search("<intent>") to discover components.`,
    );
  }
  const section = (args.section ?? "all") as GetSection;
  if (!GET_SECTIONS.includes(section)) {
    return errorResult(`Unknown section "${args.section}". Valid: ${GET_SECTIONS.join(", ")}.`);
  }

  const base = {
    name: entry.name,
    group: entry.group,
    status: entry.status,
    import: entry.importLine,
    description: entry.description,
  };
  const sections: Record<Exclude<GetSection, "all">, Record<string, unknown>> = {
    usage: {
      dense: entry.dense,
      keywords: entry.keywords,
      usage: entry.usage,
      composesWith: entry.composesWith,
      prefersOver: entry.prefersOver,
      forbiddenUse: entry.forbiddenUse,
      ...(entry.subComponentOf ? { subComponentOf: entry.subComponentOf } : {}),
    },
    props: { props: entry.props },
    examples: { examples: entry.examples },
    theming: { tokens: entry.tokens },
  };
  const payload =
    section === "all"
      ? { ...base, ...sections.usage, ...sections.props, ...sections.examples, ...sections.theming }
      : { ...base, ...(sections[section] as Record<string, unknown>) };
  return textResult(JSON.stringify(payload, null, 2));
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}
function errorResult(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true };
}

const READ_ONLY = { readOnlyHint: true } as const;

/**
 * Register the two-tool Astryx docs surface (search + get).
 *
 * Real zod shapes, not the empty-schema pattern the discovery tools use: the
 * SDK parses arguments against the shape and an empty shape STRIPS every
 * argument before the handler sees it.
 */
export function registerDocsRegistryMcpTools(server: McpServer): number {
  server.tool(
    "search",
    "Search the @dt design-system docs registry by name, keyword, or UI intent. Returns budgeted briefs (import line, key props, related components) with a hint for the follow-up get call.",
    {
      query: z.string().describe("Component name, keyword, or UI intent (e.g. \"toggle\")"),
      limit: z.number().int().min(1).max(20).optional().describe("Max results, default 8"),
    },
    READ_ONLY,
    async (args) => executeSearch(args),
  );

  server.tool(
    "get",
    "Get the full docs-registry entry for one component: usage guidance, props, example story source, and theming tokens.",
    {
      name: z.string().describe("Component name, e.g. \"Button\""),
      section: z
        .enum(GET_SECTIONS)
        .optional()
        .describe('Narrow the payload; default "all"'),
    },
    READ_ONLY,
    async (args) => executeGet(args),
  );

  return 2;
}
