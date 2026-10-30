#!/usr/bin/env node
/**
 * Promote a component alpha -> beta, but only on evidence.
 *
 *   npm run promote -- <Name>            # check, then promote when every check passes
 *   npm run promote -- <Name> --check    # report only, change nothing
 *
 * Replaces promote-ready-alpha.mjs, which flipped status and set
 * forcedColorsVerified / lightDarkVerified / reviewed to true for any component
 * that merely had Example + ForcedColors stories, and wrote a placeholder Figma
 * link. That made the contract a list of claims nobody had checked.
 *
 * This command never asserts anything itself. It verifies:
 *   1. the contract is alpha;
 *   2. every required story is exported by the stories file;
 *   3. the test file asserts axe (toHaveNoViolations);
 *   4. documentation exists (a colocated MDX page or contract `usage`);
 *   5. a human/agent a11y review is recorded (a11y.reviewed + a dated
 *      reviewedNote no older than the day the component became alpha);
 *   6. the figma link resolves to a real component in figma-component-index.json;
 *   7. fresh, passing a11y evidence exists for every required story in light,
 *      dark and forced-colors, and axe + the accessibility tree resolve to
 *      `automated` through deriveA11yCriteria;
 *   8. after writing, validate:components accepts the component at beta
 *      (otherwise every write is rolled back).
 * Only then does it set status "beta", set lightDarkVerified and
 * forcedColorsVerified (true, because the evidence just proved them), flip the
 * stories meta lifecycle tag alpha -> beta and drop the name from the
 * alpha-age legacy list. validate-components enforces the same evidence at
 * beta, so hand-editing the contract instead does not get past pre-push.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { deriveA11yCriteria } from "./derive-a11y-criteria.mjs";
import { isEvidenceFresh, readEvidenceRecords } from "./a11y-evidence-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const CHECK_ONLY = args.includes("--check");
const MODES = ["light", "dark", "forced-colors"];

if (!name) {
  console.error("Usage: npm run promote -- <ComponentName> [--check]");
  process.exit(2);
}

const dir = ["components", "patterns", "templates"]
  .map((d) => join(ROOT, "nextjs-app", "shared", d, name))
  .find((d) => existsSync(join(d, `${name}.contract.json`)));
if (!dir) {
  console.error(`No contract found for ${name}.`);
  process.exit(2);
}

const contractPath = join(dir, `${name}.contract.json`);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const storiesPath = join(dir, `${name}.stories.tsx`);
const stories = existsSync(storiesPath) ? readFileSync(storiesPath, "utf8") : "";
const results = [];
const check = (label, ok, detail = "") => results.push({ label, ok, detail });

/** Storybook's id sanitiser: lower-case, non-alphanumerics to single dashes. */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
/** Export name -> story name -> slug, as Storybook does ("ForcedColors" -> "forced-colors"). */
const storySlug = (exportName) => slug(exportName.replace(/([a-z0-9])([A-Z])/g, "$1 $2"));

// 1. Lifecycle
check("contract is alpha", contract.status === "alpha", `status is "${contract.status}"`);

// 2. Required stories
const required = contract.requiredStories ?? [];
const missingStories = required.filter(
  (s) => !new RegExp(`export\\s+const\\s+${s}\\b`).test(stories),
);
check(
  "required stories exported",
  required.length > 0 && missingStories.length === 0,
  missingStories.length ? `missing: ${missingStories.join(", ")}` : `${required.join(", ")}`,
);
// validate:components requires these two at beta; checking here keeps the
// evidence step below honest (it only looks at the required stories).
const betaStories = ["Example", "ForcedColors"].filter((s) => !required.includes(s));
check(
  "requiredStories include Example and ForcedColors (beta rule)",
  betaStories.length === 0,
  `add ${betaStories.join(" and ")} to the stories and to contract.requiredStories`,
);

// 3. axe in tests
const testPath = join(dir, `${name}.test.tsx`);
const tests = existsSync(testPath) ? readFileSync(testPath, "utf8") : "";
check("tests assert axe", /toHaveNoViolations/.test(tests), existsSync(testPath) ? "" : "no test file");

// 4. Docs
check(
  "documentation",
  existsSync(join(dir, `${name}.mdx`)) || Boolean(contract.usage),
  "needs a colocated MDX page or contract usage",
);

// 5. Review record
const note = contract.a11y?.reviewedNote ?? "";
const noteDates = [...note.matchAll(/\b(20\d\d-\d\d-\d\d)\b/g)].map((m) => m[1]).sort();
let alphaSince = "";
try {
  alphaSince = execFileSync(
    "git",
    ["log", "-1", "--format=%cs", '-S"status": "alpha"', "--", relative(ROOT, contractPath)],
    { cwd: ROOT, encoding: "utf8" },
  ).trim();
} catch {
  /* no history: any dated note counts */
}
const latestNote = noteDates[noteDates.length - 1] ?? "";
check(
  "a11y review recorded",
  contract.a11y?.reviewed === true && latestNote !== "" && (!alphaSince || latestNote >= alphaSince),
  contract.a11y?.reviewed !== true
    ? "set a11y.reviewed after reviewing keyboard, ARIA, focus and motion"
    : !latestNote
      ? "a11y.reviewedNote needs a YYYY-MM-DD date and what was checked"
      : `latest dated note ${latestNote}, alpha since ${alphaSince || "unknown"}`,
);

// 6. Figma
const index = JSON.parse(readFileSync(join(HERE, "figma-component-index.json"), "utf8"));
const nodeMatch = typeof contract.figma === "string" && contract.figma.match(/node-id=(\d+)[-:](\d+)/);
const nodeId = nodeMatch ? `${nodeMatch[1]}-${nodeMatch[2]}` : null;
check(
  "figma resolves to a real component",
  Boolean(nodeId && index.components[nodeId]),
  nodeId ? (index.components[nodeId] ? index.components[nodeId].name : `${nodeId} not in figma-component-index.json`) : "no numeric node id",
);

// 7. Evidence
const titleMatch = stories.match(/title:\s*["'`]([^"'`]+)["'`]/);
const titleSlug = titleMatch ? slug(titleMatch[1]) : "";
const records = readEvidenceRecords(dir).filter(
  (r) => Object.values(r.checks ?? {}).every((c) => c?.passed === true) && isEvidenceFresh(dir, r),
);
const gaps = [];
for (const story of required) {
  const id = `${titleSlug}-${storySlug(story)}`;
  for (const mode of MODES) {
    if (!records.some((r) => r.storyId === id && r.mode === mode)) gaps.push(`${story}/${mode}`);
  }
}
check(
  "fresh passing evidence, every required story x light/dark/forced-colors",
  titleSlug !== "" && gaps.length === 0,
  gaps.length ? `missing or stale: ${gaps.join(", ")}` : "",
);
const criteria = deriveA11yCriteria(contract, { componentDir: dir });
const notAutomated = ["axe-no-violations", "accessibility-tree"]
  .map((id) => criteria.find((c) => c.id === id))
  .filter((c) => c && c.verificationMode !== "automated");
check(
  "axe + accessibility tree proven by evidence",
  notAutomated.length === 0,
  notAutomated.map((c) => `${c.id}: ${c.verificationMode}`).join(", "),
);

// Report
const failed = results.filter((r) => !r.ok);
console.log(`Promote ${name} alpha -> beta`);
for (const r of results) {
  console.log(`  ${r.ok ? "✓" : "✗"} ${r.label}${r.detail && !r.ok ? `: ${r.detail}` : r.detail ? ` (${r.detail})` : ""}`);
}
if (failed.length) {
  console.error(`\n✗ Not promoted: ${failed.length} check(s) failed. Fix them; nothing was changed.`);
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log("\n✓ Ready to promote (--check: nothing changed).");
  process.exit(0);
}

// Promote: only what the checks above proved.
const before = new Map(
  [contractPath, storiesPath, join(HERE, "alpha-age.baseline.json")].map((p) => [p, readFileSync(p, "utf8")]),
);
contract.status = "beta";
contract.lightDarkVerified = true;
contract.a11y.forcedColorsVerified = true;
writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);

const retagged = stories.replace(/(tags:\s*\[[^\]]*?)["']alpha["']/, '$1"beta"');
if (retagged !== stories) writeFileSync(storiesPath, retagged);

const baselinePath = join(HERE, "alpha-age.baseline.json");
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
if (baseline.legacyOverdue.includes(name)) {
  baseline.legacyOverdue = baseline.legacyOverdue.filter((n) => n !== name);
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
}

// Every other beta rule (Controls documentation, slots, tokens, docs) lives in
// validate:components. Run it on the result and roll back if this component
// fails, so promote never leaves a beta the pre-push gate would reject.
let validation = "";
try {
  validation = execFileSync("npx", ["tsx", join(HERE, "validate-components.ts")], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (err) {
  validation = `${err.stdout ?? ""}${err.stderr ?? ""}`;
}
const own = validation
  .split("\n")
  .filter((line) => line.includes("✗") && line.includes(`${name}.`));
if (own.length) {
  for (const [p, text] of before) writeFileSync(p, text);
  console.error(`\n✗ Not promoted: validate:components rejects ${name} at beta. Rolled back.`);
  for (const line of own) console.error(line);
  process.exit(1);
}

console.log(`\n✓ ${name} promoted to beta.`);
console.log("  Next: npm run build:tokens && npm run validate:components && npm run export:contract-spec, then commit.");
