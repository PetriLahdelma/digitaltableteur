/**
 * Input and output schemas for every design-system MCP tool.
 *
 * Inputs: the SDK parses tool arguments against the declared shape, so an
 * empty shape strips every argument before the handler runs. Every tool that
 * reads an argument MUST declare it here (guarded by register-mcp-tools.test.ts,
 * which calls each tool over an in-memory transport).
 *
 * Outputs: each tool returns `structuredContent` validated against its
 * outputSchema, so agents receive typed contract data instead of parsing
 * JSON out of a text block. The contract envelope takes its enums from
 * contract.schema.v2.json, the same schema validate:components enforces, so
 * the MCP surface cannot advertise a status, tier, or group the contracts
 * themselves reject.
 */
import { z } from "zod";

// Relative (not @/-aliased) so the tsx-run stdio server resolves it too.
import contractSchemaJson from "../../../../scripts/design-system/contract.schema.v2.json";

type EnumProperty = { enum: readonly string[] };

const contractSchema = contractSchemaJson as unknown as {
  required: string[];
  properties: Record<"status" | "tier" | "group", EnumProperty>;
};

function enumFrom(property: EnumProperty) {
  return z.enum(property.enum as [string, ...string[]]);
}

export const CONTRACT_STATUSES = contractSchema.properties.status.enum;
export const CONTRACT_REQUIRED_FIELDS = contractSchema.required;

/**
 * Typed top-level view of a component contract. Nested objects stay loose:
 * the full shape is enforced at build time by validate:components, and the
 * envelope's job is to give agents reliable types for the fields they branch on.
 */
export const contractEnvelopeSchema = z.looseObject({
  name: z.string(),
  schemaVersion: z.number().optional(),
  tier: enumFrom(contractSchema.properties.tier),
  group: enumFrom(contractSchema.properties.group),
  status: enumFrom(contractSchema.properties.status),
  description: z.string(),
  figma: z.string().nullable(),
  radixPrimitive: z.string().nullable(),
  element: z.string().nullable(),
  variants: z.record(z.string(), z.unknown()),
  slots: z.array(z.string()),
  asChild: z.boolean(),
  subParts: z.array(z.unknown()),
  requiredStories: z.array(z.string()),
  a11y: z.looseObject({}),
  tokens: z.unknown(),
  lightDarkVerified: z.boolean(),
  forbiddenUse: z.array(z.string()).optional(),
  composesWith: z.array(z.string()).optional(),
  prefersOver: z.array(z.string()).optional(),
  deprecatedReason: z.string().optional(),
});

const stringList = z.array(z.string());
const looseRecord = z.record(z.string(), z.unknown());

const propRelationshipSchema = z.union([
  z.object({
    kind: z.literal("mutuallyExclusive"),
    props: stringList,
    reason: z.string(),
  }),
  z.object({
    kind: z.literal("requires"),
    prop: z.string(),
    requires: stringList,
    reason: z.string(),
  }),
]);

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const queryInput = z
  .string()
  .min(1)
  .describe('Free-text UI intent, e.g. "dismissible warning banner with action"');

export const listComponentsInput = {
  status: z
    .enum(["all", ...CONTRACT_STATUSES])
    .optional()
    .describe('Contract status filter; default "all"'),
  limit: z.number().int().min(1).max(200).optional().describe("Max rows, default 50"),
};

export const findComponentForIntentInput = {
  query: queryInput,
  limit: z.number().int().min(1).max(20).optional().describe("Max matches, default 8"),
};

export const suggestPatternForLayoutInput = {
  query: queryInput,
  limit: z.number().int().min(1).max(10).optional().describe("Max matches, default 5"),
};

export const getComponentContractInput = {
  name: z.string().min(1).describe('Component name, e.g. "Button" (case-insensitive)'),
};

export const validateComponentUsageInput = {
  filePath: z
    .string()
    .optional()
    .describe("Repo-relative file to scan for raw UI (stdio server only)"),
  snippet: z.string().optional().describe("TSX source to scan for raw UI"),
  component: z
    .string()
    .optional()
    .describe("Component whose contract prop relationships to check against props"),
  props: looseRecord
    .optional()
    .describe("Props as a JSON object, checked when component is set"),
};

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export const listComponentsOutput = {
  schemaVersion: z.string().optional(),
  generatedAt: z.string().optional(),
  summary: looseRecord.optional(),
  usageCoverage: looseRecord.optional(),
  relationshipGraph: looseRecord.optional(),
  filter: z.object({ status: z.string(), limit: z.number() }),
  count: z.number(),
  components: z.array(
    z.object({
      name: z.string(),
      status: z.string().optional(),
      tier: z.string().optional(),
      publicImport: z.string(),
      description: z.string().optional(),
      productionImportCount: z.number(),
      composesWith: stringList,
    }),
  ),
  regenerate: z.string(),
};

export const findComponentForIntentOutput = {
  query: z.string(),
  matches: z.array(
    z.looseObject({
      name: z.string(),
      score: z.number(),
      publicImport: z.string(),
      status: z.string().optional(),
      tier: z.string().optional(),
      description: z.string().optional(),
      variants: looseRecord,
      propRelationships: z.array(propRelationshipSchema),
      useWhen: stringList,
      avoidWhen: stringList,
      composesWith: stringList,
    }),
  ),
  cliEquivalent: z.string(),
};

export const suggestPatternForLayoutOutput = {
  query: z.string(),
  inverseSurface: z.boolean(),
  guardrails: z.string(),
  matches: z.array(
    z.looseObject({
      name: z.string(),
      score: z.number(),
      useWhen: stringList,
      avoidWhen: stringList,
      composesWith: stringList,
    }),
  ),
  resource: z.string(),
};

export const getComponentContractOutput = {
  name: z.string(),
  contract: contractEnvelopeSchema,
  agent: z
    .looseObject({ propRelationships: z.array(propRelationshipSchema).optional() })
    .optional(),
  usage: looseRecord.optional(),
  storybook: z.string(),
  validate: z.string(),
  driftCheck: z.string(),
};

export const getTokensOutput = {
  manifestTokens: looseRecord.nullable(),
  catalog: z
    .looseObject({ tokenCount: z.number().optional(), runtimeCss: z.string() })
    .nullable(),
  regenerate: z.string(),
};

export const validateComponentUsageOutput = {
  file: z.string(),
  component: z.string().nullable(),
  violationCount: z.number(),
  ok: z.boolean(),
  findings: z.array(
    z.object({
      file: z.string(),
      line: z.number(),
      rule: z.string(),
      message: z.string(),
      suggest: z.string(),
      snippet: z.string(),
    }),
  ),
  contractFindings: z.array(
    z.object({
      component: z.string(),
      line: z.number().nullable(),
      rule: z.string(),
      severity: z.enum(["error", "warning"]),
      props: stringList,
      message: z.string(),
    }),
  ),
  warningCount: z.number(),
  fleetLint: z.string(),
  note: z.string(),
};

export const docsSearchOutput = {
  query: z.string(),
  results: z.array(
    z.looseObject({
      score: z.number(),
      name: z.string(),
      group: z.string().nullable(),
      status: z.string(),
      description: z.string(),
      import: z.string(),
      hint: z.string(),
    }),
  ),
  hint: z.string().optional(),
};

/**
 * Loose on purpose: the payload's keys depend on the requested section, and
 * clients reject unknown keys under a strict (additionalProperties: false) schema.
 */
export const docsGetOutput = z.looseObject({
  name: z.string(),
  group: z.string().nullable(),
  status: z.string(),
  import: z.string(),
  description: z.string(),
  dense: z.string().optional(),
  usage: looseRecord.nullable().optional(),
  forbiddenUse: stringList.optional(),
  props: looseRecord.optional(),
  examples: z
    .array(
      z.object({
        story: z.string(),
        description: z.string().nullable(),
        source: z.string(),
      }),
    )
    .optional(),
  tokens: z.unknown().optional(),
});
