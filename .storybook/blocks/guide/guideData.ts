/**
 * Live figures for guide pages, read from the repo at Storybook build time so
 * the prose never carries a hand-typed count that goes stale.
 */
import enStrings from "../../../nextjs-app/shared/locales/en/translation.json";
import fiStrings from "../../../nextjs-app/shared/locales/fi/translation.json";
import svStrings from "../../../nextjs-app/shared/locales/sv/translation.json";
import tokenCatalog from "../../../nextjs-app/shared/foundations/token-catalog.json";
// Named import: the manifest is large and only its summary is needed here.
import { generatedAt as manifestGeneratedAt, summary as manifestSummary } from "../../../nextjs-app/shared/foundations/dist/agent-manifest.json";
import { generatedAt as usageGeneratedAt, summary as usageSummary } from "../../../nextjs-app/shared/foundations/dist/component-usage.json";

interface ContractA11y {
  reviewed?: boolean;
  forcedColorsVerified?: boolean;
  realBrowserForcedColorsVerified?: boolean;
  accessibilityTreeVerified?: boolean;
}

interface Contract {
  name?: string;
  status?: string;
  a11y?: ContractA11y;
  forbiddenCombos?: unknown[];
  consumers?: unknown[];
}

const contractModules = import.meta.glob<Contract>(
  [
    "../../../nextjs-app/shared/components/*/*.contract.json",
    "../../../nextjs-app/shared/patterns/*/*.contract.json",
  ],
  { eager: true, import: "default" },
);

export const contracts: Contract[] = Object.values(contractModules);

const count = (test: (contract: Contract) => boolean) =>
  contracts.filter(test).length;

export const governanceFigures = {
  usageRules: contracts.reduce((sum, c) => sum + (c.forbiddenCombos?.length ?? 0), 0),
  withConsumers: count((c) => (c.consumers?.length ?? 0) > 0),
};

export const a11yFigures = {
  total: contracts.length,
  stable: count((c) => c.status === "stable"),
  reviewed: count((c) => c.a11y?.reviewed === true),
  forcedColors: count((c) => c.a11y?.forcedColorsVerified === true),
  realBrowserForcedColors: count(
    (c) => c.a11y?.realBrowserForcedColorsVerified === true,
  ),
  accessibilityTree: count((c) => c.a11y?.accessibilityTreeVerified === true),
};

type ContrastRow = { pass?: boolean };
const contrastByTheme =
  (tokenCatalog as { contrastByTheme?: Record<string, ContrastRow[]> })
    .contrastByTheme ?? {};

export const contrastFigures = {
  themes: Object.keys(contrastByTheme).length,
  pairs: Object.values(contrastByTheme).reduce(
    (sum, rows) => sum + rows.length,
    0,
  ),
  passing: Object.values(contrastByTheme).reduce(
    (sum, rows) => sum + rows.filter((row) => row.pass === true).length,
    0,
  ),
};

export const tokenFigures = {
  tokens: tokenCatalog.tokenCount,
  groups: tokenCatalog.groups.length,
  themes: tokenCatalog.themes.length,
  generatedAt: tokenCatalog.generatedAt,
};

export const catalogFigures = {
  components: manifestSummary.componentCount,
  codebaseComponents: manifestSummary.codebaseComponentCount,
  completeness: manifestSummary.catalogCompletenessPercent,
  status: manifestSummary.statusCounts,
  generatedAt: manifestGeneratedAt,
};

export const usageFigures = {
  ...usageSummary,
  generatedAt: usageGeneratedAt,
};

/** "30 Oct 2026": generated timestamps shown next to figures. */
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

type TokenGroup = { category: string; tokens: { name: string }[] };

/** Token count per category, in catalog order. */
export const tokenCategories: Record<string, number> = (
  tokenCatalog.groups as TokenGroup[]
).reduce<Record<string, number>>((counts, group) => {
  counts[group.category] = (counts[group.category] ?? 0) + group.tokens.length;
  return counts;
}, {});

const leafKeys = (value: unknown, prefix = ""): string[] =>
  value && typeof value === "object"
    ? Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
        leafKeys(child, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix];

const englishKeys = leafKeys(enStrings);
const missingFrom = (strings: unknown) => {
  const present = new Set(leafKeys(strings));
  return englishKeys.filter((key) => !present.has(key)).length;
};

export const localeFigures = {
  keys: englishKeys.length,
  missingFi: missingFrom(fiStrings),
  missingSv: missingFrom(svStrings),
};
