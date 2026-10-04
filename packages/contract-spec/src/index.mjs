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

/**
 * Extensions this checker understands (RFC 0001, draft). SPEC.md section 3
 * lets checkers ignore unknown `x-` fields; a known one is validated, but its
 * findings never change a 1.0 level (section 9), they are reported apart.
 */
const readSchema = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../schema/extensions/${name}`, import.meta.url),
      "utf8",
    ),
  );
export const extensionSchemas = {
  "x-temporal": readSchema("temporal.schema.json"),
  "x-consequence": readSchema("consequence.schema.json"),
};

let ajvInstance = null;
function ajv() {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

let compiled = null;
function schemaValidator() {
  if (!compiled) compiled = ajv().compile(schema);
  return compiled;
}

const extensionValidators = {};
function extensionValidator(key) {
  if (!extensionValidators[key]) {
    extensionValidators[key] = ajv().compile(extensionSchemas[key]);
  }
  return extensionValidators[key];
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
  const extensions = checkExtensions(contract, {
    now,
    maxAgeDays,
    testRoot: options.testRoot ?? process.cwd(),
  });
  return { level, findings, warnings, verification, extensions };
}

/** Consequence classes and the weakest treatment SPEC RFC 0001 allows each. */
export const CONSEQUENCE_FLOORS = {
  reversible: { recovery: ["undo", "inverse-action"] },
  irreversible: { confirmation: "explicit" },
  external: { confirmation: "review" },
  financial: { confirmation: "explicit", recommendAuthentication: "step-up" },
  privacy: { confirmation: "review" },
  identity: { confirmation: "explicit", authentication: "recent" },
};
const CONFIRMATION_ORDER = ["none", "review", "explicit", "typed"];
const AUTHENTICATION_ORDER = ["none", "recent", "step-up"];

function atLeast(order, value, floor) {
  return order.indexOf(value ?? order[0]) >= order.indexOf(floor);
}

/** Findings for a treatment (policy or action) weaker than its class floor. */
function consequenceFloorFindings(label, consequenceClass, treatment) {
  const floor = CONSEQUENCE_FLOORS[consequenceClass];
  if (!floor) return { findings: [], warnings: [] };
  const findings = [];
  const warnings = [];
  if (floor.recovery && !floor.recovery.includes(treatment.recovery)) {
    findings.push(
      `${label}: class "${consequenceClass}" needs recovery ${floor.recovery.join(" or ")}, has "${treatment.recovery ?? "none"}"`,
    );
  }
  if (
    floor.confirmation &&
    !atLeast(CONFIRMATION_ORDER, treatment.confirmation, floor.confirmation)
  ) {
    findings.push(
      `${label}: class "${consequenceClass}" needs confirmation "${floor.confirmation}" or stronger, has "${treatment.confirmation ?? "none"}"`,
    );
  }
  if (
    floor.authentication &&
    !atLeast(
      AUTHENTICATION_ORDER,
      treatment.authentication,
      floor.authentication,
    )
  ) {
    findings.push(
      `${label}: class "${consequenceClass}" needs authentication "${floor.authentication}" or stronger, has "${treatment.authentication ?? "none"}"`,
    );
  }
  if (
    floor.recommendAuthentication &&
    !atLeast(
      AUTHENTICATION_ORDER,
      treatment.authentication,
      floor.recommendAuthentication,
    )
  ) {
    warnings.push(
      `${label}: class "${consequenceClass}" should use authentication "${floor.recommendAuthentication}"`,
    );
  }
  return { findings, warnings };
}

/**
 * Check one verifiable extension claim: an automated claim must point at a
 * test file that exists and names the claim id (so deleting or renaming the
 * test breaks the claim); a manual claim must be recently reviewed.
 */
function claimFindings(label, claim, { now, maxAgeDays, testRoot }) {
  const findings = [];
  if (claim.verification === "automated" && typeof claim.test === "string") {
    const path = isAbsolute(claim.test)
      ? claim.test
      : resolve(testRoot, claim.test);
    if (!existsSync(path)) {
      findings.push(`${label}: test ${claim.test} does not exist`);
    } else if (!readFileSync(path, "utf8").includes(claim.id)) {
      findings.push(
        `${label}: test ${claim.test} does not name the claim id "${claim.id}"`,
      );
    }
  }
  if (claim.verification === "manual" && claim.reviewedAt) {
    const reviewed = new Date(claim.reviewedAt);
    if (
      !Number.isNaN(reviewed.getTime()) &&
      daysBetween(reviewed, now) > maxAgeDays
    ) {
      findings.push(
        `${label}: manual review is ${Math.floor(daysBetween(reviewed, now))} days old (max ${maxAgeDays})`,
      );
    }
  }
  return findings;
}

/**
 * Validate the extensions this checker understands. Returns findings that a
 * caller may choose to enforce (`--strict-extensions`) and claim counts per
 * verification mode; never affects the 1.0 conformance level.
 *
 * @param {object} contract
 * @param {{ now?: Date, maxAgeDays?: number, testRoot?: string }} [options]
 */
export function checkExtensions(contract, options = {}) {
  const context = {
    now: options.now ?? new Date(),
    maxAgeDays: options.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS,
    testRoot: options.testRoot ?? process.cwd(),
  };
  const present = Object.keys(extensionSchemas).filter(
    (key) => contract?.[key] !== undefined,
  );
  const findings = [];
  const warnings = [];
  const claims = { automated: 0, manual: 0, unverified: 0 };
  const count = (claim) => {
    if (claim?.verification in claims) claims[claim.verification] += 1;
  };

  for (const key of present) {
    const validate = extensionValidator(key);
    if (!validate(contract[key])) {
      for (const error of validate.errors ?? []) {
        findings.push(`${key}${error.instancePath || ""} ${error.message}`);
      }
    }
  }

  const temporal = contract?.["x-temporal"];
  if (temporal && typeof temporal === "object") {
    const seen = new Set();
    for (const group of ["transitions", "validity", "interruptions"]) {
      for (const claim of temporal[group] ?? []) {
        if (!claim || typeof claim !== "object") continue;
        if (seen.has(claim.id))
          findings.push(`x-temporal: duplicate claim id "${claim.id}"`);
        seen.add(claim.id);
        count(claim);
        findings.push(
          ...claimFindings(`x-temporal ${group} "${claim.id}"`, claim, context),
        );
      }
    }
  }

  const consequence = contract?.["x-consequence"];
  if (consequence && typeof consequence === "object") {
    const ruleIds = new Set((contract.rules ?? []).map((rule) => rule.id));
    if (consequence.prop) {
      const prop = contract.props?.[consequence.prop];
      if (!prop) {
        findings.push(
          `x-consequence: prop "${consequence.prop}" is not in props`,
        );
      } else if (prop.type !== "union" || !Array.isArray(prop.values)) {
        findings.push(
          `x-consequence: prop "${consequence.prop}" must be a union of consequence classes`,
        );
      } else {
        for (const value of prop.values) {
          if (!(value in CONSEQUENCE_FLOORS)) {
            findings.push(
              `x-consequence: prop value "${value}" is not a consequence class`,
            );
          } else if (!consequence.policies?.[value]) {
            findings.push(
              `x-consequence: class "${value}" is allowed by the prop but has no policy`,
            );
          }
        }
      }
    }
    for (const [consequenceClass, policy] of Object.entries(
      consequence.policies ?? {},
    )) {
      const label = `x-consequence policy "${consequenceClass}"`;
      const floor = consequenceFloorFindings(
        label,
        consequenceClass,
        policy ?? {},
      );
      findings.push(...floor.findings);
      warnings.push(...floor.warnings);
      if (policy?.rule && !ruleIds.has(policy.rule)) {
        findings.push(`${label}: rule "${policy.rule}" is not in rules`);
      }
    }
    const seen = new Set();
    for (const action of consequence.actions ?? []) {
      if (!action || typeof action !== "object") continue;
      const label = `x-consequence action "${action.id}"`;
      if (seen.has(action.id))
        findings.push(`x-consequence: duplicate action id "${action.id}"`);
      seen.add(action.id);
      count(action);
      const floor = consequenceFloorFindings(label, action.class, action);
      findings.push(...floor.findings);
      warnings.push(...floor.warnings);
      findings.push(...claimFindings(label, action, context));
      if (action.rule && !ruleIds.has(action.rule)) {
        findings.push(`${label}: rule "${action.rule}" is not in rules`);
      }
    }
  }

  return { present, findings, warnings, claims };
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
  const extensions = {
    contracts: contracts.filter((entry) => entry.extensions?.present.length)
      .length,
    findings: contracts.reduce(
      (sum, entry) => sum + (entry.extensions?.findings.length ?? 0),
      0,
    ),
    claims: { automated: 0, manual: 0, unverified: 0 },
  };
  for (const entry of contracts) {
    for (const key of Object.keys(extensions.claims))
      extensions.claims[key] += entry.extensions?.claims[key] ?? 0;
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
      extensions,
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
