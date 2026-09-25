import registryJson from "@/nextjs-app/shared/foundations/dist/docs-registry.json";
import publicApi from "@/packages/react/public-api.manifest.json";

/**
 * Builds /design-system/llms.txt: one entry per design-system component,
 * generated from the same docs registry the MCP `search`/`get` tools serve,
 * so it cannot drift from them. Exported components show the real npm
 * import; everything else is marked in-repo only instead of advertising the
 * internal `@dt/*` alias, which does not resolve outside this repository.
 */
type RegistryEntry = {
  name: string;
  group: string | null;
  status: string;
  description: string;
  dense: string;
  subComponentOf?: string;
};

const GROUP_ORDER = [
  "actions",
  "form",
  "navigation",
  "overlay",
  "feedback",
  "display",
  "data-display",
  "media",
  "content",
  "structure",
  "layout",
  "marketing",
  "utility",
];

export function buildDesignSystemLlmsTxt(baseUrl: string): string {
  const entries = Object.values(
    (registryJson as { components: Record<string, RegistryEntry> }).components,
  ).filter((entry) => entry.status !== "deprecated");
  const exported = new Set((publicApi as { runtimeExports: string[] }).runtimeExports);

  const byGroup = new Map<string, RegistryEntry[]>();
  for (const entry of entries) {
    const group = entry.group ?? "other";
    byGroup.set(group, [...(byGroup.get(group) ?? []), entry]);
  }
  const groups = [...byGroup.keys()].sort(
    (a, b) =>
      (GROUP_ORDER.indexOf(a) + 1 || 99) - (GROUP_ORDER.indexOf(b) + 1 || 99) ||
      a.localeCompare(b),
  );

  let body = "# Digitaltableteur design system\n\n";
  body += `> ${entries.length} React components with machine-readable contracts: typed props, variants, keyboard and ARIA requirements, and usage rules an agent can validate against. Exported components ship in the \`@digitaltableteur/react\` npm package (restricted access).\n\n`;
  body += "## How to use this file\n\n";
  body += `- Query the MCP endpoint at ${baseUrl}/mcp (Streamable HTTP, no auth). \`search\` returns component briefs by name, keyword, or UI intent; \`get\` returns full usage, props, and example story source.\n`;
  body += "- Before proposing JSX, call `validate_component_usage` with the snippet. It checks prop relationships, forbidden prop combinations, and deprecated props from the contracts, and names the rule it applied.\n";
  body += "- Prefer `stable` components. `beta` is usable with care; `alpha` is internal and not exported.\n";
  body += `- Every contract is also published in the open Design System Contract 1.0 format at ${baseUrl}/contracts/v1/<Name>.contract.json (index: ${baseUrl}/contracts/v1/index.json), with accessibility claims labelled automated, manual, or unverified and linked to evidence records. Check them with \`npx @digitaltableteur/contract-spec\`.\n`;
  body += `- Human docs and the agent benchmark: ${baseUrl}/design-system/agent\n\n`;

  for (const group of groups) {
    const members = (byGroup.get(group) ?? []).sort((a, b) => a.name.localeCompare(b.name));
    body += `## ${group}\n\n`;
    for (const entry of members) {
      const summary = (entry.dense || entry.description).replace(/\s+/g, " ").trim();
      const where = exported.has(entry.name)
        ? `Import: \`import { ${entry.name} } from "@digitaltableteur/react"\``
        : "In-repo only.";
      const parent = entry.subComponentOf ? `, part of ${entry.subComponentOf}` : "";
      body += `- ${entry.name} (${entry.status}${parent}): ${summary.replace(/\.$/, "")}. ${where}\n`;
    }
    body += "\n";
  }
  return body;
}
