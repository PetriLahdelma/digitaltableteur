import type { McpServer } from "@modelcontextprotocol/server";

import {
  readImportPolicyResource,
  readManifestSummaryResource,
  readPatternRecipesResource,
  readTokenSummaryResource,
} from "./executors";

/** Register static MCP resources for agent-manifest and tokens. */
export function registerDesignSystemMcpResources(server: McpServer): number {
  server.registerResource(
    "agent-manifest-summary",
    "digitaltableteur://design-system/manifest/summary",
    {
      description:
        "Agent manifest summary: usage coverage, relationship graph, stable atoms (regenerate with npm run build:tokens).",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "digitaltableteur://design-system/manifest/summary",
          mimeType: "application/json",
          text: readManifestSummaryResource(),
        },
      ],
    }),
  );

  server.registerResource(
    "token-catalog-summary",
    "digitaltableteur://design-system/tokens/summary",
    {
      description: "Design token catalog summary from token-catalog.json.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "digitaltableteur://design-system/tokens/summary",
          mimeType: "application/json",
          text: readTokenSummaryResource(),
        },
      ],
    }),
  );

  server.registerResource(
    "import-policy",
    "digitaltableteur://design-system/import-policy",
    {
      description: "Public @dt import policy and agent commands (docs/PUBLIC_API.md).",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "digitaltableteur://design-system/import-policy",
          mimeType: "text/markdown",
          text: readImportPolicyResource(),
        },
      ],
    }),
  );

  server.registerResource(
    "pattern-recipes",
    "digitaltableteur://design-system/pattern-recipes",
    {
      description:
        "Pattern composition recipes (useWhen, avoidWhen, variantNotes) for layout-level agent retrieval.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "digitaltableteur://design-system/pattern-recipes",
          mimeType: "application/json",
          text: readPatternRecipesResource(),
        },
      ],
    }),
  );

  return 4;
}
