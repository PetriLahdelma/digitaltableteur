/**
 * Contract rule engine: checks one JSX usage of a design-system component
 * against the machine-checkable rules in its agent block.
 *
 * Rule sources (all in the agent manifest):
 * - `propRelationships`: derived from the TypeScript props (discriminated
 *   unions, controlled/uncontrolled pairs) by build-component-agent-blocks.
 * - `forbiddenCombos`: authored in the component contract.
 * - `props[name].deprecated`: `@deprecated` JSDoc tags on the props.
 *
 * The engine is conservative. It only reports what it can prove from the
 * source: a non-literal expression never satisfies an `equals`/`oneOf`
 * condition, and a JSX spread (`{...rest}`) could supply any prop, so rules
 * that depend on a prop being absent are skipped when a spread is present.
 */

export type JsxPropValue =
  | { kind: "literal"; value: string | number | boolean }
  | { kind: "expression" };

export type JsxUsage = {
  component: string;
  line: number;
  props: Record<string, JsxPropValue>;
  hasChildren: boolean;
  hasSpread: boolean;
};

export type PropMatch =
  | { present: true }
  | { absent: true }
  | { equals: string | number | boolean }
  | { oneOf: Array<string | number | boolean> };

export type ForbiddenCombo = {
  id: string;
  when: Record<string, PropMatch>;
  forbid?: string[];
  requireAnyOf?: string[];
  requireAllOf?: string[];
  reason: string;
  severity: "error" | "warning";
  evidence?: string;
};

export type PropRelationship =
  | { kind: "mutuallyExclusive"; props: string[]; reason: string }
  | { kind: "requires"; prop: string; requires: string[]; reason: string };

export type RuleSource = {
  propRelationships?: PropRelationship[];
  forbiddenCombos?: ForbiddenCombo[];
  props?: Record<string, { deprecated?: boolean; deprecation?: string }>;
};

export type ContractFinding = {
  component: string;
  line: number | null;
  rule: string;
  severity: "error" | "warning";
  props: string[];
  message: string;
};

/** Normalize a plain props object (the MCP `props` argument) into a usage. */
export function usageFromProps(
  component: string,
  props: Record<string, unknown>,
): JsxUsage {
  const normalized: Record<string, JsxPropValue> = {};
  for (const [name, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    normalized[name] =
      typeof value === "string" || typeof value === "number" || typeof value === "boolean"
        ? { kind: "literal", value }
        : { kind: "expression" };
  }
  const hasChildren = "children" in normalized;
  delete normalized.children;
  return { component, line: 0, props: normalized, hasChildren, hasSpread: false };
}

function isPresent(usage: JsxUsage, name: string): boolean {
  if (name === "children") return usage.hasChildren;
  return Object.prototype.hasOwnProperty.call(usage.props, name);
}

/** Absence is only provable when no spread could supply the prop. */
function isProvablyAbsent(usage: JsxUsage, name: string): boolean {
  if (name === "children") return !usage.hasChildren;
  return !usage.hasSpread && !isPresent(usage, name);
}

function matches(usage: JsxUsage, name: string, match: PropMatch): boolean {
  if ("present" in match) return isPresent(usage, name);
  if ("absent" in match) return isProvablyAbsent(usage, name);
  const value = usage.props[name];
  if (!value || value.kind !== "literal") return false;
  if ("equals" in match) return value.value === match.equals;
  return match.oneOf.includes(value.value);
}

export function checkUsage(usage: JsxUsage, rules: RuleSource): ContractFinding[] {
  const findings: ContractFinding[] = [];
  const line = usage.line > 0 ? usage.line : null;
  const push = (
    rule: string,
    severity: ContractFinding["severity"],
    props: string[],
    message: string,
  ) => findings.push({ component: usage.component, line, rule, severity, props, message });

  for (const relationship of rules.propRelationships ?? []) {
    if (relationship.kind === "mutuallyExclusive") {
      const present = relationship.props.filter((name) => isPresent(usage, name));
      if (present.length > 1) push("mutuallyExclusive", "error", present, relationship.reason);
      continue;
    }
    if (!isPresent(usage, relationship.prop)) continue;
    const missing = relationship.requires.filter((name) => isProvablyAbsent(usage, name));
    if (missing.length) {
      push("requires", "error", [relationship.prop, ...missing], relationship.reason);
    }
  }

  for (const combo of rules.forbiddenCombos ?? []) {
    const fires = Object.entries(combo.when).every(([name, match]) =>
      matches(usage, name, match),
    );
    if (!fires) continue;
    const conditionProps = Object.keys(combo.when);

    const forbidden = (combo.forbid ?? []).filter((name) => isPresent(usage, name));
    if (forbidden.length) {
      push(combo.id, combo.severity, [...conditionProps, ...forbidden], combo.reason);
    }
    const anyOf = combo.requireAnyOf ?? [];
    if (anyOf.length && anyOf.every((name) => isProvablyAbsent(usage, name))) {
      push(combo.id, combo.severity, [...conditionProps, ...anyOf], combo.reason);
    }
    const missingAll = (combo.requireAllOf ?? []).filter((name) =>
      isProvablyAbsent(usage, name),
    );
    if (missingAll.length) {
      push(combo.id, combo.severity, [...conditionProps, ...missingAll], combo.reason);
    }
  }

  for (const [name, schema] of Object.entries(rules.props ?? {})) {
    if (!schema.deprecated || !isPresent(usage, name)) continue;
    push(
      "deprecated",
      "warning",
      [name],
      schema.deprecation
        ? `\`${name}\` is deprecated: ${schema.deprecation}`
        : `\`${name}\` is deprecated.`,
    );
  }

  return findings;
}

/** Components with at least one rule the engine can check. */
export function hasCheckableRules(rules: RuleSource | undefined): boolean {
  if (!rules) return false;
  return Boolean(
    rules.propRelationships?.length ||
      rules.forbiddenCombos?.length ||
      Object.values(rules.props ?? {}).some((schema) => schema.deprecated),
  );
}
