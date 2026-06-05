import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";

import { designSystemMcpRoot } from "./paths";
import { loadAgentManifest, manifestMissingMessage } from "./manifest-loader";
import { rankComponentsForIntent } from "./rank-intent";
import type {
  AgentManifest,
  DesignSystemToolTextResult,
} from "./types";
import { loadPublicApiDoc, loadTokenCatalog } from "./manifest-loader";
import {
  loadPatternRecipes,
  queryImpliesInverseSurface,
  rankPatternsForIntent,
} from "./pattern-composition";

export const DESIGN_SYSTEM_TOOL_NAMES = [
  "list_components",
  "find_component_for_intent",
  "suggest_pattern_for_layout",
  "get_component_contract",
  "get_tokens",
  "validate_component_usage",
] as const;

export type DesignSystemToolName = (typeof DESIGN_SYSTEM_TOOL_NAMES)[number];

export const DESIGN_SYSTEM_RESOURCE_URIS = [
  "digitaltableteur://design-system/manifest/summary",
  "digitaltableteur://design-system/tokens/summary",
  "digitaltableteur://design-system/import-policy",
  "digitaltableteur://design-system/pattern-recipes",
] as const;

export function dsJsonResult(data: unknown): DesignSystemToolTextResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function dsTextResult(
  text: string,
  isError = false,
): DesignSystemToolTextResult {
  return {
    content: [{ type: "text", text }],
    ...(isError ? { isError: true } : {}),
  };
}

const RAW_UI_RULES = [
  {
    id: "raw-button",
    // Lowercase only — avoids false positives on <Button> (@dt component).
    pattern: /<button\b/,
    message: "Use @dt/Button instead of raw <button>.",
    suggest: "@dt/Button",
  },
  {
    id: "raw-heading",
    pattern: /<h([1-6])\b/,
    message: "Use @dt/Title instead of raw heading elements.",
    suggest: "@dt/Title",
  },
  {
    id: "shadcn-import",
    pattern: /from\s+["']@\/components\/ui\//,
    message: "Prefer @dt/* over @/components/ui/*.",
    suggest: "@dt/<Component>",
  },
] as const;

function getManifestOrError():
  | { ok: true; manifest: AgentManifest }
  | { ok: false; result: DesignSystemToolTextResult } {
  const manifest = loadAgentManifest();
  if (!manifest?.components?.length) {
    return { ok: false, result: dsTextResult(manifestMissingMessage(), true) };
  }
  return { ok: true, manifest };
}

export function executeListComponents(args?: {
  status?: string;
  limit?: number;
}): DesignSystemToolTextResult {
  const loaded = getManifestOrError();
  if (!loaded.ok) return loaded.result;
  const manifest = loaded.manifest;

  const statusFilter = String(args?.status ?? "all").toLowerCase();
  const limit = Math.min(Math.max(Number(args?.limit) || 50, 1), 130);

  let rows = manifest.components ?? [];
  if (statusFilter !== "all") {
    rows = rows.filter((c) => c.contract?.status === statusFilter);
  }

  const items = rows.slice(0, limit).map((c) => ({
    name: c.name,
    status: c.contract?.status,
    tier: c.contract?.tier,
    publicImport: c.usage?.publicImport ?? c.agent?.preferredImport ?? `@dt/${c.name}`,
    description: c.contract?.description,
    productionImportCount: c.usage?.productionImportCount ?? 0,
    composesWith: c.agent?.composesWith ?? [],
  }));

  return dsJsonResult({
    schemaVersion: manifest.schemaVersion,
    generatedAt: manifest.generatedAt,
    summary: manifest.summary,
    usageCoverage: manifest.usageCoverage,
    relationshipGraph: manifest.relationshipGraph,
    filter: { status: statusFilter, limit },
    count: items.length,
    components: items,
    regenerate: "npm run build:tokens",
  });
}

export function executeFindComponentForIntent(args?: {
  query?: string;
  limit?: number;
}): DesignSystemToolTextResult {
  const loaded = getManifestOrError();
  if (!loaded.ok) return loaded.result;
  const manifest = loaded.manifest;

  const query = String(args?.query ?? "").trim();
  if (!query) {
    return dsTextResult("Error: query is required.", true);
  }

  const limit = Math.min(Math.max(Number(args?.limit) || 8, 1), 20);
  const ranked = rankComponentsForIntent(
    query,
    manifest.components ?? [],
    limit,
  );

  return dsJsonResult({
    query,
    matches: ranked.map(({ name, score, entry }) => ({
      name,
      score,
      publicImport:
        entry.usage?.publicImport ?? entry.agent?.preferredImport ?? `@dt/${name}`,
      status: entry.contract?.status,
      tier: entry.contract?.tier,
      description: entry.contract?.description,
      intent: entry.agent?.intent,
      variants: entry.agent?.variants ?? {},
      useWhen: entry.agent?.useWhen ?? [],
      avoidWhen: entry.agent?.avoidWhen ?? [],
      composesWith: entry.agent?.composesWith ?? [],
      replacementFor: entry.agent?.replacementFor ?? [],
      productionImportCount: entry.usage?.productionImportCount ?? 0,
      importCount: entry.usage?.importCount ?? 0,
      topEvidence: entry.usage?.evidence?.slice(0, 3) ?? [],
      validate: "npm run validate:components",
      lintDtUsage: "npm run lint:dt-usage",
    })),
    cliEquivalent: `npm run find-component -- ${JSON.stringify(query)}`,
  });
}

export function executeSuggestPatternForLayout(args?: {
  query?: string;
  limit?: number;
}): DesignSystemToolTextResult {
  const query = String(args?.query ?? "").trim();
  if (!query) {
    return dsTextResult("Error: query is required.", true);
  }

  const { patterns } = loadPatternRecipes();
  if (!patterns.length) {
    return dsTextResult(
      "Error: pattern-composition.recipes.json missing — see scripts/design-system/pattern-composition.recipes.json",
      true,
    );
  }

  const limit = Math.min(Math.max(Number(args?.limit) || 5, 1), 10);
  const ranked = rankPatternsForIntent(query, patterns, limit);

  const inverseSurface = queryImpliesInverseSurface(query);

  return dsJsonResult({
    query,
    inverseSurface,
    guardrails:
      "Patterns are layout shells — do not mass-replace Header/CTA chrome without design sign-off. See docs/AGENTIC_DS_OPERATING_MODEL.md",
    matches: ranked.map(({ name, score, pattern, surfaceConstraints }) => ({
      name,
      score,
      publicImport: pattern.publicImport,
      status: pattern.status,
      tier: pattern.tier,
      useWhen: pattern.useWhen ?? [],
      avoidWhen: pattern.avoidWhen ?? [],
      composesWith: pattern.composesWith ?? [],
      variantNotes: pattern.variantNotes ?? {},
      storybookId: pattern.storybookId,
      ...(surfaceConstraints?.length ? { surfaceConstraints } : {}),
    })),
    resource: "digitaltableteur://design-system/pattern-recipes",
  });
}

export function readPatternRecipesResource(): string {
  const file = loadPatternRecipes();
  return JSON.stringify(file, null, 2);
}

export function executeGetComponentContract(args?: {
  name?: string;
}): DesignSystemToolTextResult {
  const loaded = getManifestOrError();
  if (!loaded.ok) return loaded.result;
  const manifest = loaded.manifest;

  const name = String(args?.name ?? "").trim();
  if (!name) {
    return dsTextResult("Error: name is required (e.g. Button, AlertBanner).", true);
  }

  const entry = manifest.components?.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  if (!entry) {
    return dsTextResult(`No cataloged component named ${name}.`, true);
  }

  return dsJsonResult({
    name: entry.name,
    contract: entry.contract,
    agent: entry.agent,
    usage: entry.usage,
    storybook: `nextjs-app/shared/components/${entry.name}/${entry.name}.stories.tsx`,
    validate: "npm run validate:components",
    driftCheck: "npm run check:contract-drift -- --strict",
  });
}

export function executeGetTokens(): DesignSystemToolTextResult {
  const manifest = loadAgentManifest();
  const catalog = loadTokenCatalog();

  if (!catalog && !manifest?.tokens) {
    return dsTextResult(
      "token-catalog.json and manifest tokens block missing. npm run build:tokens",
      true,
    );
  }

  return dsJsonResult({
    manifestTokens: manifest?.tokens ?? null,
    catalog: catalog
      ? {
          source: catalog.source,
          tokenCount: catalog.tokenCount,
          usageCoverage: catalog.usageCoverage,
          themes: catalog.themes,
          contrastPairCount: Array.isArray(catalog.contrastPairs)
            ? catalog.contrastPairs.length
            : 0,
          catalogPath: "nextjs-app/shared/foundations/token-catalog.json",
          runtimeCss: "nextjs-app/shared/styles/variables.css",
          tailwindBridge: "app/tailwind.css (DT-THEME block)",
        }
      : null,
    regenerate: "npm run build:tokens",
  });
}

function scanSourceForDtViolations(
  source: string,
  fileLabel: string,
): Array<{
  file: string;
  line: number;
  rule: string;
  message: string;
  suggest: string;
  snippet: string;
}> {
  const findings: Array<{
    file: string;
    line: number;
    rule: string;
    message: string;
    suggest: string;
    snippet: string;
  }> = [];

  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*")
    ) {
      continue;
    }
    for (const rule of RAW_UI_RULES) {
      if (!rule.pattern.test(line)) continue;
      findings.push({
        file: fileLabel,
        line: i + 1,
        rule: rule.id,
        message: rule.message,
        suggest: rule.suggest,
        snippet: line.trim().slice(0, 120),
      });
    }
  }
  return findings;
}

export function executeValidateComponentUsage(args?: {
  filePath?: string;
  snippet?: string;
}): DesignSystemToolTextResult {
  const filePath = String(args?.filePath ?? "").trim();
  const snippet = String(args?.snippet ?? "").trim();
  const root = designSystemMcpRoot();

  if (!filePath && !snippet) {
    return dsTextResult("Error: provide filePath (repo-relative) or snippet.", true);
  }

  let source = snippet;
  let label = "(snippet)";

  if (filePath) {
    const abs = filePath.startsWith("/")
      ? filePath
      : `${root}/${filePath.replace(/^\.\//, "")}`;
    if (!existsSync(abs)) {
      return dsTextResult(`File not found: ${filePath}`, true);
    }
    source = readFileSync(abs, "utf8");
    label = relative(root, abs).replace(/\\/g, "/");
  }

  const findings = scanSourceForDtViolations(source, label);

  return dsJsonResult({
    file: label,
    violationCount: findings.length,
    ok: findings.length === 0,
    findings,
    fleetLint: "npm run lint:dt-usage",
    note:
      findings.length > 0
        ? "Replace raw primitives with @dt/* imports from agent-manifest."
        : "No raw button/heading/shadcn-ui violations detected in this input.",
  });
}

export function readManifestSummaryResource(): string {
  const manifest = loadAgentManifest();
  if (!manifest) {
    return JSON.stringify({ error: manifestMissingMessage() }, null, 2);
  }

  const stable = manifest.components?.filter((c) => c.contract?.status === "stable") ?? [];
  const beta = manifest.components?.filter((c) => c.contract?.status === "beta") ?? [];

  return JSON.stringify(
    {
      schemaVersion: manifest.schemaVersion,
      generatedAt: manifest.generatedAt,
      summary: manifest.summary,
      usageCoverage: manifest.usageCoverage,
      relationshipGraph: manifest.relationshipGraph,
      statusRollup: {
        stable: stable.length,
        beta: beta.length,
        total: manifest.components?.length ?? 0,
      },
      topStable: stable.slice(0, 12).map((c) => ({
        name: c.name,
        import: c.usage?.publicImport ?? `@dt/${c.name}`,
      })),
      tools: [...DESIGN_SYSTEM_TOOL_NAMES],
      regenerate: "npm run build:tokens",
    },
    null,
    2,
  );
}

export function readTokenSummaryResource(): string {
  const catalog = loadTokenCatalog();
  const manifest = loadAgentManifest();
  if (!catalog) {
    return JSON.stringify({ error: manifestMissingMessage() }, null, 2);
  }

  return JSON.stringify(
    {
      manifestTokens: manifest?.tokens ?? null,
      tokenCount: catalog.tokenCount,
      source: catalog.source,
      themes: catalog.themes,
      usageCoverage: catalog.usageCoverage,
      paths: {
        runtime: "nextjs-app/shared/styles/variables.css",
        catalog: "nextjs-app/shared/foundations/token-catalog.json",
        dtcg: "nextjs-app/shared/foundations/tokens/production/",
      },
      regenerate: "npm run build:tokens",
    },
    null,
    2,
  );
}

export function readImportPolicyResource(): string {
  const doc = loadPublicApiDoc();
  if (!doc) {
    return "# Import policy\n\nSee docs/PUBLIC_API.md in the repo.\n";
  }
  return doc;
}
