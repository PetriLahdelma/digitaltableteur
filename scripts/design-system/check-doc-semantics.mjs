#!/usr/bin/env node
/**
 * Report on the documentation-semantics layer: RFC 2119 guideline levels, accessibility
 * criteria verification modes, and governance staleness.
 *
 * Reports by default, fails only with --strict (or a ratchet breach). The point is to
 * make three previously invisible things countable:
 *
 *   1. Guidance that carries no explicit severity, so an agent cannot tell a hard rule
 *      from a preference.
 *   2. Accessibility requirements that are documented but proven by nothing.
 *   3. Components whose documentation no human has read in a long time.
 *
 * None of these were expressible before: guidance was flat prose, a11y state was a set
 * of booleans that could not say who checked them, and nothing recorded review dates.
 *
 * Usage:
 *   node scripts/design-system/check-doc-semantics.mjs           # report
 *   node scripts/design-system/check-doc-semantics.mjs --json     # machine-readable
 *   node scripts/design-system/check-doc-semantics.mjs --strict   # fail on ratchet breach
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BLOCKS = join(ROOT, "nextjs-app/shared/foundations/dist/component-agent-blocks.json");
const RATCHET = join(ROOT, "scripts/design-system/doc-semantics-ratchet.json");

const STRICT = process.argv.includes("--strict");
const JSON_OUT = process.argv.includes("--json");
const UPDATE_RATCHET = process.argv.includes("--update-ratchet");

/** Days after which a lastReviewed date is considered stale. */
const STALE_DAYS = 180;

function main() {
  if (!existsSync(BLOCKS)) {
    console.error("FAIL: component-agent-blocks.json missing. Run: npm run build:agent-blocks");
    process.exit(1);
  }
  const { components } = JSON.parse(readFileSync(BLOCKS, "utf8"));
  const names = Object.keys(components);

  const report = {
    components: names.length,
    guidelines: { total: 0, explicitLevel: 0, defaulted: 0, withRationale: 0, hardRules: 0, hardRulesMissingRationale: [] },
    a11yCriteria: { total: 0, automated: 0, manual: 0, unverified: 0, worstOffenders: [] },
    governance: { withOwner: 0, withLastReviewed: 0, stale: [], missing: [] },
    content: { withContent: 0 },
  };

  const today = new Date();
  const unverifiedByComponent = [];

  for (const [name, block] of Object.entries(components)) {
    // --- Guidelines (RFC 2119) ---
    for (const g of block.guidelines ?? []) {
      report.guidelines.total += 1;
      // A defaulted level is the parser's fallback, not an author's decision.
      if (g.level === "should" || g.level === "should-not") report.guidelines.defaulted += 1;
      else report.guidelines.explicitLevel += 1;
      if (g.rationale) report.guidelines.withRationale += 1;
      if (g.level === "must" || g.level === "must-not") {
        report.guidelines.hardRules += 1;
        // DSDS: a hard rule without a reason is unactionable when an agent hits a conflict.
        if (!g.rationale) {
          report.guidelines.hardRulesMissingRationale.push(`${name}: ${g.guidance.slice(0, 70)}`);
        }
      }
    }

    // --- Accessibility criteria ---
    const criteria = block.a11yCriteria ?? [];
    let unverified = 0;
    for (const c of criteria) {
      report.a11yCriteria.total += 1;
      if (c.verificationMode === "automated") report.a11yCriteria.automated += 1;
      else if (c.verificationMode === "manual") report.a11yCriteria.manual += 1;
      else {
        report.a11yCriteria.unverified += 1;
        unverified += 1;
      }
    }
    if (unverified > 0) unverifiedByComponent.push({ name, unverified, total: criteria.length });

    // --- Governance ---
    const gov = block.governance;
    if (gov?.owner) report.governance.withOwner += 1;
    if (gov?.lastReviewed) {
      report.governance.withLastReviewed += 1;
      const days = Math.floor((today - new Date(gov.lastReviewed)) / 86400000);
      if (days > STALE_DAYS) report.governance.stale.push({ name, lastReviewed: gov.lastReviewed, days });
    } else {
      report.governance.missing.push(name);
    }

    if (block.content) report.content.withContent += 1;
  }

  unverifiedByComponent.sort((a, b) => b.unverified - a.unverified);
  report.a11yCriteria.worstOffenders = unverifiedByComponent.slice(0, 10);

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
    return finish(report);
  }

  const g = report.guidelines;
  const a = report.a11yCriteria;
  const gov = report.governance;

  console.log(`\nDoc semantics — ${report.components} components\n`);

  console.log("RFC 2119 guidelines");
  console.log(`  total                    ${g.total}`);
  console.log(`  explicit level           ${g.explicitLevel}  (author chose must/may)`);
  console.log(`  defaulted to should      ${g.defaulted}  (parser fallback, no author decision)`);
  console.log(`  with rationale           ${g.withRationale}`);
  console.log(`  hard rules (must/-not)   ${g.hardRules}`);
  if (g.hardRulesMissingRationale.length) {
    console.log(`  ! hard rules with no rationale: ${g.hardRulesMissingRationale.length}`);
    for (const r of g.hardRulesMissingRationale.slice(0, 5)) console.log(`      ${r}`);
  }

  console.log("\nAccessibility criteria");
  console.log(`  total                    ${a.total}`);
  console.log(`  automated (named check)  ${a.automated}`);
  console.log(`  manual (human claim)     ${a.manual}`);
  console.log(`  unverified (nothing)     ${a.unverified}`);
  if (a.worstOffenders.length) {
    console.log("  most unverified:");
    for (const o of a.worstOffenders.slice(0, 5)) {
      console.log(`      ${o.name}: ${o.unverified}/${o.total}`);
    }
  }

  console.log("\nGovernance");
  console.log(`  with owner               ${gov.withOwner}`);
  console.log(`  with lastReviewed        ${gov.withLastReviewed}`);
  console.log(`  stale (>${STALE_DAYS}d)            ${gov.stale.length}`);
  console.log(`  never reviewed           ${gov.missing.length}`);

  console.log(`\nContent guidance          ${report.content.withContent}/${report.components}\n`);

  return finish(report);
}

/**
 * Ratchet: the unverified-criteria count must never grow. This is the one number that
 * represents real accessibility risk, so it is the one that is allowed to fail a build.
 */
function finish(report) {
  const current = report.a11yCriteria.unverified;

  if (UPDATE_RATCHET) {
    writeFileSync(RATCHET, `${JSON.stringify({ maxUnverifiedA11yCriteria: current }, null, 2)}\n`);
    console.log(`✓ ratchet updated: maxUnverifiedA11yCriteria = ${current}`);
    return;
  }

  if (!existsSync(RATCHET)) return;
  const { maxUnverifiedA11yCriteria: ceiling } = JSON.parse(readFileSync(RATCHET, "utf8"));

  if (current > ceiling) {
    console.error(
      `FAIL: unverified a11y criteria ${current} > ceiling ${ceiling}. ` +
        `Verify the new requirement or record why it cannot be.`,
    );
    process.exit(1);
  }
  if (current < ceiling && STRICT) {
    console.error(
      `FAIL: unverified a11y criteria dropped to ${current} (ceiling ${ceiling}). ` +
        `Lower the ceiling: node scripts/design-system/check-doc-semantics.mjs --update-ratchet`,
    );
    process.exit(1);
  }
  console.log(`✓ unverified a11y criteria ${current} <= ceiling ${ceiling}`);
}

main();
