import type { ForbiddenCombo, PropRelationship } from "./contract-rules";

// A type alias (not an interface) so it satisfies the SDK's index-signature result type.
export type DesignSystemToolTextResult = {
  content: [{ type: "text"; text: string }];
  /** Same payload as the text block, validated against the tool outputSchema. */
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export interface ManifestComponentEntry {
  name: string;
  contract: {
    description?: string;
    status?: string;
    tier?: string;
    group?: string;
    slots?: string[];
    variants?: Record<string, unknown>;
    a11y?: Record<string, unknown>;
    [key: string]: unknown;
  };
  usage?: {
    publicImport?: string;
    importCount?: number;
    productionImportCount?: number;
    evidence?: Array<{ path?: string; context?: string }>;
  };
  agent?: {
    preferredImport?: string;
    intent?: string;
    useWhen?: string[];
    avoidWhen?: string[];
    variants?: Record<string, { values?: string[] }>;
    composesWith?: string[];
    replacementFor?: string[];
    prefersOver?: string[];
    props?: Record<
      string,
      { deprecated?: boolean; deprecation?: string; description?: string; [key: string]: unknown }
    >;
    propRelationships?: PropRelationship[];
    forbiddenCombos?: ForbiddenCombo[];
    requiredA11y?: string[];
    keyboard?: string[];
    [key: string]: unknown;
  };
}

export interface AgentManifest {
  schemaVersion?: string;
  generatedAt?: string;
  summary?: Record<string, unknown>;
  usageCoverage?: Record<string, unknown>;
  relationshipGraph?: Record<string, unknown>;
  tokens?: Record<string, unknown>;
  components?: ManifestComponentEntry[];
}
