/**
 * Public contract validator for the /mcp route (frontier roadmap Phase 2).
 *
 * Hardened variant of the stdio validate_component_usage tool:
 * - snippet only, no filePath: the public route never reads server files;
 * - snippet capped at SNIPPET_MAX_CHARS;
 * - rules come from the compact contract-rules.json build artifact (static
 *   import, no filesystem tracing on Vercel);
 * - the TypeScript parser loads on first call, not on every cold start.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Relative (not @/-aliased) so the tsx-run stdio server resolves it too.
import contractRulesJson from "../../foundations/dist/contract-rules.json";
import type { RuleSource } from "./contract-rules";
import { validateComponentUsageOutput } from "./tool-schemas";

export const SNIPPET_MAX_CHARS = 20_000;

/** Public validator tool names (server card advertises these). */
export const PUBLIC_VALIDATOR_TOOL_NAMES = ["validate_component_usage"] as const;

const rulesByName = new Map(
  Object.entries(
    (contractRulesJson as unknown as { components: Record<string, RuleSource> }).components,
  ),
);

export function registerPublicValidatorTool(server: McpServer): number {
  server.registerTool(
    "validate_component_usage",
    {
      title: "Validate component usage",
      description:
        "Check proposed @dt JSX against the component contracts: prop relationships, forbidden prop combinations, deprecated props, and raw-UI replacements. Pass a TSX snippet, or a component name with props.",
      inputSchema: {
        snippet: z
          .string()
          .max(SNIPPET_MAX_CHARS)
          .optional()
          .describe(`TSX source to check, at most ${SNIPPET_MAX_CHARS} characters`),
        component: z
          .string()
          .optional()
          .describe("Component whose contract rules to check against props"),
        props: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Props as a JSON object, checked when component is set"),
      },
      outputSchema: validateComponentUsageOutput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ snippet, component, props }) => {
      const canonical = component
        ? [...rulesByName.keys()].find((name) => name.toLowerCase() === component.toLowerCase())
        : undefined;
      if (!snippet?.trim() && !(canonical && props)) {
        return {
          content: [
            {
              type: "text" as const,
              text: component && !canonical
                ? `No cataloged component named ${component}.`
                : "Provide a snippet, or a component name with props.",
            },
          ],
          isError: true,
        };
      }
      const { validateUsage } = await import("./validate-usage");
      const result = validateUsage(
        {
          source: snippet?.trim() || undefined,
          label: "(snippet)",
          matchBareTags: true,
          component: canonical,
          props,
        },
        rulesByName,
      );
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );
  return 1;
}
