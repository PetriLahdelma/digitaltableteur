/**
 * Pure usage validation shared by the stdio MCP server, the public /mcp
 * route, and `validate:agent-usage`. No filesystem access: callers pass the
 * source text and the rule set (the full agent manifest locally, the compact
 * contract-rules.json build artifact on the serverless route).
 */
import { checkUsage, usageFromProps, type ContractFinding, type RuleSource } from "./contract-rules";
import { extractJsxUsages } from "./jsx-usage";

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

export type RawUiFinding = {
  file: string;
  line: number;
  rule: string;
  message: string;
  suggest: string;
  snippet: string;
};

export function scanSourceForDtViolations(source: string, fileLabel: string): RawUiFinding[] {
  const findings: RawUiFinding[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
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

export type ValidateUsageInput = {
  /** Source to scan; omit when validating structured props only. */
  source?: string;
  label: string;
  /** Match bare catalog tag names (snippets without imports). */
  matchBareTags: boolean;
  /** Canonical component name for a structured props check. */
  component?: string;
  props?: Record<string, unknown>;
};

export function validateUsage(
  input: ValidateUsageInput,
  rulesByName: ReadonlyMap<string, RuleSource>,
) {
  const findings = input.source ? scanSourceForDtViolations(input.source, input.label) : [];
  const contractFindings: ContractFinding[] = [];

  if (input.source) {
    const usages = extractJsxUsages(input.source, new Set(rulesByName.keys()), input.label, {
      matchBareTags: input.matchBareTags,
    });
    for (const usage of usages) {
      contractFindings.push(...checkUsage(usage, rulesByName.get(usage.component) ?? {}));
    }
  }
  if (input.component && input.props) {
    contractFindings.push(
      ...checkUsage(
        usageFromProps(input.component, input.props),
        rulesByName.get(input.component) ?? {},
      ),
    );
  }

  const contractErrors = contractFindings.filter((f) => f.severity === "error").length;
  const violationCount = findings.length + contractErrors;
  return {
    file: input.label,
    component: input.component ?? null,
    violationCount,
    ok: violationCount === 0,
    findings,
    contractFindings,
    warningCount: contractFindings.length - contractErrors,
    fleetLint: "npm run validate:agent-usage",
    note:
      violationCount > 0
        ? "Resolve raw-UI findings and machine-readable component contract violations."
        : "No raw-UI or component contract violations detected in this input.",
  };
}
