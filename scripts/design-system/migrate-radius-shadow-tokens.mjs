#!/usr/bin/env node
/**
 * Radius + shadow token migration.
 *
 * Companion to semantic-token-codemod.mjs (which owns color). Two independent
 * passes over component CSS modules:
 *
 *  1. RADIUS: numeric border-radius literals -> --radius-* scale.
 *     Deterministic nearest-step mapping (ties round UP) against the tight
 *     scale {2:sm, 4:md, 8:lg, 16:xl}. 50% -> --radius-circle. Pill spellings
 *     (>=100px / 100rem / 999px / 9999px) -> --radius-full. Multi-value
 *     (e.g. "1rem 1rem 0 0") maps each length part. `0`, `inherit`, and values
 *     already using var() are left alone. Trailing !important is preserved.
 *
 *  2. SHADOW: box-shadow literals -> --shadow-* elevation ramp, by EXACT value
 *     match against SHADOW_MAP only. No fuzzy bucketing: focus rings
 *     (0 0 0 Npx), inset hairlines, var()/color-mix() values, `none`, and any
 *     value not in the dictionary are left untouched and reported. Trailing
 *     !important is preserved.
 *
 * Usage:
 *   node scripts/design-system/migrate-radius-shadow-tokens.mjs          # dry run + report
 *   node scripts/design-system/migrate-radius-shadow-tokens.mjs --apply
 */

import { readFileSync, writeFileSync, globSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
/** Lint scope: every CSS module under shared/ (radius has no brand-palette
 *  exemption, so case studies and story/doc CSS are included too). */
const SHARED = join(ROOT, "nextjs-app", "shared");
const COMPONENTS = SHARED; // report paths resolve from here
const APPLY = process.argv.includes("--apply");
const CHECK = process.argv.includes("--check");

/**
 * Intentional layered / composite drop-shadows that carry raw color literals by
 * design (bespoke depth stacks, colored handle shadows). Allowlisted so the
 * --check gate does not force them onto the elevation ramp. Normalized form.
 */
const ALLOWLIST_SHADOW = new Set([
  "0 22px 50px rgb(0 0 0 / 16%), 0 4px 18px rgb(0 0 0 / 8%)",
  "0 4px 6px rgb(0 0 0 / 10%), 0 10px 20px rgb(0 0 0 / 8%)",
  "0 1px 3px rgb(0 0 0 / 40%), 0 4px 12px rgb(0 0 0 / 30%)",
  "0 0 0 1px rgb(0 0 0 / 8%), 0 8px 24px rgb(15 23 42 / 12%)",
  "0 1px 2px rgb(0 0 0 / 8%), 0 1px 3px rgb(0 0 0 / 6%)",
  "0 2px 6px rgb(15 23 42 / 18%), 0 0 0 1px var(--switch-handle-ring-color, transparent)",
  "0 0 0 1px var(--color-border-light), 0 2px 4px rgb(0 0 0 / 12%)",
  "0 1px 3px 0 rgb(0 0 0 / 6%), 0 1px 2px -1px rgb(0 0 0 / 6%)",
  // Pedagogical tinted shadows in Storybook doc demos (not product surfaces).
  "0 4px 12px rgb(0 0 255 / 10%)",
  "0 10px 30px rgb(15 23 42 / 5%)",
  "0 12px 24px rgb(245 158 11 / 12%)",
  "0 6px 16px rgb(15 23 42 / 8%)",
]);

/**
 * A naked drop-shadow that should use the elevation ramp: has an offset+blur
 * (two consecutive px lengths), carries a raw color literal (rgb/rgba/hsl/hex),
 * is not an inset hairline, and is not allowlisted. Ring/spotlight values
 * (single px, e.g. "0 0 0 4px") and color-token values (color-mix/var, no raw
 * literal) are intentionally excluded.
 */
function isRawDropShadow(value) {
  const v = value.trim();
  const norm = normalize(v);
  if (norm.startsWith("inset")) return false;
  if (ALLOWLIST_SHADOW.has(norm)) return false;
  const hasBlur = /\d+px\s+\d+px/.test(norm);
  const hasRawColor = /rgba?\(|hsla?\(|#[0-9a-f]{3,8}\b/.test(norm);
  return hasBlur && hasRawColor;
}

/** Build artifacts never migrated. */
const EXCLUDE = [/\/dist\//];

/** Tight radius scale in px -> token step. Ties round up (softer). */
const RADIUS_STEPS = [
  [2, "--radius-sm"],
  [4, "--radius-md"],
  [8, "--radius-lg"],
  [16, "--radius-xl"],
];

/** Exact box-shadow value (normalized whitespace, lowercased) -> token. */
const SHADOW_MAP = new Map([
  ["0 1px 4px 0 rgb(0 0 0 / 3%)", "--shadow-sm"],
  ["0 1px 2px rgb(0 0 0 / 8%)", "--shadow-sm"],
  ["0 1px 2px rgb(0 0 0 / 4%)", "--shadow-sm"],
  ["0 1px 2px rgb(0 0 0 / 10%)", "--shadow-sm"],
  ["0 1px 2px rgb(0 0 0 / 12%)", "--shadow-sm"],
  ["0 1px 3px rgb(0 0 0 / 10%)", "--shadow-sm"],
  ["0 2px 4px rgb(0 0 0 / 10%)", "--shadow-sm"],
  ["0 2px 6px rgb(0 0 0 / 6%)", "--shadow-sm"],
  ["0 2px 6px rgb(0 0 0 / 20%)", "--shadow-sm"],
  ["0 0 2px rgb(0 0 0 / 10%)", "--shadow-sm"],
  ["0 2px 8px rgb(0 0 0 / 6%)", "--shadow-md"],
  ["0 2px 9px rgb(15 23 42 / 28%)", "--shadow-md"],
  ["0 3px 10px -2px rgb(0 0 0 / 10%)", "--shadow-md"],
  ["0 4px 6px rgb(0 0 0 / 10%)", "--shadow-md"],
  ["0 4px 8px rgb(0 0 0 / 15%)", "--shadow-md"],
  ["0 4px 12px rgb(0 0 0 / 15%)", "--shadow-md"],
  ["0 4px 12px rgb(0 0 0 / 10%)", "--shadow-md"],
  ["0 4px 16px rgb(0 0 0 / 12%)", "--shadow-md"],
  ["0 4px 20px rgb(0 0 0 / 15%)", "--shadow-md"],
  ["0 4px 24px rgb(0 0 0 / 10%)", "--shadow-lg"],
  ["0 8px 30px rgb(0 0 0 / 4%)", "--shadow-lg"],
  ["0 10px 30px rgb(0 0 0 / 8%)", "--shadow-lg"],
  ["0 12px 32px rgb(0 0 0 / 15%)", "--shadow-lg"],
  ["0 12px 36px rgb(0 0 0 / 5%)", "--shadow-lg"],
  ["0 12px 40px rgb(0 0 0 / 12%)", "--shadow-lg"],
  ["0 12px 40px rgb(0 0 0 / 30%)", "--shadow-lg"],
  ["0 18px 40px rgb(0 0 0 / 20%)", "--shadow-xl"],
  ["0 20px 60px rgb(0 0 0 / 12%)", "--shadow-xl"],
  ["0 20px 60px rgb(0 0 0 / 40%)", "--shadow-xl"],
  ["0 25px 60px rgb(0 0 0 / 15%)", "--shadow-xl"],
]);

const normalize = (v) => v.replace(/\s+/g, " ").trim().toLowerCase();

/** px value of a single length token, or null if not a plain length. */
function toPx(tok) {
  const m = /^(-?[\d.]+)(px|rem|em)?$/.exec(tok);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (m[2] === "rem" || m[2] === "em") return n * 16;
  return n; // bare number or px
}

/** Map one length part of a border-radius value to a token (or keep). */
function mapRadiusPart(tok) {
  if (tok === "0" || tok === "0px") return tok;
  if (tok === "50%") return "var(--radius-circle)";
  if (tok.startsWith("var(") || tok.endsWith("%")) return tok; // leave var() and non-50% %
  const px = toPx(tok);
  if (px == null) return tok;
  if (px >= 100) return "var(--radius-full)";
  // nearest step, ties round up
  let best = RADIUS_STEPS[0];
  let bestD = Infinity;
  for (const [v, name] of RADIUS_STEPS) {
    const d = Math.abs(px - v);
    if (d < bestD || (d === bestD && v > best[0])) {
      bestD = d;
      best = [v, name];
    }
  }
  return `var(${best[1]})`;
}

function migrate(css) {
  const report = { radius: [], shadow: [], skipped: [] };

  // RADIUS: border-radius + longhands (border-top-left-radius, logical
  // border-start-start-radius, ...). Not already fully var-based single value.
  css = css.replace(
    /(border(?:-[a-z]+)*-radius)\s*:\s*([^;}]+?)(\s*!important)?\s*;/g,
    (full, prop, value, bang) => {
      const v = value.trim();
      if (v.startsWith("var(") && !v.includes(" ")) return full; // single token, done
      const parts = v.split(/\s+/);
      const mapped = parts.map(mapRadiusPart);
      const out = mapped.join(" ");
      if (out === v) {
        if (!v.startsWith("var(")) report.skipped.push(`${prop}: ${v}`);
        return full;
      }
      report.radius.push(`${prop}: ${v}  ->  ${out}`);
      return `${prop}: ${out}${bang || ""};`;
    },
  );

  // SHADOW: box-shadow: <value>;  exact-match only
  css = css.replace(
    /box-shadow:\s*([^;}]+?)(\s*!important)?\s*;/g,
    (full, value, bang) => {
      const key = normalize(value);
      const token = SHADOW_MAP.get(key);
      if (!token) {
        const v = value.trim();
        if (!v.startsWith("var(") && v !== "none")
          report.skipped.push(`box-shadow: ${v}`);
        return full;
      }
      report.shadow.push(`${value.trim()}  ->  var(${token})`);
      return `box-shadow: var(${token})${bang || ""};`;
    },
  );

  return { css, report };
}

const files = globSync("**/*.module.css", { cwd: COMPONENTS }).filter(
  (f) => !EXCLUDE.some((re) => re.test("/" + f)),
);

if (CHECK) {
  const violations = [];
  for (const rel of files) {
    const abs = join(COMPONENTS, rel);
    const src = readFileSync(abs, "utf8");
    // Radius: any naked literal that would still migrate = violation.
    const { report } = migrate(src);
    report.radius.forEach((r) =>
      violations.push(`${relative(ROOT, abs)}  radius  ${r.split("  ->")[0]}`),
    );
    // Shadow: raw drop-shadow not on the elevation ramp / not allowlisted.
    for (const m of src.matchAll(/box-shadow:\s*([^;}]+?)(\s*!important)?\s*;/g)) {
      if (isRawDropShadow(m[1]))
        violations.push(`${relative(ROOT, abs)}  shadow  ${m[1].trim()}`);
    }
  }
  if (violations.length) {
    console.error(
      `\n✗ ${violations.length} naked radius/shadow value(s) — use --radius-* / --shadow-* tokens:\n`,
    );
    violations.forEach((v) => console.error(`  ${v}`));
    console.error(
      `\nRun: node scripts/design-system/migrate-radius-shadow-tokens.mjs --apply`,
    );
    console.error(
      `Intentional composite shadows go in ALLOWLIST_SHADOW in this script.`,
    );
    process.exit(1);
  }
  console.log("✓ radius + shadow tokens: no naked literals.");
  process.exit(0);
}

let rCount = 0;
let sCount = 0;
const skipped = new Map();

for (const rel of files) {
  const abs = join(COMPONENTS, rel);
  const src = readFileSync(abs, "utf8");
  const { css, report } = migrate(src);
  if (report.radius.length || report.shadow.length) {
    console.log(`\n${relative(ROOT, abs)}`);
    report.radius.forEach((r) => console.log(`  radius  ${r}`));
    report.shadow.forEach((s) => console.log(`  shadow  ${s}`));
    rCount += report.radius.length;
    sCount += report.shadow.length;
    if (APPLY && css !== src) writeFileSync(abs, css);
  }
  report.skipped.forEach((s) => skipped.set(s, (skipped.get(s) || 0) + 1));
}

console.log(`\n${"=".repeat(60)}`);
console.log(`radius migrated: ${rCount}   shadow migrated: ${sCount}`);
if (skipped.size) {
  console.log(`\nLeft for manual review (not in dictionary / not elevation):`);
  [...skipped.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([v, n]) => console.log(`  ${String(n).padStart(3)}x  ${v}`));
}
console.log(APPLY ? "\nAPPLIED." : "\nDRY RUN. Re-run with --apply to write.");
