/**
 * Design System Contract 1.0: reference conformance checker and rule
 * evaluator. Normative text lives in SPEC.md; where this code and the spec
 * disagree, the spec wins and this code has a bug.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020").default;
const addFormats = require("ajv-formats");

export const SPEC_VERSION = "1.0";
export const DEFAULT_MAX_AGE_DAYS = 180;
export const LEVELS = [
  { level: 1, name: "Described" },
  { level: 2, name: "Checkable" },
  { level: 3, name: "Evidenced" },
];

const SCHEMA_PATH = new URL("../schema/contract.schema.json", import.meta.url);
export const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));

let compiled = null;
function schemaValidator() {
  if (!compiled) {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    compiled = ajv.compile(schema);
  }
  return compiled;
}

const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist", ".next"]);

/** Find contract files: `*.contract.json` under each directory argument. */
export function findContractFiles(paths, { suffix = ".contract.json" } = {}) {
  const files = [];
  const visit = (path) => {
    const stats = statSync(path);
    if (stats.isFile()) {
      files.push(path);
      return;
    }
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) visit(join(path, entry.name));
      } else if (entry.name.endsWith(suffix)) {
        visit(join(path, entry.name));
      }
    }
  };
  for (const path of paths) visit(path);
  return [...new Set(files)].sort();
}

function daysBetween(from, to) {
  return (to.getTime() - from.getTime()) / 86_400_000;
}

function isUrl(value) {
  return /^https?:\/\//.test(value);
}

/**
 * Read an evidence artifact and cross-check it against its reference. When the
 * artifact is JSON carrying its own commit or timestamp, those must agree with
 * the reference: a contract cannot claim a fresher run than the record shows.
 */
function verifyArtifact(ref, root) {
  if (isUrl(ref.artifact))
    return { ok: true, note: "remote artifact not fetched" };
  const path = isAbsolute(ref.artifact)
    ? ref.artifact
    : resolve(root, ref.artifact);
  if (!existsSync(path))
    return { ok: false, note: `artifact missing: ${ref.artifact}` };
  if (!path.endsWith(".json")) return { ok: true };
  let record;
  try {
    record = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { ok: false, note: `artifact is not valid JSON: ${ref.artifact}` };
  }
  const recordCommit = record.sourceCommit ?? record.sourceSHA;
  if (
    typeof recordCommit === "string" &&
    !recordCommit.startsWith(ref.sourceCommit) &&
    !ref.sourceCommit.startsWith(recordCommit)
  ) {
    return {
      ok: false,
      note: `artifact commit ${recordCommit.slice(0, 12)} does not match reference ${ref.sourceCommit.slice(0, 12)}`,
    };
  }
  const recordTime = record.capturedAt ?? record.generatedAt;
  if (
    typeof recordTime === "string" &&
    Date.parse(recordTime) !== Date.parse(ref.capturedAt)
  ) {
    return {
      ok: false,
      note: `artifact capturedAt ${recordTime} does not match reference ${ref.capturedAt}`,
    };
  }
  return { ok: true };
}

function sourceChangedSince(commit, sourcePaths, root) {
  try {
    execFileSync(
      "git",
      ["diff", "--quiet", commit, "HEAD", "--", ...sourcePaths],
      {
        cwd: root,
        stdio: "ignore",
      },
    );
    return false;
  } catch (error) {
    // exit 1 = differences; anything else (unknown commit) is unprovable
    return error.status === 1 ? true : null;
  }
}

/**
 * Check one parsed contract. Returns the highest level it meets and every
 * finding that kept it from the next one.
 *
 * @param {object} contract
 * @param {{ root?: string, now?: Date, maxAgeDays?: number, gitFreshness?: boolean }} [options]
 */
export function checkContract(contract, options = {}) {
  const root = options.root ?? process.cwd();
  const now = options.now ?? new Date();
  const maxAgeDays = options.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS;
  const findings = { 1: [], 2: [], 3: [] };
  const warnings = [];

  // Level 1: Described. The document validates against the schema.
  const validate = schemaValidator();
  if (!validate(contract)) {
    for (const error of validate.errors ?? []) {
      findings[1].push(`${error.instancePath || "/"} ${error.message}`);
    }
  }

  // Level 2: Checkable. Accountability and accessibility are structured data.
  const criteria = contract?.accessibility?.criteria ?? [];
  if (!contract?.governance) {
    findings[2].push("governance (owner, lastReviewed) is missing");
  }
  if (criteria.length === 0) {
    findings[2].push(
      "accessibility.criteria is empty: no accessibility claim or declared gap is machine-readable",
    );
  }
  for (const [name, prop] of Object.entries(contract?.props ?? {})) {
    if (prop?.type === "union" && !Array.isArray(prop.values)) {
      findings[2].push(`prop "${name}" is a union without values`);
    }
    // A deprecation is only machine-actionable with a migration path: a
    // replacement a codemod can target, or a removal version a gate can hold.
    if (
      prop?.deprecated &&
      !prop.deprecated.replacement &&
      !prop.deprecated.removeIn
    ) {
      findings[2].push(
        `prop "${name}" is deprecated without a replacement or removeIn`,
      );
    }
  }
  if (
    contract?.deprecation &&
    !contract.deprecation.replacement &&
    !contract.deprecation.removeIn
  ) {
    findings[2].push(
      "component is deprecated without a replacement or removeIn",
    );
  }

  // Level 3: Evidenced. Every automated claim is backed by a fresh, passing,
  // resolvable record; every manual claim by a recent review.
  const automated = criteria.filter(
    (criterion) => criterion.verification === "automated",
  );
  if (automated.length === 0) {
    findings[3].push(
      "no automated accessibility criterion: nothing is re-proven by a machine",
    );
  }
  for (const criterion of automated) {
    const refs = criterion.evidence ?? [];
    if (refs.length === 0) {
      findings[3].push(
        `criterion "${criterion.id}" is automated but has no evidence`,
      );
      continue;
    }
    for (const ref of refs) {
      const label = `criterion "${criterion.id}" evidence ${ref.artifact}`;
      if (ref.passed !== true)
        findings[3].push(`${label} records a failing run`);
      const captured = new Date(ref.capturedAt);
      if (Number.isNaN(captured.getTime())) {
        findings[3].push(`${label} has an invalid capturedAt`);
      } else if (daysBetween(captured, now) > maxAgeDays) {
        findings[3].push(
          `${label} is ${Math.floor(daysBetween(captured, now))} days old (max ${maxAgeDays})`,
        );
      } else if (captured.getTime() - now.getTime() > 5 * 60_000) {
        findings[3].push(`${label} is dated in the future`);
      }
      const artifact = verifyArtifact(ref, root);
      if (!artifact.ok) findings[3].push(`${label}: ${artifact.note}`);
      if (
        options.gitFreshness &&
        Array.isArray(contract.source) &&
        contract.source.length > 0
      ) {
        const changed = sourceChangedSince(
          ref.sourceCommit,
          contract.source,
          root,
        );
        if (changed === true)
          findings[3].push(
            `${label} predates a change to the component source`,
          );
        if (changed === null)
          warnings.push(
            `${label}: commit ${ref.sourceCommit.slice(0, 12)} not found; freshness unprovable`,
          );
      }
    }
  }
  for (const criterion of criteria.filter(
    (entry) => entry.verification === "manual",
  )) {
    const reviewed = new Date(criterion.reviewedAt);
    if (
      !Number.isNaN(reviewed.getTime()) &&
      daysBetween(reviewed, now) > maxAgeDays
    ) {
      findings[3].push(
        `criterion "${criterion.id}" manual review is ${Math.floor(daysBetween(reviewed, now))} days old (max ${maxAgeDays})`,
      );
    }
  }
  if (contract?.governance?.lastReviewed) {
    const reviewed = new Date(contract.governance.lastReviewed);
    if (
      !Number.isNaN(reviewed.getTime()) &&
      daysBetween(reviewed, now) > maxAgeDays
    ) {
      warnings.push(
        `governance.lastReviewed is ${Math.floor(daysBetween(reviewed, now))} days old`,
      );
    }
  }

  let level = 0;
  for (const { level: candidate } of LEVELS) {
    if (findings[candidate].length > 0) break;
    level = candidate;
  }
  const verification = { automated: 0, manual: 0, unverified: 0 };
  for (const criterion of criteria) {
    if (criterion.verification in verification)
      verification[criterion.verification] += 1;
  }
  return { level, findings, warnings, verification };
}

/**
 * Check a set of contract files. The system level is the lowest level met by
 * any stable contract (stable is the promise); without stable contracts it is
 * the lowest level among non-deprecated ones.
 */
export function checkSystem(files, options = {}) {
  const contracts = files.map((file) => {
    // Evidence paths resolve against the evidence root: the caller's --root,
    // else the directory holding the contract (SPEC.md section 6).
    const root = options.root ?? dirname(resolve(file));
    const path = relative(options.root ?? process.cwd(), file) || file;
    let contract;
    try {
      contract = JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      return {
        file: path,
        name: null,
        status: null,
        level: 0,
        findings: { 1: [`not valid JSON: ${error.message}`], 2: [], 3: [] },
        warnings: [],
        verification: { automated: 0, manual: 0, unverified: 0 },
      };
    }
    return {
      file: path,
      name: contract.name ?? null,
      status: contract.status ?? null,
      ...checkContract(contract, { ...options, root }),
    };
  });
  const stable = contracts.filter((entry) => entry.status === "stable");
  const scope =
    stable.length > 0
      ? stable
      : contracts.filter((entry) => entry.status !== "deprecated");
  const systemLevel =
    scope.length > 0 ? Math.min(...scope.map((entry) => entry.level)) : 0;
  const distribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const entry of contracts) distribution[entry.level] += 1;
  const verification = { automated: 0, manual: 0, unverified: 0 };
  for (const entry of contracts) {
    for (const key of Object.keys(verification))
      verification[key] += entry.verification[key];
  }
  return {
    specVersion: SPEC_VERSION,
    checkedAt: (options.now ?? new Date()).toISOString(),
    maxAgeDays: options.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS,
    systemLevel,
    levelScope: stable.length > 0 ? "stable" : "non-deprecated",
    contracts,
    summary: {
      total: contracts.length,
      stable: stable.length,
      distribution,
      verification,
    },
  };
}

function isPresent(props, name) {
  if (name === "children") {
    const children = props.children;
    return (
      children !== undefined &&
      children !== null &&
      children !== false &&
      children !== ""
    );
  }
  return (
    Object.prototype.hasOwnProperty.call(props, name) &&
    props[name] !== undefined
  );
}

function isLiteral(value) {
  return ["string", "number", "boolean"].includes(typeof value);
}

function matches(props, name, match) {
  if ("present" in match) return isPresent(props, name);
  if ("absent" in match) return !isPresent(props, name);
  const value = props[name];
  // A value the caller cannot state as a literal never satisfies equals/oneOf:
  // a rule must not fire on something the checker cannot prove.
  if (!isLiteral(value)) return false;
  if ("equals" in match) return value === match.equals;
  return match.oneOf.includes(value);
}

/**
 * Evaluate a contract's rules against one usage.
 *
 * @param {{ rules?: object[] }} contract
 * @param {Record<string, unknown>} props statically known props; include
 *   `children` when the usage has children
 * @returns {{ rule: string, severity: "error"|"warning", kind: "forbid"|"requireAnyOf"|"requireAllOf", props: string[], reason: string }[]}
 */
export function evaluateRules(contract, props) {
  const violations = [];
  for (const rule of contract.rules ?? []) {
    const fires = Object.entries(rule.when).every(([name, match]) =>
      matches(props, name, match),
    );
    if (!fires) continue;
    const base = {
      rule: rule.id,
      severity: rule.severity,
      reason: rule.reason,
    };
    const forbidden = (rule.forbid ?? []).filter((name) =>
      isPresent(props, name),
    );
    if (forbidden.length > 0)
      violations.push({ ...base, kind: "forbid", props: forbidden });
    if (
      rule.requireAnyOf &&
      !rule.requireAnyOf.some((name) => isPresent(props, name))
    ) {
      violations.push({
        ...base,
        kind: "requireAnyOf",
        props: rule.requireAnyOf,
      });
    }
    const missing = (rule.requireAllOf ?? []).filter(
      (name) => !isPresent(props, name),
    );
    if (missing.length > 0)
      violations.push({ ...base, kind: "requireAllOf", props: missing });
  }
  return violations;
}
