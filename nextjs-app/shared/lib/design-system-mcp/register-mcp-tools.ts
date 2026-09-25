import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
  executeFindComponentForIntent,
  executeGetComponentContract,
  executeGetTokens,
  executeListComponents,
  executeSuggestPatternForLayout,
  executeValidateComponentUsage,
} from "./executors";
import {
  findComponentForIntentInput,
  findComponentForIntentOutput,
  getComponentContractInput,
  getComponentContractOutput,
  getTokensOutput,
  listComponentsInput,
  listComponentsOutput,
  suggestPatternForLayoutInput,
  suggestPatternForLayoutOutput,
  validateComponentUsageInput,
  validateComponentUsageOutput,
} from "./tool-schemas";

const READ_ONLY = { readOnlyHint: true } as const;

/** Register design-system discovery tools on an MCP server instance. */
export function registerDesignSystemMcpTools(server: McpServer): number {
  server.registerTool(
    "list_components",
    {
      title: "List components",
      description:
        "List cataloged @dt components with status, import path, usage counts, and composesWith neighbors. Filter by status (stable|beta|alpha|deprecated|all).",
      inputSchema: z.object(listComponentsInput),
      outputSchema: z.object(listComponentsOutput),
      annotations: READ_ONLY,
    },
    async (args) => executeListComponents(args),
  );

  server.registerTool(
    "find_component_for_intent",
    {
      title: "Find component for intent",
      description:
        "Rank @dt components for a free-text UI task (e.g. dismissible warning banner with action). Returns import, variants, composesWith, and validation commands.",
      inputSchema: z.object(findComponentForIntentInput),
      outputSchema: z.object(findComponentForIntentOutput),
      annotations: READ_ONLY,
    },
    async (args) => executeFindComponentForIntent(args),
  );

  server.registerTool(
    "suggest_pattern_for_layout",
    {
      title: "Suggest layout pattern",
      description:
        "Rank @dt layout patterns (CTASection, Header, HeroSection, …) for a page-level intent. Returns useWhen, avoidWhen, composesWith, and variantNotes — not a license to replace pattern chrome.",
      inputSchema: z.object(suggestPatternForLayoutInput),
      outputSchema: z.object(suggestPatternForLayoutOutput),
      annotations: READ_ONLY,
    },
    async (args) => executeSuggestPatternForLayout(args),
  );

  server.registerTool(
    "get_component_contract",
    {
      title: "Get component contract",
      description:
        "Get full contract + agent block + usage evidence for one cataloged component by name. The contract is typed against contract.schema.v2.json.",
      inputSchema: z.object(getComponentContractInput),
      outputSchema: z.object(getComponentContractOutput),
      annotations: READ_ONLY,
    },
    async (args) => executeGetComponentContract(args),
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Get design tokens",
      description:
        "Get design token catalog summary and manifest token metadata (source: variables.css via build:tokens).",
      outputSchema: z.object(getTokensOutput),
      annotations: READ_ONLY,
    },
    async () => executeGetTokens(),
  );

  server.registerTool(
    "validate_component_usage",
    {
      title: "Validate component usage",
      description:
        "Check a file/snippet for raw UI and optionally validate structured component props against inferred API relationships.",
      inputSchema: z.object(validateComponentUsageInput),
      outputSchema: z.object(validateComponentUsageOutput),
      annotations: READ_ONLY,
    },
    async (args) => executeValidateComponentUsage(args),
  );

  return 6;
}
